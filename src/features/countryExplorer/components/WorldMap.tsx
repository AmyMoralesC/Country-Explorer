"use client";

/**
 * WorldMap.tsx
 *
 * Renders an interactive SVG world map from GeoJSON path data.
 * Supports pan (drag) and wheel zoom via CSS transform on a <g> group.
 *
 * Key decisions:
 * - A single <svg> with a transformable inner <g> keeps all coordinate
 *   math in screen space — no re-projection needed on zoom/pan.
 * - Each country (even MultiPolygon island nations) is one <path> element.
 * - The selected country gets a red fill + stroke per the wireframe spec.
 */

import { useRef, useState, useCallback, useEffect } from "react";
import type { Country, GeoJsonData, GeoJsonFeature } from "../types/country.types";
import { geometryToPath, MAP_WIDTH, MAP_HEIGHT } from "../utils/projection";
import { ZoomControls } from "./ZoomControls";
import { MapGridLines } from "./MapGridLines";

interface WorldMapProps {
  countries: Country[];
  selectedCountry: Country | null;
  onCountryClick: (country: Country) => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const ZOOM_STEP = 0.001;

export function WorldMap({ countries, selectedCountry, onCountryClick }: WorldMapProps) {
  const [geoData, setGeoData] = useState<GeoJsonData | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // O(1) lookup: cca3 → Country, rebuilt only when countries list changes
  const countryByCca3 = useRef<Map<string, Country>>(new Map());
  useEffect(() => {
    countryByCca3.current = new Map(countries.map((c) => [c.cca3, c]));
  }, [countries]);

  // Fetch GeoJSON from /public — static, never changes, cached by the browser
  useEffect(() => {
    fetch("/world.geojson")
      .then((res) => res.json())
      .then((data: unknown) => setGeoData(data as GeoJsonData))
      .catch((err) => console.error("Failed to load GeoJSON:", err));
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    setZoom((prev) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev - e.deltaY * ZOOM_STEP)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleCountryClick = useCallback((feature: GeoJsonFeature) => {
    const country = countryByCca3.current.get(feature.properties.ISO_A3);
    if (country) onCountryClick(country);
  }, [onCountryClick]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-map-ocean shadow-panel">
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className={`w-full h-full ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        aria-label="Interactive world map"
        role="img"
      >
        <MapGridLines />

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {geoData?.features.map((feature) => {
            const isSelected = selectedCountry?.cca3 === feature.properties.ISO_A3;
            return (
              <path
                key={feature.properties.ISO_A3}
                d={geometryToPath(feature.geometry)}
                className={`transition-colors duration-150 ${
                  isSelected
                    ? "fill-map-selected stroke-red-700"
                    : "fill-map-land stroke-map-border hover:fill-map-hover"
                }`}
                strokeWidth={isSelected ? 1.5 / zoom : 0.5 / zoom}
                onClick={() => handleCountryClick(feature)}
                aria-label={feature.properties.NAME}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleCountryClick(feature);
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

      <ZoomControls
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(MAX_ZOOM, z + 0.5))}
        onZoomOut={() => setZoom((z) => Math.max(MIN_ZOOM, z - 0.5))}
        onReset={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
      />
    </div>
  );
}
