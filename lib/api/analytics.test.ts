import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { analytics } from "@/lib/api/analytics";
import type { DashboardAnalyticsResponse } from "@/lib/types/api";

vi.mock("@/lib/api/client", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "@/lib/api/client";

const mockDashboardResponse: DashboardAnalyticsResponse = {
  year: 2024,
  availableYears: [2024, 2023],
  monthlyTotals: Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    expenseTotal: 100 * (index + 1),
    incomeTotal: 200 * (index + 1),
  })),
  tagRadar: {
    yearTotals: [
      { tag: "Alimentação", amount: 1200 },
      { tag: "Transporte", amount: 800 },
    ],
    monthly: [
      {
        month: 7,
        tags: [
          { tag: "Alimentação", amount: 150 },
          { tag: "Transporte", amount: 90 },
        ],
      },
    ],
  },
  expensePareto: [
    { tag: "Alimentação", amount: 1200, percent: 60, cumulativePercent: 60 },
    { tag: "Transporte", amount: 800, percent: 40, cumulativePercent: 100 },
  ],
};

describe("analytics API", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockResolvedValue(mockDashboardResponse);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("requests dashboard analytics with year query param", async () => {
    const result = await analytics.dashboard(2024);

    expect(apiFetch).toHaveBeenCalledWith("/api/analytics/dashboard?year=2024");
    expect(result).toEqual(mockDashboardResponse);
  });

  it("unwraps envelope data through apiFetch", async () => {
    await analytics.dashboard(2023);

    expect(apiFetch).toHaveBeenCalledTimes(1);
    expect(apiFetch).toHaveBeenCalledWith("/api/analytics/dashboard?year=2023");
  });
});
