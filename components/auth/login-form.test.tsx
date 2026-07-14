import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/components/auth/login-form";
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
    login: vi.fn(),
  },
}));

import { auth } from "@/lib/api/auth";

describe("LoginForm", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows validation errors before submitting", async () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Informe seu e-mail.")).toBeInTheDocument();
    expect(screen.getByText("Informe sua senha.")).toBeInTheDocument();
    expect(auth.login).not.toHaveBeenCalled();
  });

  it("shows invalid credential feedback on 401", async () => {
    vi.mocked(auth.login).mockRejectedValue(new ApiError(401, "Unauthorized"));

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail ou senha inválidos.");
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("navigates to dashboard after successful login", async () => {
    vi.mocked(auth.login).mockResolvedValue({
      userId: "user-1",
      email: "user@example.com",
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        userId: "user-1",
        email: "user@example.com",
      });
      expect(replaceMock).toHaveBeenCalledWith("/dashboard");
    });
  });
});
