"use client";

/**
 * BordersList.tsx
 *
 * Shows the border countries of the selected country as small square
 * cards (flag on top, country code below) — matching the original
 * wireframe's "cuadritos" layout.
 * - Starts collapsed at MAX_VISIBLE (4) borders.
 * - A "+n more" card expands to show the rest; "Show less" collapses again.
 * - Clicking a border card selects that country.
 */

import { useState } from "react";
import type { Country } from "../types/country.types";

const MAX_VISIBLE = 4;

interface BordersListProps {
  borderCodes: string[];
  allCountries: Country[];
  onSelect: (country: Country) => void;
}

export function BordersList({ borderCodes, allCountries, onSelect }: BordersListProps) {
  const [expanded, setExpanded] = useState(false);

  if (borderCodes.length === 0) {
    return (
      <div className="text-sm text-ui-text-muted italic">
        No land borders (island nation or territory).
      </div>
    );
  }

  const borderCountries = borderCodes
    .map((code) => allCountries.find((c) => c.cca3 === code))
    .filter((c): c is Country => c !== undefined);

  const visible = expanded ? borderCountries : borderCountries.slice(0, MAX_VISIBLE);
  const hiddenCount = borderCountries.length - MAX_VISIBLE;
  const hasMore = borderCountries.length > MAX_VISIBLE;

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ui-text-muted mb-2">
        Borders
      </h3>

      <div className="grid grid-cols-4 gap-2">
        {visible.map((country) => (
          <button
            key={country.cca3}
            onClick={() => onSelect(country)}
            aria-label={`Select ${country.commonName}`}
            className="flex flex-col items-center gap-1 p-4 rounded-lg border border-ui-border bg-ui-bg hover:bg-ui-accent/10 hover:border-ui-accent/40 transition-all"
          >
            <img
              src={country.flagPng}
              alt=""
              aria-hidden="true"
              className="w-full h-8 object-cover rounded"
            />
            <span className="py-1 font-mono text-[13px] text-ui-text-secondary">
              {country.cca3}
            </span>
          </button>
        ))}

        {/* Expand toggle — same square footprint as a border card */}
        {hasMore && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="flex flex-col items-center justify-center p-2 rounded-lg border border-dashed border-ui-border text-ui-text-muted hover:text-ui-accent hover:border-ui-accent transition-all"
          >
            <span className="text-xs font-semibold">+{hiddenCount}</span>
            <span className="text-[10px]">more</span>
          </button>
        )}
      </div>

      {/* Collapse toggle — full width below the grid once expanded */}
      {expanded && hasMore && (
        <button
          onClick={() => setExpanded(false)}
          className="w-full mt-2 py-1.5 rounded-lg border border-dashed border-ui-border text-xs text-ui-text-muted hover:text-ui-accent hover:border-ui-accent transition-all"
        >
          Show less
        </button>
      )}
    </div>
  );
}