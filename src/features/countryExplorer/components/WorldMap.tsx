"use client";

/**
 * Renders an interactive SVG world map from GeoJSON path data.
 * All pan/zoom/gesture logic (mouse drag, wheel zoom, touch pan, pinch
 * zoom) lives in useMapInteraction — this component wires that state up
 * to the markup, and precomputes each country's <path> "d" string once
 * (see pathData below) so pan/zoom updates don't recompute geometry.
 */

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import type { Country, GeoJsonData } from "../types/country.types";
import { geometryToPath, MAP_WIDTH, MAP_HEIGHT } from "../utils/projection";
import { useMapInteraction } from "../hooks/useMapInteraction";
import { ZoomControls } from "./ZoomControls";
import { MapGridLines } from "./MapGridLines";
import { CountryPath } from "./CountryPath";

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

  // Precompute each country's "d" path string ONCE, when geoData loads —
  // not on every pan/zoom re-render.
  const pathData = useMemo(() => {
    if (!geoData) return [];
    return geoData.features.map((feature) => ({
      admCode: feature.properties.ADM0_A3 as string,
      name: feature.properties.NAME,
      d: geometryToPath(feature.geometry),
    }));
  }, [geoData]);

  const handleCountrySelect = useCallback((admCode: string) => {
    const country = countryByCca3.current.get(admCode);
    if (country) onCountryClick(country);
  }, [onCountryClick]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-map-ocean shadow-panel">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className={`w-full h-full touch-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ touchAction: "none" }}
        {...handlers}
        aria-label="Interactive world map"
        role="img"
      >
        <MapGridLines />

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {pathData.map(({ admCode, name, d }, index) => {
            const isSelected = selectedCountry?.cca3 === admCode;
            const isDimmed = isSearchActive && !visibleCca3Set.has(admCode) && !isSelected;

            return (
              <CountryPath
                key={`${admCode}-${index}`}
                admCode={admCode}
                d={d}
                name={name}
                isSelected={isSelected}
                isDimmed={isDimmed}
                zoom={zoom}
                onSelect={handleCountrySelect}
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