/**
 * Pure function tests — the easiest kind to write.
 * No React, no DOM, no mocks needed.
 * Each function gets: happy path, edge case, boundary value.
 */

import { describe, it, expect } from "vitest";
import {
  formatPopulation,
  formatArea,
  formatCoordinates,
  getLatestGini,
} from "../utils/formatters";

describe("formatPopulation", () => {
  it("formats millions with 2 decimal places", () => {
    expect(formatPopulation(5_180_829)).toBe("5.18M");
  });

  it("formats thousands without decimals", () => {
    expect(formatPopulation(847_000)).toBe("847K");
  });

  it("returns raw number for values under 1000", () => {
    expect(formatPopulation(999)).toBe("999");
  });

  it("handles exactly 1 million", () => {
    expect(formatPopulation(1_000_000)).toBe("1.00M");
  });
});

describe("formatArea", () => {
  it("adds thousands separators and km² suffix", () => {
    expect(formatArea(51100)).toBe("51,100 km²");
  });

  it("handles zero area", () => {
    expect(formatArea(0)).toBe("0 km²");
  });

  it("handles large areas", () => {
    expect(formatArea(17_098_242)).toBe("17,098,242 km²");
  });
});

describe("formatCoordinates", () => {
  it("formats positive lat/lng as N/E", () => {
    expect(formatCoordinates([9.748917, 45.123])).toBe("9.75°N, 45.12°E");
  });

  it("formats negative lat/lng as S/W", () => {
    expect(formatCoordinates([-33.86, -70.65])).toBe("33.86°S, 70.65°W");
  });

  it("handles zero coordinates", () => {
    expect(formatCoordinates([0, 0])).toBe("0.00°N, 0.00°E");
  });
});

describe("getLatestGini", () => {
  it("returns the last value from a gini record", () => {
    expect(getLatestGini({ "2019": 45.0, "2021": 48.5 })).toBe(48.5);
  });

  it("returns null for undefined gini", () => {
    expect(getLatestGini(undefined)).toBeNull();
  });

  it("returns null for empty gini record", () => {
    expect(getLatestGini({})).toBeNull();
  });
});
