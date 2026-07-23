/**
 * Tests for the filtering hook.
 * We test the logic, not the React internals — so renderHook is enough.
 * No DOM rendering needed here.
 */

import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCountryFilter } from "../hooks/useCountryFilter";
import { mockCountries, mockCostaRica, mockJapan } from "./fixtures";

describe("useCountryFilter", () => {
  it("returns all countries when query is empty", () => {
    const { result } = renderHook(() =>
      useCountryFilter({ countries: mockCountries, query: "" })
    );
    expect(result.current).toHaveLength(mockCountries.length);
  });

  it("filters by country name (case-insensitive)", () => {
    const { result } = renderHook(() =>
      useCountryFilter({ countries: mockCountries, query: "costa" })
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]?.cca3).toBe("CRI");
  });

  it("filters by cca2 code (exact, case-insensitive)", () => {
    const { result } = renderHook(() =>
      useCountryFilter({ countries: mockCountries, query: "jp" })
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]?.cca3).toBe("JPN");
  });

  it("filters by cca3 code", () => {
    const { result } = renderHook(() =>
      useCountryFilter({ countries: mockCountries, query: "NIC" })
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]?.commonName).toBe("Nicaragua");
  });

  it("does NOT match on capital city (name-only search)", () => {
    // only the country name and code are searched.
    const { result } = renderHook(() =>
      useCountryFilter({ countries: mockCountries, query: "tokyo" })
    );
    expect(result.current).toHaveLength(0);
  });

  it("does NOT match on region (name-only search)", () => {
    const { result } = renderHook(() =>
      useCountryFilter({ countries: mockCountries, query: "asia" })
    );
    expect(result.current).toHaveLength(0);
  });

  it("returns empty array when no countries match", () => {
    const { result } = renderHook(() =>
      useCountryFilter({ countries: mockCountries, query: "zzzzz" })
    );
    expect(result.current).toHaveLength(0);
  });

  it("trims whitespace from query before filtering", () => {
    const { result } = renderHook(() =>
      useCountryFilter({ countries: mockCountries, query: "  japan  " })
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]?.cca3).toBe("JPN");
  });

  it("returns all countries when query is only whitespace", () => {
    const { result } = renderHook(() =>
      useCountryFilter({ countries: mockCountries, query: "   " })
    );
    expect(result.current).toHaveLength(mockCountries.length);
  });
});