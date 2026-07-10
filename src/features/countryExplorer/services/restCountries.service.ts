/**
 * restCountries.service.ts
 * API client for REST Countries v5
 */

import type {
  Country,
  CountryApiResponse,
  CountryApiResponseV5,
} from "../types/country.types";

function adaptCountry(raw: CountryApiResponseV5): Country {
  const giniData = raw.economy?.gini_coefficient ?? {};
  const giniEntries = Object.values(giniData);
  const latestGini: number | null =
    giniEntries.length > 0 ? (giniEntries[giniEntries.length - 1] ?? null) : null;

  const currencies = raw.currencies ?? [];

  const callingCode =
    raw.calling_codes && raw.calling_codes.length > 0
      ? `+${raw.calling_codes[0]}`
      : "N/A";

  const capital =
    raw.capitals && raw.capitals.length > 0
      ? raw.capitals[0]?.name ?? "N/A"
      : "N/A";

  const area = raw.area?.kilometers ?? 0;

  const latlng: [number, number] = [
    raw.coordinates.lat,
    raw.coordinates.lng,
  ];

  const languages = raw.languages
    ? raw.languages.map((lang) => lang.name).filter(Boolean)
    : [];

  const demonym = raw.demonyms?.eng?.m ?? "N/A";

  return {
    cca2: raw.codes.alpha_2 || "N/A",
    cca3: raw.codes.alpha_3 || "N/A",
    flag: raw.flag.emoji || "🌍",
    flagPng: raw.flag.url_png || "",
    commonName: raw.names.common || "Unknown",
    officialName: raw.names.official || "Unknown",
    region: raw.region || "Unknown",
    subregion: raw.subregion || "N/A",
    capital,
    latlng,
    area,
    borders: raw.borders || [],
    population: raw.population || 0,
    demonym,
    currencies,
    gini: latestGini,
    callingCode,
    languages,
    timezones: raw.timezones || [],
  };
}

export async function fetchAllCountries(): Promise<Country[]> {
  const response = await fetch("/api/countries");

  if (!response.ok) {
    throw new Error(
      `Failed to fetch countries: ${response.status} ${response.statusText}`
    );
  }

  const wrapper = (await response.json()) as CountryApiResponse;
  
  if (!wrapper?.data?.objects) {
    throw new Error("Invalid API response structure");
  }

  return wrapper.data.objects.map(adaptCountry);
}

export async function fetchCountryByCode(cca3: string): Promise<Country> {
  const response = await fetch(`/api/countries?code=${cca3}`);

  if (!response.ok) {
    throw new Error(`Country not found: ${cca3}`);
  }

  const wrapper = (await response.json()) as CountryApiResponse;
  const first = wrapper.data.objects[0];

  if (!first) {
    throw new Error(`No country data returned for ${cca3}`);
  }

  return adaptCountry(first);
}