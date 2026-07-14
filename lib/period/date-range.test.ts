import dayjs from "dayjs";
import { describe, expect, it } from "vitest";

import {
  currentMonthParts,
  currentMonthRange,
  inferPeriodMode,
  isValidIsoDate,
  monthRange,
  validateCustomRange,
} from "@/lib/period/date-range";

describe("monthRange", () => {
  it("returns first and last day of the month in YYYY-MM-DD", () => {
    expect(monthRange(2024, 7)).toEqual({
      from: "2024-07-01",
      to: "2024-07-31",
    });
    expect(monthRange(2024, 2)).toEqual({
      from: "2024-02-01",
      to: "2024-02-29",
    });
  });
});

describe("currentMonthRange", () => {
  it("matches the current calendar month", () => {
    const { year, month } = currentMonthParts();
    const now = dayjs();

    expect(year).toBe(now.year());
    expect(month).toBe(now.month() + 1);
    expect(currentMonthRange()).toEqual(monthRange(year, month));
  });
});

describe("inferPeriodMode", () => {
  it("infers month when from/to are full month bounds", () => {
    expect(inferPeriodMode("2024-07-01", "2024-07-31")).toBe("month");
  });

  it("infers custom for partial or cross-month ranges", () => {
    expect(inferPeriodMode("2024-07-01", "2024-07-15")).toBe("custom");
    expect(inferPeriodMode("2024-07-15", "2024-08-15")).toBe("custom");
  });
});

describe("isValidIsoDate", () => {
  it("accepts valid ISO dates and rejects invalid ones", () => {
    expect(isValidIsoDate("2024-07-01")).toBe(true);
    expect(isValidIsoDate("2024-02-30")).toBe(false);
    expect(isValidIsoDate("07/01/2024")).toBe(false);
    expect(isValidIsoDate(null)).toBe(false);
  });
});

describe("validateCustomRange", () => {
  it("requires both dates", () => {
    expect(validateCustomRange(null, "2024-07-31")).toBe(
      "Selecione a data início e a data fim para filtrar o extrato.",
    );
    expect(validateCustomRange("2024-07-01", null)).toBe(
      "Selecione a data início e a data fim para filtrar o extrato.",
    );
  });

  it("rejects from after to", () => {
    expect(validateCustomRange("2024-07-31", "2024-07-01")).toBe(
      "A data início não pode ser posterior à data fim.",
    );
  });

  it("accepts a valid range", () => {
    expect(validateCustomRange("2024-07-01", "2024-07-31")).toBeNull();
  });
});
