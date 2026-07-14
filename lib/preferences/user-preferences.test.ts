import dayjs from "dayjs";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_USER_PREFERENCES,
  getTransactionReferenceDate,
  isPastMonthMutationBlocked,
} from "@/lib/preferences/user-preferences";

describe("user preferences helpers", () => {
  it("defaults blockPastMonthMutations to true", () => {
    expect(DEFAULT_USER_PREFERENCES.blockPastMonthMutations).toBe(true);
  });

  it("uses dueDate as reference when present", () => {
    expect(
      getTransactionReferenceDate({
        dueDate: "2024-06-15",
        transactionDate: "2024-01-01",
      }),
    ).toBe("2024-06-15");
  });

  it("falls back to transactionDate", () => {
    expect(
      getTransactionReferenceDate({
        transactionDate: "2024-01-01",
      }),
    ).toBe("2024-01-01");
  });

  it("blocks past months when preference is true", () => {
    const today = dayjs("2024-07-15");
    expect(
      isPastMonthMutationBlocked(
        { transactionDate: "2024-06-20" },
        { blockPastMonthMutations: true },
        today,
      ),
    ).toBe(true);
  });

  it("allows current and future months when preference is true", () => {
    const today = dayjs("2024-07-15");
    expect(
      isPastMonthMutationBlocked(
        { transactionDate: "2024-07-01" },
        { blockPastMonthMutations: true },
        today,
      ),
    ).toBe(false);
    expect(
      isPastMonthMutationBlocked(
        { dueDate: "2024-08-10" },
        { blockPastMonthMutations: true },
        today,
      ),
    ).toBe(false);
  });

  it("never blocks when preference is false", () => {
    const today = dayjs("2024-07-15");
    expect(
      isPastMonthMutationBlocked(
        { transactionDate: "2024-01-01" },
        { blockPastMonthMutations: false },
        today,
      ),
    ).toBe(false);
  });
});
