import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { AboutSection } from "../AboutSection";

describe("AboutSection — Top skills regression", () => {
  it("renders 'Top skills' only inside Salil Patankar's card", () => {
    const { container } = render(<AboutSection />);

    // Only one 'Top skills' heading should exist on the page.
    const matches = screen.getAllByText(/top skills/i);
    expect(matches).toHaveLength(1);

    // That heading must live inside the same card as Salil Patankar.
    const salil = screen.getByText(/Salil Patankar/i);
    const salilCard = salil.closest("[data-member-card]") ?? salil.closest("article, li, div");
    expect(salilCard).not.toBeNull();
    expect(within(salilCard as HTMLElement).getByText(/top skills/i)).toBeInTheDocument();

    // Sanity: all 5 skill pills present inside Salil's card.
    const expected = [
      /tax advisory/i,
      /fundraising/i,
      /networking and b2b/i,
      /digital marketing/i,
      /public speaking/i,
    ];
    for (const rx of expected) {
      expect(within(salilCard as HTMLElement).getByText(rx)).toBeInTheDocument();
    }

    // Ensure no standalone <section>/heading titled 'Top skills' exists elsewhere.
    const stray = container.querySelectorAll("section h2, section h3");
    stray.forEach((h) => expect(h.textContent?.toLowerCase()).not.toMatch(/^top skills$/));
  });
});