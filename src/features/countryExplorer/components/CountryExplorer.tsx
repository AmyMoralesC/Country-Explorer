"use client";

/**
 * CountryExplorer.tsx
 *
 * Root layout component for the feature.
 * Responsibilities:
 *   - Fetch country data via useCountries (TanStack Query)
 *   - Read/write selected country and search query from Zustand store
 *   - Filter countries via useCountryFilter
 *   - Orchestrate the two-column layout: map (left) + info panel (right)
 *
 * This component only handles layout and state wiring.
 * All rendering logic lives in child components.
 */

import { useCountries } from "../hooks/useCountries";
import { useCountryFilter } from "../hooks/useCountryFilter";
import { useCountryStore } from "../store/countryStore";
import type { Country } from "../types/country.types";
import { WorldMap } from "./WorldMap";
import { SearchBar } from "./SearchBar";
import { CountryCard } from "./CountryCard";
import { EmptyState } from "./EmptyState";

export function CountryExplorer() {
  const { data: countries = [], isLoading, isError } = useCountries();
  const selectedCountry = useCountryStore((s) => s.selectedCountry);
  const searchQuery = useCountryStore((s) => s.searchQuery);
  const setSelectedCountry = useCountryStore((s) => s.setSelectedCountry);

  const filteredCountries = useCountryFilter({ countries, query: searchQuery });

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
  };

  return (
    <div className="flex flex-col h-screen bg-ui-bg">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 py-3 bg-ui-surface border-b border-ui-border shadow-card shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">🗺️</span>
          <h1 className="text-base font-bold text-ui-text-primary tracking-tight">
            Country Explorer
          </h1>
          <span className="text-xs text-ui-text-muted font-normal ml-1">
            — Demo
          </span>
        </div>
        {/* Country count badge */}
        {countries.length > 0 && (
          <span className="text-xs text-ui-text-muted font-mono">
            {filteredCountries.length} / {countries.length} countries
          </span>
        )}
      </header>

      {/* ── Main content ────────────────────────────────────────── */}
      <main className="flex flex-1 gap-4 p-4 min-h-0">
        {/* Left column: search + map */}
        <div className="flex flex-col flex-1 min-w-0 gap-3">
          {/* Search bar */}
          {isLoading ? (
            <SearchBarSkeleton />
          ) : (
            <SearchBar countries={countries} />
          )}

          {/* Map */}
          <div className="flex-1 min-h-0">
            {isLoading && <MapSkeleton />}
            {isError && <MapError />}
            {!isLoading && !isError && (
              <WorldMap
                countries={filteredCountries}
                selectedCountry={selectedCountry}
                onCountryClick={handleCountrySelect}
              />
            )}
          </div>
        </div>

        {/* Right column: info panel — fixed width, doesn't shrink */}
        <aside className="w-80 shrink-0 min-h-0">
          {selectedCountry ? (
            <CountryCard
              country={selectedCountry}
              allCountries={countries}
              onCountrySelect={handleCountrySelect}
            />
          ) : (
            <EmptyState />
          )}
        </aside>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton / error states
// ---------------------------------------------------------------------------

function SearchBarSkeleton() {
  return (
    <div className="h-10 rounded-xl bg-ui-border/40 animate-pulse" />
  );
}

function MapSkeleton() {
  return (
    <div className="w-full h-full rounded-xl bg-ui-border/30 animate-pulse flex items-center justify-center">
      <span className="text-sm text-ui-text-muted">Loading countries…</span>
    </div>
  );
}

function MapError() {
  return (
    <div className="w-full h-full rounded-xl border-2 border-dashed border-red-200 bg-red-50 flex flex-col items-center justify-center gap-2">
      <span className="text-2xl">⚠️</span>
      <p className="text-sm text-red-600 font-medium">Failed to load country data</p>
      <p className="text-xs text-red-400">Check your connection and reload the page</p>
    </div>
  );
}
