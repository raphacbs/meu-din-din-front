import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RegisterForm } from "@/components/auth/register-form";
import { ApiError } from "@/lib/api/client";

const replaceMock = vi.fn();
const loginMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

vi.mock("@/lib/auth/session-context", () => ({
  useSession: () => ({
    login: loginMock,
  }),
}));

vi.mock("@/lib/api/auth", () => ({
  auth: {
    register: vi.fn(),
  },
}));

import { auth } from "@/lib/api/auth";

describe("RegisterForm", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows duplicate account feedback on 409", async () => {
    vi.mocked(auth.register).mockRejectedValue(new ApiError(409, "E-mail já cadastrado"));

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail já cadastrado");
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
