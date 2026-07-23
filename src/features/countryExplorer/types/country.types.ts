/**
 * REST Countries v5 API types + internal Country model
 */

export interface CountryApiResponseV5 {
  names: {
    common: string;
    official: string;
  };
  codes: {
    alpha_2: string;
    alpha_3: string;
  };
  capitals?: Array<{
    name: string;
    coordinates: { lat: number; lng: number };
  }>;
  flag: {
    emoji: string;
    url_png?: string;
  };
  region: string;
  subregion?: string;
  area?: {
    kilometers: number;
  };
  borders?: string[];
  calling_codes?: string[];
  coordinates: { lat: number; lng: number };
  currencies?: Array<{
    code: string;
    name: string;
    symbol: string;
  }>;
  demonyms?: {
    eng?: { m: string; f: string };
  };
  economy?: {
    gini_coefficient?: Record<string, number>;
  };
  languages?: Array<{
    name: string;
  }>;
  timezones?: string[];
  population?: number;
}

export interface CountryApiResponse {
  data: {
    objects: CountryApiResponseV5[];
    meta: {
      total: number;
      count: number;
    };
  };
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface Country {
  cca2: string;
  cca3: string;
  flag: string;
  flagPng: string;
  commonName: string;
  officialName: string;
  region: string;
  subregion: string;
  capital: string;
  latlng: [number, number];
  area: number;
  borders: string[];
  population: number;
  demonym: string;
  currencies: Currency[];
  gini: number | null;
  callingCode: string;
  languages: string[];
  timezones: string[];
}

export interface GeoJsonFeature {
  type: "Feature";
  properties: {
    NAME: string;
    ISO_A2: string;
    ISO_A3: string;
    [key: string]: unknown;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

export interface GeoJsonData {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

export type LoadingState = "idle" | "loading" | "success" | "error";