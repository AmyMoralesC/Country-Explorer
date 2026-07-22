"use client";

/**
 * WorldMap.tsx
 *
 * Renders an interactive SVG world map from GeoJSON path data.
 * All pan/zoom/gesture logic (mouse drag, wheel zoom, touch pan, pinch
 * zoom) lives in useMapInteraction — this component only wires that state
 * up to the actual <svg>/<path> markup.
 *
 * Key decisions:
 * - A single <svg> with a transformable inner <g> keeps all coordinate
 *   math in screen space — no re-projection needed on zoom/pan.
 * - Each country (even MultiPolygon island nations) is one <path> element.
 * - The selected country gets a red fill + stroke per the wireframe spec.
 * - ALL countries are always rendered (from the full `countries` list), even
 *   while searching — matches from `visibleCountries` stay normal, and
 *   everything else gets dimmed. This is what makes the "live filter" effect
 *   possible: the map never re-mounts paths, it just re-styles them.
 */

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import type { Country, GeoJsonData, GeoJsonFeature } from "../types/country.types";
import { geometryToPath, MAP_WIDTH, MAP_HEIGHT } from "../utils/projection";
import { useMapInteraction } from "../hooks/useMapInteraction";
import { ZoomControls } from "./ZoomControls";
import { MapGridLines } from "./MapGridLines";

interface WorldMapProps {
  /** Full country list — used to resolve a clicked path to a Country. */
  countries: Country[];
  /** Countries that match the current search query (or all, if no query). */
  visibleCountries: Country[];
  /** True whenever the search box has text — controls the dimmed styling. */
  isSearchActive: boolean;
  selectedCountry: Country | null;
  onCountryClick: (country: Country) => void;
}

export function WorldMap({
  countries,
  visibleCountries,
  isSearchActive,
  selectedCountry,
  onCountryClick,
}: WorldMapProps) {
  const [geoData, setGeoData] = useState<GeoJsonData | null>(null);
  const { zoom, pan, isDragging, svgRef, zoomIn, zoomOut, reset, handlers } = useMapInteraction();

  // O(1) lookup: cca3 → Country, rebuilt only when the full list changes
  const countryByCca3 = useRef<Map<string, Country>>(new Map());
  useEffect(() => {
    countryByCca3.current = new Map(countries.map((c) => [c.cca3, c]));
  }, [countries]);

  // O(1) membership check for "does this country match the search?"
  const visibleCca3Set = useMemo(
    () => new Set(visibleCountries.map((c) => c.cca3)),
    [visibleCountries]
  );

  // Fetch GeoJSON from /public — static, never changes, cached by the browser
  useEffect(() => {
    fetch("/world.geojson")
      .then((res) => res.json())
      .then((data: unknown) => setGeoData(data as GeoJsonData))
      .catch((err) => console.error("Failed to load GeoJSON:", err));
  }, []);

  // Note: we key/match on ADM0_A3, not ISO_A3. The Natural Earth 110m dataset
  // leaves ISO_A3 as the placeholder "-99" for several countries (France,
  // Norway, Kosovo, etc.) because those entries have dependent territories.
  // ADM0_A3 is populated for every feature and matches REST Countries' cca3
  // for all standard sovereign nations, so it's the reliable join key.
  const handleCountryClick = useCallback((feature: GeoJsonFeature) => {
    const admCode = feature.properties.ADM0_A3 as string;
    const country = countryByCca3.current.get(admCode);
    if (country) onCountryClick(country);
  }, [onCountryClick]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-map-ocean shadow-panel">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className={`w-full h-full touch-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        {...handlers}
        aria-label="Interactive world map"
        role="img"
      >
        <MapGridLines />

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {geoData?.features.map((feature, index) => {
            const admCode = feature.properties.ADM0_A3 as string;
            const isSelected = selectedCountry?.cca3 === admCode;

            // A country is "dimmed" when a search is active AND it's not
            // among the current matches. The selected country always stays
            // visually prominent, even if it wouldn't currently match — this
            // avoids a jarring flash if a user clears/edits the search after
            // selecting a country.
            const isDimmed =
              isSearchActive && !visibleCca3Set.has(admCode) && !isSelected;

            let fillClass = "fill-map-land stroke-map-border hover:fill-map-hover";
            if (isSelected) {
              fillClass = "fill-map-selected stroke-red-700";
            } else if (isDimmed) {
              fillClass = "fill-map-dim stroke-map-dim-border";
            }

            return (
              <path
                key={`${admCode}-${index}`}
                d={geometryToPath(feature.geometry)}
                className={`
                  outline-none transition-colors duration-150
                  focus-visible:stroke-ui-accent
                  ${fillClass}
                `}
                style={{ opacity: isDimmed ? 0.45 : 1 }}
                strokeWidth={isSelected ? 1.5 / zoom : 0.5 / zoom}
                // Dimmed countries are visually "blocked" and not clickable
                // while a search is narrowing the results — this reinforces
                // the live-filter feedback the person asked for.
                onClick={isDimmed ? undefined : () => handleCountryClick(feature)}
                aria-label={feature.properties.NAME}
                aria-disabled={isDimmed}
                role="button"
                tabIndex={isDimmed ? -1 : 0}
                onKeyDown={(e) => {
                  if (!isDimmed && (e.key === "Enter" || e.key === " ")) {
                    handleCountryClick(feature);
                  }
                }}
              />
            );
          })}
        </g>

        {!geoData && (
          <text x={MAP_WIDTH / 2} y={MAP_HEIGHT / 2} textAnchor="middle"
            className="fill-ui-text-secondary text-sm">
            Loading map…
          </text>
        )}
      </svg>

      <ZoomControls zoom={zoom} onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={reset} />
    </div>
  );
}