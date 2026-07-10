/**
 * useCountries.ts
 *
 * Wraps TanStack Query to fetch and cache all countries.
 *
 * Why TanStack Query instead of useEffect + useState?
 * The anti-pattern looks like this:
 *   const [data, setData] = useState(null);
 *   const [loading, setLoading] = useState(false);
 *   useEffect(() => { fetch(...).then(setData) }, []);
 *
 * Problems with that approach:
 *   - No caching (refetches on every mount).
 *   - No deduplication (two components fetching = two network calls).
 *   - Manual loading/error state = boilerplate.
 *   - Race conditions on fast re-mounts.
 *
 * TanStack Query solves all of this: one fetch, shared cache, automatic
 * background refetch, and typed loading/error states.
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
