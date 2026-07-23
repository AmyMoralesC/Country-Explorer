/**
 * Wraps TanStack Query around fetchCountryImage. Each country name gets
 * its own cache entry, so switching between previously-viewed countries
 * is instant (no refetch) — same caching benefit useCountries gets for
 * the full list.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchCountryImage } from "../services/wikipedia.service";

export function useCountryImage(countryName: string) {
  return useQuery({
    queryKey: ["country-image", countryName],
    queryFn: () => fetchCountryImage(countryName),
    enabled: Boolean(countryName),
    // Country lead images essentially never change — cache aggressively.
    staleTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });
}