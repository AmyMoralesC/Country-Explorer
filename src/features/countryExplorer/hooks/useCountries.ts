/**
 * Wraps TanStack Query to fetch and cache all countries.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchAllCountries } from "../services/restCountries.service";

// Stable key used for caching. If any component calls useCountries(),
// TanStack Query reuses the same cached result — no duplicate requests.
export const COUNTRIES_QUERY_KEY = ["countries"] as const;

export function useCountries() {
  return useQuery({
    queryKey: COUNTRIES_QUERY_KEY,
    queryFn: fetchAllCountries,
    // 1 hour — REST Countries data changes rarely, so we can cache aggressively.
    staleTime: 1000 * 60 * 60,
    // Keep data in memory for 2 hours after the last subscriber unmounts.
    gcTime: 1000 * 60 * 60 * 2,
    // Don't retry on 404s — if the API is down, fail fast.
    retry: 1,
  });
}
