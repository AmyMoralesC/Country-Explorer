"use client";

/**
 * SearchBar.tsx
 *
 * Controlled search input connected to Zustand store.
 * The "Random" button selects a random country from the full list
 * and sets it as the selected country in global state.
 *
 * Accessibility:
 * - Input has an associated <label> (visually hidden via sr-only).
 * - The random button has an aria-label describing its action.
 * - Search icon is decorative (aria-hidden).
 */

import type { Country } from "../types/country.types";
import { useCountryStore } from "../store/countryStore";

interface SearchBarProps {
  countries: Country[];
}

export function SearchBar({ countries }: SearchBarProps) {
  const searchQuery = useCountryStore((s) => s.searchQuery);
  const setSearchQuery = useCountryStore((s) => s.setSearchQuery);
  const setSelectedCountry = useCountryStore((s) => s.setSelectedCountry);

  const handleRandom = () => {
    if (countries.length === 0) return;
    const index = Math.floor(Math.random() * countries.length);
    const randomCountry = countries[index];
    if (randomCountry) {
      setSelectedCountry(randomCountry);
      // Clear search so the user sees the full map, not a filtered view.
      setSearchQuery("");
    }
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      {/* Visually hidden label for screen readers */}
      <label htmlFor="country-search" className="sr-only">
        Search for a country
      </label>

      <div className="relative flex-1">
        {/* Search icon — purely decorative */}
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
          placeholder="Search by name, capital, or region…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ui-border bg-ui-surface text-ui-text-primary placeholder:text-ui-text-muted text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-ui-accent/30 focus:border-ui-accent transition-all"
        />

        {/* Clear button — only visible when there's a query */}
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

      {/* Random country button */}
      <button
        onClick={handleRandom}
        aria-label="Select a random country"
        title="Random country"
        disabled={countries.length === 0}
        className="flex items-center justify-center w-10 h-10 rounded-xl border border-ui-border bg-ui-surface text-ui-text-secondary shadow-card hover:bg-ui-accent hover:text-white hover:border-ui-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {/* Dice icon */}
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="3" strokeWidth={2} />
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
          <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" />
          <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" />
          <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}
