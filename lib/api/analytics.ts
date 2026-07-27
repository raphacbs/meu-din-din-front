import { apiFetch } from "@/lib/api/client";
import type { DashboardAnalyticsResponse } from "@/lib/types/api";

export const analytics = {
  dashboard: (year: number) =>
    apiFetch<DashboardAnalyticsResponse>(`/api/analytics/dashboard?year=${year}`),
};
