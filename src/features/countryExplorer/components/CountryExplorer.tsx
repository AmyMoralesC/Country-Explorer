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

import { useEffect } from "react";
import { useCountries } from "../hooks/useCountries";
import { useCountryFilter } from "../hooks/useCountryFilter";
import { useCountryStore } from "../store/countryStore";
import type { Country } from "../types/country.types";
import { WorldMap } from "./WorldMap";
import { SearchBar } from "./SearchBar";
import { CountryCard } from "./CountryCard";
import { EmptyState } from "./EmptyState";
import { DarkModeToggle } from "./DarkModeToggle";

const PANEL_WIDTH = "w-[400px]";

export function CountryExplorer() {
  const { data: countries = [], isLoading, isError } = useCountries();
  const selectedCountry = useCountryStore((s) => s.selectedCountry);
  const searchQuery = useCountryStore((s) => s.searchQuery);
  const setSelectedCountry = useCountryStore((s) => s.setSelectedCountry);

  const filteredCountries = useCountryFilter({ countries, query: searchQuery });

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
  };

  // Keep the selection in sync with the search: if the person types a query
  // that no longer includes the currently selected country, clear the
  // selection. This avoids the confusing state of a red-highlighted country
  // on the map that doesn't match what's in the search box. If the selected
  // country IS still among the matches (or the search is empty), we leave
  // it selected — searching "co" while Mexico is selected should keep Mexico.
  useEffect(() => {
    if (!selectedCountry) return;
    if (searchQuery.trim().length === 0) return;

    const stillMatches = filteredCountries.some((c) => c.cca3 === selectedCountry.cca3);
    if (!stillMatches) {
      setSelectedCountry(null);
    }
  }, [searchQuery, filteredCountries, selectedCountry, setSelectedCountry]);

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
        <DarkModeToggle />
      </header>

      {/* ── Main content ────────────────────────────────────────── */}
      <main className="flex flex-1 min-h-0">
        {/* Left column: search + map — keeps its own padding/rounded corners */}
        <div className="flex flex-col flex-1 min-w-0 gap-3 p-4">
          {isLoading ? (
            <SearchBarSkeleton />
          ) : (
            <SearchBar countries={countries} filteredCountries={filteredCountries} />
          )}

          <div className="flex-1 min-h-0">
            {isLoading && <MapSkeleton />}
            {isError && <MapError />}
            {!isLoading && !isError && (
              <WorldMap
                countries={countries}
                visibleCountries={filteredCountries}
                isSearchActive={searchQuery.trim().length > 0}
                selectedCountry={selectedCountry}
                onCountryClick={handleCountrySelect}
              />
            )}
          </div>
        </div>

        {/* Right column: info panel — flush against top/right/bottom, only
            a left border separates it from the map (per design spec). */}
        <aside className={`${PANEL_WIDTH} shrink-0 h-full border-l border-ui-border bg-ui-surface overflow-y-auto`}>
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
    <div className="w-full h-full rounded-xl border-2 border-dashed border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 flex flex-col items-center justify-center gap-2">
      <span className="text-2xl">⚠️</span>
      <p className="text-sm text-red-600 dark:text-red-400 font-medium">Failed to load country data</p>
      <p className="text-xs text-red-400 dark:text-red-500">Check your connection and reload the page</p>
    </div>
  );
}