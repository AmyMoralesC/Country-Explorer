/**
 * fixtures.ts
 *
 * Shared mock data for tests.
 * Centralizing fixtures means: change one Country shape → fix one file,
 * not every test file individually.
 *
 * The mock data intentionally covers edge cases:
 * - mockCostaRica: has all fields populated (borders, Gini, currency)
 * - mockJapan: island nation (no borders), different region
 */

import type { Country } from "../types/country.types";

export const mockCostaRica: Country = {
  cca2: "CR",
  cca3: "CRI",
  flag: "🇨🇷",
  flagPng: "https://flagcdn.com/w320/cr.png",
  commonName: "Costa Rica",
  officialName: "Republic of Costa Rica",
  region: "Americas",
  subregion: "Central America",
  capital: "San José",
  latlng: [9.748917, -83.753428],
  area: 51100,
  borders: ["NIC", "PAN"],
  population: 5180829,
  demonym: "Costa Rican",
  currencies: [{ code: "CRC", name: "Costa Rican colón", symbol: "₡" }],
  gini: 48.5,
  callingCode: "+506",
  languages: ["Spanish"],
  timezones: ["UTC-06:00"],
};

export const mockNicaragua: Country = {
  cca2: "NI",
  cca3: "NIC",
  flag: "🇳🇮",
  flagPng: "https://flagcdn.com/w320/ni.png",
  commonName: "Nicaragua",
  officialName: "Republic of Nicaragua",
  region: "Americas",
  subregion: "Central America",
  capital: "Managua",
  latlng: [13.0, -85.0],
  area: 130370,
  borders: ["CRI", "HND"],
  population: 6624554,
  demonym: "Nicaraguan",
  currencies: [{ code: "NIO", name: "Nicaraguan córdoba", symbol: "C$" }],
  gini: 46.2,
  callingCode: "+505",
  languages: ["Spanish"],
  timezones: ["UTC-06:00"],
};

export const mockJapan: Country = {
  cca2: "JP",
  cca3: "JPN",
  flag: "🇯🇵",
  flagPng: "https://flagcdn.com/w320/jp.png",
  commonName: "Japan",
  officialName: "Japan",
  region: "Asia",
  subregion: "Eastern Asia",
  capital: "Tokyo",
  latlng: [36.0, 138.0],
  area: 377930,
  borders: [],
  population: 125700000,
  demonym: "Japanese",
  currencies: [{ code: "JPY", name: "Japanese yen", symbol: "¥" }],
  gini: 32.9,
  callingCode: "+81",
  languages: ["Japanese"],
  timezones: ["UTC+09:00"],
};

export const mockCountries: Country[] = [mockCostaRica, mockNicaragua, mockJapan];
