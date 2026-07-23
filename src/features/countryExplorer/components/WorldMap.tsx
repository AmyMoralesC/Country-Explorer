"use client";

/**
 * Renders an interactive SVG world map from GeoJSON path data.
 * All pan/zoom/gesture logic (mouse drag, wheel zoom, touch pan, pinch
 * zoom) lives in useMapInteraction — this component only wires that state
 * up to the actual <svg>/<path> markup.
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

  // lookup: cca3 → Country, rebuilt only when the full list changes
  const countryByCca3 = useRef<Map<string, Country>>(new Map());
  useEffect(() => {
    countryByCca3.current = new Map(countries.map((c) => [c.cca3, c]));
  }, [countries]);

  // membership check for "does this country match the search?"
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