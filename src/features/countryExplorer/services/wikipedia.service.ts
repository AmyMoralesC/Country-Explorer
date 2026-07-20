/**
 * wikipedia.service.ts
 *
 * Fetches a country's lead photo via our /api/country-image proxy route.
 * Kept separate from restCountries.service.ts since it talks to a
 * completely different upstream API — mixing them would blur the
 * single-responsibility boundary of each service file.
 */

export async function fetchCountryImage(countryName: string): Promise<string | null> {
  const response = await fetch(`/api/country-image?name=${encodeURIComponent(countryName)}`);

  if (!response.ok) {
    return null;
  }

  const data: { imageUrl: string | null } = await response.json();
  return data.imageUrl;
}