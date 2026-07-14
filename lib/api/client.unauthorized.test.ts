import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiFetch, setUnauthorizedHandler } from "@/lib/api/client";

describe("apiFetch unauthorized handling", () => {
  const fetchMock = vi.fn();
  const unauthorizedMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    setUnauthorizedHandler(unauthorizedMock);
    fetchMock.mockReset();
    unauthorizedMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    setUnauthorizedHandler(null);
  });

  it("invokes unauthorized handler for protected 401 responses", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: async () => ({ message: "Sessão expirada" }),
    });

    await expect(apiFetch("/api/projections/current")).rejects.toBeInstanceOf(ApiError);
    expect(unauthorizedMock).toHaveBeenCalledTimes(1);
  });

  it("does not invoke unauthorized handler for failed login", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: async () => ({ message: "Credenciais inválidas" }),
    });

    await expect(
      apiFetch("/api/auth/session", { method: "POST", body: "{}" }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(unauthorizedMock).not.toHaveBeenCalled();
  });
});