import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ApiError,
  apiFetch,
  getCookie,
  requiresCsrfToken,
} from "@/lib/api/client";

describe("requiresCsrfToken", () => {
  it("returns false for public auth mutations", () => {
    expect(requiresCsrfToken("/api/auth/register", "POST")).toBe(false);
    expect(requiresCsrfToken("/api/auth/session", "POST")).toBe(false);
  });

  it("returns true for protected mutations", () => {
    expect(requiresCsrfToken("/api/transactions", "POST")).toBe(true);
    expect(requiresCsrfToken("/api/auth/session", "DELETE")).toBe(true);
  });

  it("returns false for read requests", () => {
    expect(requiresCsrfToken("/api/transactions", "GET")).toBe(false);
  });
});

describe("getCookie", () => {
  beforeEach(() => {
    document.cookie = "XSRF-TOKEN=abc123; other=value";
  });

  afterEach(() => {
    document.cookie = "XSRF-TOKEN=; max-age=0";
    document.cookie = "other=; max-age=0";
  });

  it("reads a cookie value by name", () => {
    expect(getCookie("XSRF-TOKEN")).toBe("abc123");
    expect(getCookie("missing")).toBeNull();
  });
});

describe("apiFetch", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    document.cookie = "XSRF-TOKEN=csrf-token-value";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
    document.cookie = "XSRF-TOKEN=; max-age=0";
  });

  it("unwraps envelope responses", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: { userId: "1", email: "user@example.com" },
        meta: {},
        links: {},
      }),
    });

    const result = await apiFetch<{ userId: string; email: string }>("/api/auth/session", {
      method: "POST",
      body: JSON.stringify({ email: "user@example.com", password: "password" }),
    });

    expect(result).toEqual({ userId: "1", email: "user@example.com" });
  });

  it("returns undefined for 204 responses", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
    });

    const result = await apiFetch<void>("/api/auth/session", { method: "DELETE" });

    expect(result).toBeUndefined();
  });

  it("throws ApiError with backend message on failure", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: async () => ({ message: "Credenciais inválidas" }),
    });

    await expect(apiFetch("/api/auth/session", { method: "POST" })).rejects.toMatchObject({
      status: 401,
      message: "Credenciais inválidas",
    });
  });

  it("sends credentials include on every request", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [], meta: {}, links: {} }),
    });

    await apiFetch("/api/transactions");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("injects CSRF header for protected mutations when cookie exists", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
    });

    await apiFetch("/api/transactions/1", { method: "DELETE" });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Headers;
    expect(headers.get("X-XSRF-TOKEN")).toBe("csrf-token-value");
  });

  it("does not inject CSRF header for public login requests", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { userId: "1", email: "a@b.com" }, meta: {}, links: {} }),
    });

    await apiFetch("/api/auth/session", {
      method: "POST",
      body: JSON.stringify({ email: "a@b.com", password: "password" }),
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Headers;
    expect(headers.get("X-XSRF-TOKEN")).toBeNull();
  });

  it("throws ApiError instances", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: async () => ({ message: "E-mail inválido" }),
    });

    await expect(apiFetch("/api/auth/register", { method: "POST" })).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});
