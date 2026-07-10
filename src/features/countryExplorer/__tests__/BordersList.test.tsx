/**
 * BordersList.test.tsx
 *
 * Tests for the collapsible borders component.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BordersList } from "../components/BordersList";
import { mockCountries, mockNicaragua } from "./fixtures";

describe("BordersList", () => {
  it("shows a message when there are no borders", () => {
    render(
      <BordersList borderCodes={[]} allCountries={mockCountries} onSelect={vi.fn()} />
    );
    expect(screen.getByText(/No land borders/i)).toBeInTheDocument();
  });

  it("renders border country names", () => {
    render(
      <BordersList
        borderCodes={["NIC", "PAN"]}
        allCountries={mockCountries}
        onSelect={vi.fn()}
      />
    );
    // Nicaragua is in mockCountries; PAN is not, so it should be omitted gracefully
    expect(screen.getByText("Nicaragua")).toBeInTheDocument();
  });

  it("calls onSelect with the correct country when a border is clicked", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(
      <BordersList
        borderCodes={["NIC"]}
        allCountries={mockCountries}
        onSelect={handleSelect}
      />
    );

    await user.click(screen.getByRole("button", { name: /Select Nicaragua/i }));
    expect(handleSelect).toHaveBeenCalledWith(mockNicaragua);
  });

  it("shows expand button when borders exceed MAX_VISIBLE (3)", async () => {
    const user = userEvent.setup();

    // Give Costa Rica 4 mock borders (only NIC resolves, but the count logic uses borderCodes)
    // We need 4 countries in allCountries for this to work properly
    const extraCountry = { ...mockNicaragua, cca3: "HND", commonName: "Honduras", cca2: "HN" };
    const extraCountry2 = { ...mockNicaragua, cca3: "GTM", commonName: "Guatemala", cca2: "GT" };
    const allFour = [...mockCountries, extraCountry, extraCountry2];

    render(
      <BordersList
        borderCodes={["NIC", "JPN", "HND", "GTM"]}
        allCountries={allFour}
        onSelect={vi.fn()}
      />
    );

    // Initially, "+1 more" button should be visible (4 borders, 3 visible)
    expect(screen.getByText(/\+1 more/)).toBeInTheDocument();

    // Click to expand
    await user.click(screen.getByText(/\+1 more/));
    expect(screen.getByText("Show less")).toBeInTheDocument();
  });
});
