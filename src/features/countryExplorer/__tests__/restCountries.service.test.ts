/**
 * Tests for the adapter that maps raw REST Countries v5 API data →
 * internal Country model. We mock fetch() so we never make real network
 * calls in tests.
 *
 * This is the most important test file from a "Type Safety Decisions"
 * perspective — it verifies that our adapter handles v5's nested shape
 * (and its optional fields) correctly rather than crashing when the API
 * omits them.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchAllCountries } from "../services/restCountries.service";
import type { CountryApiResponse, CountryApiResponseV5 } from "../types/country.types";

// Minimal valid raw v5 API object
const rawCostaRica: CountryApiResponseV5 = {
  names: { common: "Costa Rica", official: "Republic of Costa Rica" },
  codes: { alpha_2: "CR", alpha_3: "CRI" },
  capitals: [{ name: "San José", coordinates: { lat: 9.93, lng: -84.08 } }],
  flag: { emoji: "🇨🇷", url_png: "https://flagcdn.com/w320/cr.png" },
  region: "Americas",
  subregion: "Central America",
  area: { kilometers: 51100 },
  borders: ["NIC", "PAN"],
  calling_codes: ["506"],
  coordinates: { lat: 9.748917, lng: -83.753428 },
  currencies: [{ code: "CRC", name: "Costa Rican colón", symbol: "₡" }],
  demonyms: { eng: { m: "Costa Rican", f: "Costa Rican" } },
  economy: { gini_coefficient: { "2021": 48.5 } },
  languages: [{ name: "Spanish" }],
  timezones: ["UTC-06:00"],
  population: 5180829,
};

// Edge case: island nation with most optional fields omitted
const rawIslandNation: CountryApiResponseV5 = {
  names: { common: "Maldives", official: "Republic of the Maldives" },
  codes: { alpha_2: "MV", alpha_3: "MDV" },
  flag: { emoji: "🇲🇻", url_png: "https://flagcdn.com/w320/mv.png" },
  region: "Asia",
  coordinates: { lat: 3.25, lng: 73.0 },
  population: 540544,
  timezones: ["UTC+05:00"],
  // No capitals, subregion, area, borders, calling_codes, currencies,
  // languages, demonyms, economy — the adapter must fall back safely.
};

function mockFetchWithObjects(objects: CountryApiResponseV5[]) {
  const wrapper: CountryApiResponse = {
    data: {
      objects,
      meta: { total: objects.length, count: objects.length },
    },
  };
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => wrapper,
  });
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("fetchAllCountries adapter (REST Countries v5)", () => {
  it("maps raw API response to internal Country model", async () => {
    mockFetchWithObjects([rawCostaRica]);

    const countries = await fetchAllCountries();
    const country = countries[0];

    expect(country).toBeDefined();
    expect(country?.cca3).toBe("CRI");
    expect(country?.commonName).toBe("Costa Rica");
    expect(country?.capital).toBe("San José");
    expect(country?.callingCode).toBe("+506");
  });

  it("resolves Gini to the latest year's value", async () => {
    mockFetchWithObjects([rawCostaRica]);

    const [country] = await fetchAllCountries();
    expect(country?.gini).toBe(48.5);
  });

  it("maps the currencies array to the internal Currency shape", async () => {
    mockFetchWithObjects([rawCostaRica]);

    const [country] = await fetchAllCountries();
    expect(country?.currencies).toHaveLength(1);
    expect(country?.currencies[0]).toEqual({ code: "CRC", name: "Costa Rican colón", symbol: "₡" });
  });

  it("uses safe defaults when optional fields are missing (island nation)", async () => {
    mockFetchWithObjects([rawIslandNation]);

    const [country] = await fetchAllCountries();

    expect(country?.subregion).toBe("N/A");
    expect(country?.capital).toBe("N/A");
    expect(country?.area).toBe(0);
    expect(country?.borders).toEqual([]);
    expect(country?.currencies).toEqual([]);
    expect(country?.languages).toEqual([]);
    expect(country?.demonym).toBe("N/A");
    expect(country?.gini).toBeNull();
    expect(country?.callingCode).toBe("N/A");
  });

  it("throws when the API returns a non-OK response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    await expect(fetchAllCountries()).rejects.toThrow("Failed to fetch countries: 500");
  });
});