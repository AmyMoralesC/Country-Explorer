/**
 * Tests for the collapsible borders component.
 */

import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test/test-utils";
import { BordersList } from "../components/BordersList";
import { mockCountries, mockNicaragua } from "./fixtures";

describe("BordersList", () => {
  it("shows a message when there are no borders", () => {
    renderWithProviders(
      <BordersList borderCodes={[]} allCountries={mockCountries} onSelect={vi.fn()} />
    );
    expect(screen.getByText(/No land borders/i)).toBeInTheDocument();
  });

  it("renders border country codes", () => {
    renderWithProviders(
      <BordersList
        borderCodes={["NIC", "PAN"]}
        allCountries={mockCountries}
        onSelect={vi.fn()}
      />
    );
    // The redesigned card shows the flag + cca3 code as visible text (not
    // the full country name) — the name is still exposed via aria-label
    // for accessibility, which the next test verifies.
    // Nicaragua is in mockCountries; PAN is not, so it should be omitted gracefully.
    expect(screen.getByText("NIC")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Select Nicaragua/i })).toBeInTheDocument();
  });

  it("calls onSelect with the correct country when a border is clicked", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    renderWithProviders(
      <BordersList
        borderCodes={["NIC"]}
        allCountries={mockCountries}
        onSelect={handleSelect}
      />
    );

    await user.click(screen.getByRole("button", { name: /Select Nicaragua/i }));
    expect(handleSelect).toHaveBeenCalledWith(mockNicaragua);
  });

  it("shows expand button when borders exceed MAX_VISIBLE (4)", async () => {
    const user = userEvent.setup();

    // BordersList shows MAX_VISIBLE=4 cards before collapsing the rest —
    // we need 5 resolvable border countries to see the "+1 more" card.
    const extraCountries = [
      { ...mockNicaragua, cca3: "HND", commonName: "Honduras", cca2: "HN" },
      { ...mockNicaragua, cca3: "GTM", commonName: "Guatemala", cca2: "GT" },
      { ...mockNicaragua, cca3: "BLZ", commonName: "Belize", cca2: "BZ" },
    ];
    const allCountries = [...mockCountries, ...extraCountries];

    renderWithProviders(
      <BordersList
        borderCodes={["NIC", "JPN", "HND", "GTM", "BLZ"]}
        allCountries={allCountries}
        onSelect={vi.fn()}
      />
    );

    // 5 borders resolve, MAX_VISIBLE=4 are shown, 1 is hidden behind "+1 more"
    expect(screen.getByText(/\+1/)).toBeInTheDocument();
    expect(screen.getByText(/more/)).toBeInTheDocument();

    // Click to expand
    await user.click(screen.getByText(/more/));
    expect(screen.getByText("Show less")).toBeInTheDocument();
  });
});