/**
 * restCountries.service.test.ts
 *
 * Tests for the adapter that maps raw API data → internal Country model.
 * We mock fetch() so we never make real network calls in tests.
 *
 * This is the most important test file from a "Type Safety Decisions"
 * perspective — it verifies that our adapter handles optional fields
 * correctly rather than crashing when the API omits them.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchAllCountries } from "../services/restCountries.service";
import type { CountryApiResponse } from "../types/country.types";

// Minimal valid raw API response
const rawCostaRica: CountryApiResponse = {
  name: { common: "Costa Rica", official: "Republic of Costa Rica" },
  cca2: "CR",
  cca3: "CRI",
  flag: "🇨🇷",
  flags: { png: "https://flagcdn.com/w320/cr.png", svg: "", alt: "Flag of Costa Rica" },
  region: "Americas",
  subregion: "Central America",
  capital: ["San José"],
  latlng: [9.748917, -83.753428],
  area: 51100,
  population: 5180829,
  timezones: ["UTC-06:00"],
  borders: ["NIC", "PAN"],
  currencies: { CRC: { name: "Costa Rican colón", symbol: "₡" } },
  languages: { spa: "Spanish" },
  demonyms: { eng: { m: "Costa Rican", f: "Costa Rican" } },
  gini: { "2021": 48.5 },
  idd: { root: "+5", suffixes: ["06"] },
};

// Edge case: island nation with many optional fields omitted
const rawIslandNation: CountryApiResponse = {
  name: { common: "Maldives", official: "Republic of the Maldives" },
  cca2: "MV",
  cca3: "MDV",
  flag: "🇲🇻",
  flags: { png: "https://flagcdn.com/w320/mv.png", svg: "" },
  region: "Asia",
  latlng: [3.25, 73.0],
  population: 540544,
  timezones: ["UTC+05:00"],
  // No subregion, capital, area, borders, currencies, languages, demonyms, gini, idd
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("fetchAllCountries adapter", () => {
  it("maps raw API response to internal Country model", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [rawCostaRica],
    });

    const countries = await fetchAllCountries();
    const country = countries[0];

    expect(country).toBeDefined();
    expect(country?.cca3).toBe("CRI");
    expect(country?.commonName).toBe("Costa Rica");
    expect(country?.capital).toBe("San José");
    expect(country?.callingCode).toBe("+506");
  });

  it("resolves Gini to the latest year's value", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [rawCostaRica],
    });

    const [country] = await fetchAllCountries();
    expect(country?.gini).toBe(48.5);
  });

  it("maps currencies record to Currency array", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [rawCostaRica],
    });

    const [country] = await fetchAllCountries();
    expect(country?.currencies).toHaveLength(1);
    expect(country?.currencies[0]).toEqual({ code: "CRC", name: "Costa Rican colón", symbol: "₡" });
  });

  it("uses safe defaults when optional fields are missing (island nation)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [rawIslandNation],
    });

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
