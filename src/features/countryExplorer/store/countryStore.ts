/**
 * Global UI state managed by Zustand.
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
