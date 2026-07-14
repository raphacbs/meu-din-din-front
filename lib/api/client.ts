import type { ApiErrorBody, EnvelopeResponse } from "@/lib/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function isPublicMutation(path: string, method?: string): boolean {
  const normalizedMethod = (method ?? "GET").toUpperCase();

  if (path === "/api/auth/register" && normalizedMethod === "POST") {
    return true;
  }

  if (path === "/api/auth/session" && normalizedMethod === "POST") {
    return true;
  }

  return false;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  return match?.split("=")[1] ?? null;
}

function isMutatingMethod(method?: string): boolean {
  const normalized = (method ?? "GET").toUpperCase();
  return (
    normalized === "POST" ||
    normalized === "PUT" ||
    normalized === "PATCH" ||
    normalized === "DELETE"
  );
}

export function requiresCsrfToken(path: string, method?: string): boolean {
  if (!isMutatingMethod(method)) {
    return false;
  }

  return !isPublicMutation(path, method);
}

function shouldHandleUnauthorized(path: string, method?: string): boolean {
  const normalizedMethod = (method ?? "GET").toUpperCase();

  if (path === "/api/auth/register" && normalizedMethod === "POST") {
    return false;
  }

  if (path === "/api/auth/session" && normalizedMethod === "POST") {
    return false;
  }

  return true;
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return body.message ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  if (requiresCsrfToken(path, init.method)) {
    const csrfToken = getCookie("XSRF-TOKEN");
    if (csrfToken) {
      headers.set("X-XSRF-TOKEN", csrfToken);
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);

    if (response.status === 401 && unauthorizedHandler && shouldHandleUnauthorized(path, init.method)) {
      unauthorizedHandler();
    }

    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const envelope = (await response.json()) as EnvelopeResponse<T>;
  return envelope.data;
}
