import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/app/app-shell";

const logoutMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

vi.mock("@/lib/auth/session-context", () => ({
  useSession: () => ({
    user: { userId: "user-1", email: "user@example.com" },
    logout: logoutMock,
  }),
}));

describe("AppShell accessibility", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    logoutMock.mockResolvedValue(undefined);
  });

  it("exposes a skip link and main landmark", () => {
    render(
      <AppShell>
        <p>Conteúdo</p>
      </AppShell>,
    );

    expect(screen.getByRole("link", { name: "Ir para o conteúdo" })).toHaveAttribute(
      "href",
      "#main-content",
    );
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("supports keyboard navigation across shell actions", async () => {
    render(
      <AppShell>
        <p>Conteúdo</p>
      </AppShell>,
    );

    const skipLink = screen.getByRole("link", { name: "Ir para o conteúdo" });
    skipLink.focus();
    expect(skipLink).toHaveFocus();

    fireEvent.keyDown(skipLink, { key: "Tab" });
    expect(screen.getByRole("link", { name: "Nova transação" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();
  });

  it("calls logout when the user clicks Sair", async () => {
    render(
      <AppShell>
        <p>Conteúdo</p>
      </AppShell>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Sair" }));

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledTimes(1);
    });
  });
});
