"use client";

/**
 * BordersList.tsx
 *
 * Shows the border countries of the selected country as small clickable cards.
 * - Starts collapsed at MAX_VISIBLE (3) borders.
 * - "Show more" expands to show all borders.
 * - Clicking a border card selects that country.
 *
 * Props:
 *   borderCodes — cca3 codes from the selected country (e.g. ["NIC", "PAN"])
 *   allCountries — the full country list, used to resolve codes → Country objects
 *   onSelect     — called when the user clicks a border country
 */

import { useState } from "react";
import type { Country } from "../types/country.types";

const MAX_VISIBLE = 3;

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
        No land borders (island nation or territory)
      </div>
    );
  }

  // Resolve border codes → Country objects (some codes may not be in our list)
  const borderCountries = borderCodes
    .map((code) => allCountries.find((c) => c.cca3 === code))
    .filter((c): c is Country => c !== undefined);

  const visible = expanded ? borderCountries : borderCountries.slice(0, MAX_VISIBLE);
  const hiddenCount = borderCountries.length - MAX_VISIBLE;

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ui-text-muted mb-2">
        Borders
      </h3>

      <div className="flex flex-wrap gap-2">
        {visible.map((country) => (
          <button
            key={country.cca3}
            onClick={() => onSelect(country)}
            aria-label={`Select ${country.commonName}`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-ui-border bg-ui-bg hover:bg-ui-accent/10 hover:border-ui-accent/40 transition-all text-sm"
          >
            <span className="text-base leading-none">{country.flag}</span>
            <span className="font-mono text-xs text-ui-text-secondary">{country.cca3}</span>
            <span className="text-ui-text-primary text-xs">{country.commonName}</span>
          </button>
        ))}

        {/* Expand/collapse toggle — only shown when there are hidden borders */}
        {borderCountries.length > MAX_VISIBLE && (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="px-2.5 py-1.5 rounded-lg border border-dashed border-ui-border text-xs text-ui-text-muted hover:text-ui-accent hover:border-ui-accent transition-all"
          >
            {expanded ? "Show less" : `+${hiddenCount} more`}
          </button>
        )}
      </div>
    </div>
  );
}
