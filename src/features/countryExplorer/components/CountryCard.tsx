"use client";

/**
 * CountryCard.tsx
 *
 * The info panel's content for the currently selected country.
 * Pure composition — each visual block lives in its own component:
 *   CountryImage  → Wikipedia hero photo (flag fallback)
 *   CountryHeader → flag, names, region, code badge
 *   InfoRow       → capital / timezones / calling code / languages /
 *                    demonym / population (icon + label + value rows)
 *   StatBox       → currency, GINI, coordinates, area (2x2 grid)
 *   BordersList   → neighboring countries as small cards
 *
 * No rounded corners or shadow at the root — the parent <aside> in
 * CountryExplorer is the flush-edged container now; this component just
 * fills it.
 */

import type { Country } from "../types/country.types";
import { CountryImage } from "./CountryImage";
import { CountryHeader } from "./CountryHeader";
import { BordersList } from "./BordersList";
import { InfoRow } from "./InfoRow";
import { StatBox } from "./StatBox";
import {
  formatPopulation,
  formatArea,
  formatCoordinates,
} from "../utils/formatters";

interface CountryCardProps {
  country: Country;
  allCountries: Country[];
  onCountrySelect: (country: Country) => void;
}

export function CountryCard({ country, allCountries, onCountrySelect }: CountryCardProps) {
  const primaryCurrency = country.currencies[0];
  const currencyDisplay = primaryCurrency
    ? `${primaryCurrency.symbol} ${primaryCurrency.code}`
    : "N/A";

  return (
    <div className="h-full flex flex-col">
      <CountryImage countryName={country.commonName} flagFallbackSrc={country.flagPng} />

      <div className="p-5 flex flex-col gap-4">
        <CountryHeader country={country} />

        <div className="border-t border-ui-border/60" />

        {/* Core info rows */}
        <div>
          <InfoRow icon="government" label="Capital" value={country.capital} />
          <InfoRow icon="timezone" label="Timezones" value={country.timezones.join(", ")} />
          <InfoRow icon="calling_code" label="Calling code" value={country.callingCode} />
          <InfoRow icon="language" label="Languages" value={country.languages.join(", ")} />
          <InfoRow icon="demonym" label="Demonym" value={country.demonym} />
          <InfoRow icon="people" label="Population" value={formatPopulation(country.population)} />
        </div>

        {/* Currency + GINI */}
        <div className="grid grid-cols-2 gap-2">
          <StatBox icon="coins" label="Currency" value={currencyDisplay} />
          <StatBox
            icon="gini"
            label="Gini index"
            value={country.gini !== null ? country.gini.toFixed(1) : "N/A"}
          />
        </div>

        {/* Coordinates + Area */}
        <div className="grid grid-cols-2 gap-2">
          <StatBox icon="coordinates" label="Coordinates" value={formatCoordinates(country.latlng)} />
          <StatBox icon="area" label="Area" value={formatArea(country.area)} />
        </div>

        <div className="border-t border-ui-border/60" />

        <BordersList
          borderCodes={country.borders}
          allCountries={allCountries}
          onSelect={onCountrySelect}
        />
      </div>
    </div>
  );
}