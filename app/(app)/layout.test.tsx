import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AppLayout from "@/app/(app)/layout";

vi.mock("@/components/auth/session-guard", () => ({
  SessionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/app/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

describe("AppLayout", () => {
  it("wraps authenticated pages with the app shell", () => {
    render(
      <AppLayout>
        <p>Conteúdo autenticado</p>
      </AppLayout>,
    );

    expect(screen.getByTestId("app-shell")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo autenticado")).toBeInTheDocument();
  });
});
