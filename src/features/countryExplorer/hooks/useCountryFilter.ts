/**
 * useCountryFilter.ts
 *
 * Encapsulates search filtering logic.
 *
 * Why a custom hook instead of inline useMemo in the component?
 * - The component stays focused on rendering, not business logic.
 * - The filter logic is independently testable (see __tests__).
 * - If we add more filter criteria later, this is the only file to touch.
 */

import { useMemo } from "react";
import type { Country } from "../types/country.types";

interface UseCountryFilterOptions {
  countries: Country[];
  query: string;
}

export function useCountryFilter({ countries, query }: UseCountryFilterOptions): Country[] {
  return useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    // No query → return full list without allocating a new filtered array.
    if (!trimmed) return countries;

    return countries.filter((country) => {
      const nameMatch = country.commonName.toLowerCase().includes(trimmed);
      const codeMatch = country.cca2.toLowerCase() === trimmed ||
                        country.cca3.toLowerCase() === trimmed;
      const capitalMatch = country.capital.toLowerCase().includes(trimmed);
      const regionMatch = country.region.toLowerCase().includes(trimmed);

      return nameMatch || codeMatch || capitalMatch || regionMatch;
    });
  }, [countries, query]);
}
