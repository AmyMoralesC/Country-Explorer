"use client";

/**
 * SearchBar.tsx
 *
 * Search input + Random button + Clear selection button.
 *
 * Controlled search input connected to Zustand store.
 * - Typing filters the map in real time (grays out non-matches).
 * - Enter key still works but isn't required (UX improvement).
 * - The "Random" button selects a random country from the full list.
 * - The "Clear" button deselects the currently selected country.
 *
 * Accessibility:
 * - Input has an associated <label> (visually hidden via sr-only).
 * - Both action buttons have aria-labels describing their purpose.
 * - Search icon is decorative (aria-hidden).
 */

import type { Country } from "../types/country.types";
import { useCountryStore } from "../store/countryStore";

interface SearchBarProps {
  countries: Country[];
  filteredCountries: Country[];
}

export function SearchBar({ countries, filteredCountries }: SearchBarProps) {
  const searchQuery = useCountryStore((s) => s.searchQuery);
  const setSearchQuery = useCountryStore((s) => s.setSearchQuery);
  const selectedCountry = useCountryStore((s) => s.selectedCountry);
  const setSelectedCountry = useCountryStore((s) => s.setSelectedCountry);

  const handleRandom = () => {
    if (countries.length === 0) return;
    const index = Math.floor(Math.random() * countries.length);
    const randomCountry = countries[index];
    if (randomCountry) {
      setSelectedCountry(randomCountry);
      setSearchQuery("");
    }
  };

  const handleClear = () => {
    setSelectedCountry(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const topMatch = filteredCountries[0];
    if (topMatch) {
      setSelectedCountry(topMatch);
    }
  };

  return (
    <div className="flex items-center gap-2 mb-2 mt-1">
      <label htmlFor="country-search" className="sr-only">
        Search for a country
      </label>

      <div className="relative flex-1">
        {/* Search icon */}
        <svg
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ui-text-muted pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <input
          id="country-search"
          type="text"
          placeholder="Search by country name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ui-border bg-ui-surface text-ui-text-primary placeholder:text-ui-text-muted text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-ui-accent/30 focus:border-ui-accent transition-all"
        />

        {/* Clear search button */}
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ui-text-muted hover:text-ui-text-primary transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Random country button — dice icon: black in light+idle, white
          whenever hovering OR in dark mode (both put it on a dark bg) */}
      <button
        onClick={handleRandom}
        aria-label="Select a random country"
        title="Random country"
        disabled={countries.length === 0}
        className="group flex items-center justify-center shrink-0 w-10 h-10 rounded-xl border border-ui-border bg-ui-surface text-ui-text-secondary shadow-card hover:bg-ui-accent hover:border-ui-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <img
          src="/icons/dice_black.png"
          alt="Random"
          className="w-5 h-5 dark:hidden group-hover:hidden"
        />
        <img
          src="/icons/dice_white.png"
          alt="Random"
          className="w-5 h-5 hidden dark:block group-hover:block"
        />
      </button>

      {/* Clear selection button */}
      {selectedCountry && (
        <button
          onClick={handleClear}
          aria-label="Deselect current country"
          title="Clear selection"
          className="flex items-center justify-center shrink-0 w-10 h-10 rounded-xl border border-ui-border bg-ui-surface text-ui-text-secondary shadow-card hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 transition-all"
        >
          {/* X icon */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}