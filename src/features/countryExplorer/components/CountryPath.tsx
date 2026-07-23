"use client";

/**
 * A single country's <path> on the map, wrapped in React.memo.
 */

import { memo } from "react";

interface CountryPathProps {
  admCode: string;
  d: string;
  name: string;
  isSelected: boolean;
  isDimmed: boolean;
  zoom: number;
  onSelect: (admCode: string) => void;
}

function CountryPathComponent({ admCode, d, name, isSelected, isDimmed, zoom, onSelect }: CountryPathProps) {
  let fillClass = "fill-map-land stroke-map-border hover:fill-map-hover";
  if (isSelected) {
    fillClass = "fill-map-selected stroke-red-700";
  } else if (isDimmed) {
    fillClass = "fill-map-dim stroke-map-dim-border";
  }

  return (
    <path
      d={d}
      className={`outline-none transition-colors duration-150 focus-visible:stroke-ui-accent ${fillClass}`}
      style={{ opacity: isDimmed ? 0.45 : 1 }}
      strokeWidth={isSelected ? 1.5 / zoom : 0.5 / zoom}
      // Dimmed countries are visually "blocked" and not clickable while a
      // search is narrowing the results.
      onClick={isDimmed ? undefined : () => onSelect(admCode)}
      aria-label={name}
      aria-disabled={isDimmed}
      role="button"
      tabIndex={isDimmed ? -1 : 0}
      onKeyDown={(e) => {
        if (!isDimmed && (e.key === "Enter" || e.key === " ")) onSelect(admCode);
      }}
    />
  );
}

export const CountryPath = memo(CountryPathComponent);