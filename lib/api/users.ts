import { apiFetch } from "@/lib/api/client";
import type { UserPreferencesResponse } from "@/lib/types/api";

export const users = {
  getPreferences: () => apiFetch<UserPreferencesResponse>("/api/users/me/preferences"),

  updatePreferences: (body: UserPreferencesResponse) =>
    apiFetch<UserPreferencesResponse>("/api/users/me/preferences", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};
