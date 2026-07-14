import { apiFetch } from "@/lib/api/client";
import type { LoginRequest, RegisterRequest, SessionResponse } from "@/lib/types/api";

export const auth = {
  register: (body: RegisterRequest) =>
    apiFetch<SessionResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: LoginRequest) =>
    apiFetch<SessionResponse>("/api/auth/session", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  logout: () =>
    apiFetch<void>("/api/auth/session", {
      method: "DELETE",
    }),
};
