"use client";

/**
 * CountryCard.tsx
 *
 * Displays detailed information for the selected country.
 * Uses a blurred flag image as a decorative background (CountryImageBg pattern).
 *
 * Layout (matching wireframe):
 *   - Header: flag emoji + code + region / subregion
 *   - Coordinates + Area (2-col grid)
 *   - Borders list (clickable)
 *   - Info rows: capital, timezone, calling code, languages
 *   - Footer grid: population, currency, demonym, Gini
 */

import type { Country } from "../types/country.types";
import { BordersList } from "./BordersList";
import { InfoRow } from "./InfoRow";
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
    // Outer wrapper — blurred flag image as background
    <div className="relative h-full rounded-xl overflow-hidden shadow-panel">
      {/* Background: blurred flag image */}
      <img
        src={country.flagPng}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-15 scale-110"
      />

      {/* Frosted glass overlay — the actual content panel */}
      <div className="relative z-10 h-full overflow-y-auto p-5 bg-ui-surface/85 backdrop-blur-sm">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 mb-4">
          <img
            src={country.flagPng}
            alt={`Flag of ${country.commonName}`}
            className="w-14 h-10 object-cover rounded-md shadow-card border border-ui-border shrink-0"
          />
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-ui-text-primary leading-tight truncate">
              {country.commonName}
            </h2>
            <p className="text-xs text-ui-text-muted mt-0.5 line-clamp-2">
              {country.officialName}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-mono bg-ui-bg border border-ui-border rounded px-1.5 py-0.5 text-ui-text-secondary">
                {country.cca2}
              </span>
              <span className="text-xs text-ui-text-muted">
                {country.region}
                {country.subregion !== "N/A" && ` · ${country.subregion}`}
              </span>
            </div>
          </div>
        </div>

        {/* ── Coordinates + Area ──────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <StatBox
            label="Coordinates"
            value={formatCoordinates(country.latlng)}
            icon="📍"
          />
          <StatBox
            label="Area"
            value={formatArea(country.area)}
            icon="📐"
          />
        </div>

        {/* ── Borders ─────────────────────────────────────────────── */}
        <section className="mb-4">
          <BordersList
            borderCodes={country.borders}
            allCountries={allCountries}
            onSelect={onCountrySelect}
          />
        </section>

        {/* ── Info rows ───────────────────────────────────────────── */}
        <div className="mb-4">
          <InfoRow label="Capital" value={country.capital} icon="🏛️" />
          <InfoRow label="Timezones" value={country.timezones.join(", ")} icon="🕐" />
          <InfoRow label="Calling code" value={country.callingCode} icon="📞" />
          <InfoRow label="Languages" value={country.languages.join(", ")} icon="💬" />
        </div>

        {/* ── Footer grid: stats ──────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2">
          <StatBox
            label="Population"
            value={formatPopulation(country.population)}
            icon="👥"
          />
          <StatBox
            label="Currency"
            value={currencyDisplay}
            icon="💱"
          />
          <StatBox
            label="Demonym"
            value={country.demonym}
            icon="🧑"
          />
          <StatBox
            label="Gini index"
            value={country.gini !== null ? country.gini.toFixed(1) : "N/A"}
            icon="📊"
          />
        </div>
      </div>
    </div>
  );
}

// Small stat box — used for the grid sections
interface StatBoxProps {
  label: string;
  value: string;
  icon: string;
}

function StatBox({ label, value, icon }: StatBoxProps) {
  return (
    <div className="flex flex-col gap-0.5 p-2.5 rounded-lg bg-ui-bg border border-ui-border">
      <span className="text-[10px] uppercase tracking-wider text-ui-text-muted flex items-center gap-1">
        <span aria-hidden="true">{icon}</span>
        {label}
      </span>
      <span className="text-sm font-semibold text-ui-text-primary leading-tight">
        {value}
      </span>
    </div>
  );
}
