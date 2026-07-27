import { describe, expect, it } from "vitest";

import {
  getDefaultAnalyticsYear,
  getDefaultRadarMonth,
} from "@/lib/dashboard/analytics-defaults";

describe("analytics defaults", () => {
  it("prefers the current year when available", () => {
    const currentYear = new Date().getFullYear();

    expect(getDefaultAnalyticsYear([currentYear - 1, currentYear])).toBe(currentYear);
  });

  it("falls back to the most recent year", () => {
    expect(getDefaultAnalyticsYear([2022, 2023])).toBe(2023);
  });

  it("returns null when no years are available", () => {
    expect(getDefaultAnalyticsYear([])).toBeNull();
  });

  it("defaults radar month to December for past years", () => {
    expect(getDefaultRadarMonth(2020)).toBe(12);
  });

  it("defaults radar month to the current month for the current year", () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    expect(getDefaultRadarMonth(currentYear)).toBe(currentMonth);
  });
});
