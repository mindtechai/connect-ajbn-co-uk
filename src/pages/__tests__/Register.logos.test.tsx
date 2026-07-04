import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "@/pages/Register";

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={["/register"]}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/lions" element={<div>Lions Page</div>} />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Join AJBN page header logos", () => {
  it("Impact Lions logo links to /lions", () => {
    renderRegister();
    const lionsLink = screen.getByRole("link", { name: /impact lions club page/i });
    expect(lionsLink).toHaveAttribute("href", "/lions");
  });

  it("AJBN logo links to home /", () => {
    renderRegister();
    const ajbnLink = screen.getByRole("link", { name: /ajbn home/i });
    expect(ajbnLink).toHaveAttribute("href", "/");
  });
});

describe("Shared Navbar logos", () => {
  it("Navbar Impact Lions logo links to /lions", async () => {
    const { Navbar } = await import("@/components/Navbar");
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Navbar />
      </MemoryRouter>
    );
    const lionsLink = screen.getByRole("link", { name: /impact lions club page/i });
    expect(lionsLink).toHaveAttribute("href", "/lions");
  });

  it("Navbar AJBN logo links to /", () => {
    // Reuse: find any link whose href is exactly '/'
    const links = screen.getAllByRole("link");
    const home = links.find((l) => l.getAttribute("href") === "/");
    expect(home).toBeTruthy();
  });
});

describe("Shared BrandLink logos (authenticated layout)", () => {
  it("BrandLink renders separate AJBN home and Impact Lions links", async () => {
    const { BrandLink } = await import("@/components/BrandLink");
    render(
      <MemoryRouter>
        <BrandLink />
      </MemoryRouter>
    );
    const lionsLink = screen.getByRole("link", { name: /impact lions club page/i });
    expect(lionsLink).toHaveAttribute("href", "/lions");
    const homeLink = screen.getByRole("link", { name: /asian jewish business network — home/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });
});