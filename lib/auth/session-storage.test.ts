import { describe, expect, it } from "vitest";

import {
  hasAuthFormErrors,
  mapAuthError,
  validateAuthForm,
} from "@/lib/auth/session-storage";

describe("validateAuthForm", () => {
  it("requires email and password", () => {
    const errors = validateAuthForm({ email: "", password: "" });

    expect(errors.email).toBeTruthy();
    expect(errors.password).toBeTruthy();
    expect(hasAuthFormErrors(errors)).toBe(true);
  });

  it("validates email format and minimum password length", () => {
    const errors = validateAuthForm({ email: "invalid", password: "123" });

    expect(errors.email).toBe("Informe um e-mail válido.");
    expect(errors.password).toBe("A senha deve ter pelo menos 8 caracteres.");
  });

  it("accepts valid credentials", () => {
    const errors = validateAuthForm({
      email: "user@example.com",
      password: "password123",
    });

    expect(hasAuthFormErrors(errors)).toBe(false);
  });
});

describe("mapAuthError", () => {
  it("maps login failure to a friendly message", () => {
    expect(mapAuthError(401, "Unauthorized")).toBe("E-mail ou senha inválidos.");
  });

  it("maps duplicate registration to backend message", () => {
    expect(mapAuthError(409, "E-mail já cadastrado")).toBe("E-mail já cadastrado");
  });
});
