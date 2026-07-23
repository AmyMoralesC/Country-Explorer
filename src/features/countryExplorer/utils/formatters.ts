/**
 * Pure utility functions for formatting display values.
 * Pure = no side effects, same input always produces same output.
 * Easy to unit-test without any React or DOM dependencies.
 */

/**
 * Formats a population number into a human-readable short form.
 * 5_180_829 → "5.18M"
 * 847_000   → "847K"
 * 999       → "999"
 */
export function formatPopulation(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return value.toString();
}

/**
 * Formats an area in km² with thousands separators.
 * 51100 → "51,100 km²"
 */
export function formatArea(value: number): string {
  return `${value.toLocaleString("en-US")} km²`;
}

/**
 * Formats a lat/lng pair to a readable string.
 * [9.748917, -83.753428] → "9.75°N, 83.75°W"
 */
export function formatCoordinates(latlng: [number, number]): string {
  const [lat, lng] = latlng;
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lng).toFixed(2)}°${lngDir}`;
}

/**
 * Returns the latest year's Gini value from the record, or null.
 * The API returns { "2019": 48.5, "2021": 50.1 } — we want 50.1.
 */
export function getLatestGini(gini: Record<string, number> | undefined): number | null {
  if (!gini) return null;
  const values = Object.values(gini);
  return values.length > 0 ? (values[values.length - 1] ?? null) : null;
}
