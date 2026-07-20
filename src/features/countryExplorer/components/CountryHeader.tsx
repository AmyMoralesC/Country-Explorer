/**
 * CountryHeader.tsx
 *
 * The identity block at the top of the info panel's content: flag, common
 * name, official name, region/subregion, and the country code badge in
 * the top-right corner. Extracted from CountryCard so that component
 * stays focused on layout/composition rather than markup detail.
 */

import type { Country } from "../types/country.types";

interface CountryHeaderProps {
  country: Country;
}

export function CountryHeader({ country }: CountryHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      <img
        src={country.flagPng}
        alt={`Flag of ${country.commonName}`}
        className="w-20 h-14 object-cover rounded-md shadow-card border border-ui-border shrink-0"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-ui-text-primary leading-tight truncate">
              {country.commonName}
            </h2>
            <p className="text-xs text-ui-text-muted mt-0.5 line-clamp-2">
              {country.officialName}
            </p>
          </div>

          <span className="text-xs font-mono bg-ui-bg border border-ui-border rounded px-1.5 py-0.5 text-ui-text-secondary shrink-0">
            {country.cca2}
          </span>
        </div>

        <p className="text-xs text-ui-text-muted mt-1">
          {country.region}
          {country.subregion !== "N/A" && ` · ${country.subregion}`}
        </p>
      </div>
    </div>
  );
}