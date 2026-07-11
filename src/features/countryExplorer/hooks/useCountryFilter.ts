/**
 *
 * Encapsulates search filtering logic.
 *
 * Why a custom hook instead of inline useMemo in the component?
 * - The component stays focused on rendering, not business logic.
 * - The filter logic is independently testable (see __tests__).
 * - If we add more filter criteria later, this is the only file to touch.
 *
 * Matching rules (deliberately narrow):
 * - Country name: substring match (e.g. "co" matches "Mexico", "Colombia").
 * - Country code: exact match only, for 2-3 letter codes (e.g. "cr" → Costa Rica).
 * - We intentionally do NOT match on capital or region. Matching those fields
 *   caused confusing results — e.g. "co" matched Russia because its capital
 *   is "Moscow", and Guinea because its capital is "Conakry". A search field
 *   should feel predictable: if the person types part of a country's name,
 *   they expect only country names to respond.
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
      const codeMatch =
        country.cca2.toLowerCase() === trimmed || country.cca3.toLowerCase() === trimmed;

      return nameMatch || codeMatch;
    });
  }, [countries, query]);
}