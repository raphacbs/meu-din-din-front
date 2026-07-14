import { apiFetch } from "@/lib/api/client";
import type { ProjectionResponse } from "@/lib/types/api";

export const projections = {
  current: () => apiFetch<ProjectionResponse>("/api/projections/current"),

  recalculate: () =>
    apiFetch<ProjectionResponse>("/api/projections/recalculate", {
      method: "POST",
    }),
};
