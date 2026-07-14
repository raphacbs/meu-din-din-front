import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppNav } from "@/components/app/app-nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/meu-mes",
}));

describe("AppNav", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders primary navigation links", () => {
    render(<AppNav />);

    expect(screen.getByRole("navigation", { name: "Principal" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByRole("link", { name: "Meu mês" })).toHaveAttribute("href", "/meu-mes");
    expect(screen.getByRole("link", { name: "Configurações" })).toHaveAttribute(
      "href",
      "/settings",
    );
    expect(screen.queryByRole("link", { name: "Transações" })).not.toBeInTheDocument();
  });

  it("marks the active route with aria-current", () => {
    render(<AppNav />);

    expect(screen.getByRole("link", { name: "Meu mês" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
  });
});
