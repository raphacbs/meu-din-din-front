import dayjs from "dayjs";
import { beforeEach, describe, expect, it } from "vitest";

import { currentMonthRange, monthRange } from "@/lib/period/date-range";
import { usePeriodStore } from "@/lib/stores/period-store";

describe("usePeriodStore", () => {
  beforeEach(() => {
    usePeriodStore.getState().reset();
  });

  it("initializes draft as current month without applied period", () => {
    const state = usePeriodStore.getState();
    const expected = currentMonthRange();

    expect(state.draft.mode).toBe("month");
    expect(state.draft.from).toBe(expected.from);
    expect(state.draft.to).toBe(expected.to);
    expect(state.applied).toBeNull();
  });

  it("setMonth updates draft range without applying", () => {
    usePeriodStore.getState().setMonth(2024, 7);
    const state = usePeriodStore.getState();

    expect(state.draft).toMatchObject({
      mode: "month",
      year: 2024,
      month: 7,
      from: "2024-07-01",
      to: "2024-07-31",
    });
    expect(state.applied).toBeNull();
  });

  it("setMode month recalculates draft from selected month", () => {
    usePeriodStore.getState().setCustomRange("2024-07-10", "2024-07-20");
    usePeriodStore.getState().setMonth(2024, 8);
    usePeriodStore.getState().setMode("custom");
    usePeriodStore.getState().setMode("month");

    expect(usePeriodStore.getState().draft).toMatchObject({
      mode: "month",
      from: "2024-08-01",
      to: "2024-08-31",
    });
  });

  it("apply copies draft from/to into applied", () => {
    usePeriodStore.getState().setMonth(2024, 7);
    const applied = usePeriodStore.getState().apply();

    expect(applied).toEqual({ from: "2024-07-01", to: "2024-07-31" });
    expect(usePeriodStore.getState().applied).toEqual(applied);
  });

  it("hydrate sets draft and applied in custom mode with the URL dates", () => {
    usePeriodStore.getState().hydrate("2024-07-01", "2024-07-31");
    expect(usePeriodStore.getState()).toMatchObject({
      draft: { mode: "custom", from: "2024-07-01", to: "2024-07-31" },
      applied: { from: "2024-07-01", to: "2024-07-31" },
    });

    usePeriodStore.getState().hydrate("2024-07-01", "2024-07-15");
    expect(usePeriodStore.getState().draft.mode).toBe("custom");
    expect(usePeriodStore.getState().draft).toMatchObject({
      from: "2024-07-01",
      to: "2024-07-15",
    });
  });

  it("applyCurrentMonthDefault applies the current month", () => {
    const range = usePeriodStore.getState().applyCurrentMonthDefault();
    const expected = monthRange(dayjs().year(), dayjs().month() + 1);

    expect(range).toEqual(expected);
    expect(usePeriodStore.getState().applied).toEqual(expected);
    expect(usePeriodStore.getState().draft.mode).toBe("month");
  });
});
