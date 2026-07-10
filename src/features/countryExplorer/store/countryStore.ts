/**
 * countryStore.ts
 *
 * Global UI state managed by Zustand.
 *
 * Why Zustand here instead of React Context?
 * - No Provider wrapping needed — any component can subscribe directly.
 * - Zustand only re-renders components that consume the piece of state
 *   that changed (selector-based subscriptions).
 * - Zero boilerplate compared to useReducer + Context.
 *
 * What lives here vs in TanStack Query?
 * - TanStack Query  → server state (API data, cache, loading/error).
 * - Zustand         → UI state (which country is selected, search text).
 */

import { create } from "zustand";
import type { Country } from "../types/country.types";

interface CountryState {
  // The country the user has clicked on the map or selected via search.
  selectedCountry: Country | null;

  // Current value of the search input.
  searchQuery: string;

  // Actions — defined inline so the store is self-contained.
  setSelectedCountry: (country: Country | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useCountryStore = create<CountryState>((set) => ({
  selectedCountry: null,
  searchQuery: "",

  setSelectedCountry: (country) => set({ selectedCountry: country }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
