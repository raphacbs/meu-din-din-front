import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SessionGuard } from "@/components/auth/session-guard";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

const useSessionMock = vi.fn();

vi.mock("@/lib/auth/session-context", () => ({
  useSession: () => useSessionMock(),
}));

describe("SessionGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated visitors to login", async () => {
    useSessionMock.mockReturnValue({ status: "unauthenticated" });

    render(
      <SessionGuard>
        <p>Conteúdo protegido</p>
      </SessionGuard>,
    );

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/login");
    });
    expect(screen.queryByText("Conteúdo protegido")).not.toBeInTheDocument();
  });

  it("renders children for authenticated sessions", () => {
    useSessionMock.mockReturnValue({ status: "authenticated" });

    render(
      <SessionGuard>
        <p>Conteúdo protegido</p>
      </SessionGuard>,
    );

    expect(screen.getByText("Conteúdo protegido")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
