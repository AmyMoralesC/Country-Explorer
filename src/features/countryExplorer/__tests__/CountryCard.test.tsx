/**
 * CountryCard.test.tsx
 *
 * Tests for the info panel component.
 * We test what the USER sees, not implementation details.
 * Guiding question: "If I render this component, does it show the right info?"
 *
 * CountryCard renders <CountryImage>, which calls useCountryImage — a
 * TanStack Query hook that fetches a Wikipedia photo. We mock that hook
 * directly (not just the underlying fetch) so these tests:
 *   1. Never make a real network call.
 *   2. Render synchronously with the flag fallback already in place —
 *      no need to await a loading state that has nothing to do with what
 *      this test file is actually verifying.
 * Wikipedia's own fetch/scoring logic is exercised separately wherever
 * the API route itself is tested, not here.
 */

import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test/test-utils";
import { CountryCard } from "../components/CountryCard";
import { mockCostaRica, mockNicaragua, mockCountries } from "./fixtures";

vi.mock("../hooks/useCountryImage", () => ({
  useCountryImage: () => ({ data: null, isLoading: false }),
}));

describe("CountryCard", () => {
  it("renders the country name", () => {
    renderWithProviders(
      <CountryCard
        country={mockCostaRica}
        allCountries={mockCountries}
        onCountrySelect={vi.fn()}
      />
    );
    expect(screen.getByText("Costa Rica")).toBeInTheDocument();
  });

  it("renders the official name", () => {
    renderWithProviders(
      <CountryCard
        country={mockCostaRica}
        allCountries={mockCountries}
        onCountrySelect={vi.fn()}
      />
    );
    expect(screen.getByText("Republic of Costa Rica")).toBeInTheDocument();
  });

  it("renders the country code", () => {
    renderWithProviders(
      <CountryCard
        country={mockCostaRica}
        allCountries={mockCountries}
        onCountrySelect={vi.fn()}
      />
    );
    expect(screen.getByText("CR")).toBeInTheDocument();
  });

  it("renders the capital city", () => {
    renderWithProviders(
      <CountryCard
        country={mockCostaRica}
        allCountries={mockCountries}
        onCountrySelect={vi.fn()}
      />
    );
    expect(screen.getByText("San José")).toBeInTheDocument();
  });

  it("renders the region and subregion", () => {
    renderWithProviders(
      <CountryCard
        country={mockCostaRica}
        allCountries={mockCountries}
        onCountrySelect={vi.fn()}
      />
    );
    expect(screen.getByText(/Americas · Central America/)).toBeInTheDocument();
  });

  it("renders formatted population", () => {
    renderWithProviders(
      <CountryCard
        country={mockCostaRica}
        allCountries={mockCountries}
        onCountrySelect={vi.fn()}
      />
    );
    // 5,180,829 → "5.18M"
    expect(screen.getByText("5.18M")).toBeInTheDocument();
  });

  it("renders the currency symbol and code", () => {
    renderWithProviders(
      <CountryCard
        country={mockCostaRica}
        allCountries={mockCountries}
        onCountrySelect={vi.fn()}
      />
    );
    expect(screen.getByText("₡ CRC")).toBeInTheDocument();
  });

  it("calls onCountrySelect when a border card is clicked", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    renderWithProviders(
      <CountryCard
        country={mockCostaRica}
        allCountries={mockCountries}
        onCountrySelect={handleSelect}
      />
    );

    // Nicaragua is a border of Costa Rica
    const nicButton = screen.getByRole("button", { name: /Select Nicaragua/i });
    await user.click(nicButton);

    expect(handleSelect).toHaveBeenCalledWith(mockNicaragua);
    expect(handleSelect).toHaveBeenCalledTimes(1);
  });

  it("shows 'N/A' for Gini when value is null", () => {
    const countryWithoutGini = { ...mockCostaRica, gini: null };
    renderWithProviders(
      <CountryCard
        country={countryWithoutGini}
        allCountries={mockCountries}
        onCountrySelect={vi.fn()}
      />
    );
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });
});