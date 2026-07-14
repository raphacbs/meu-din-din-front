import dayjs from "dayjs";
import { create } from "zustand";

import {
  type DateRange,
  type PeriodMode,
  currentMonthParts,
  monthRange,
} from "@/lib/period/date-range";

export interface PeriodDraft {
  mode: PeriodMode;
  year: number;
  month: number;
  from: string | null;
  to: string | null;
}

interface PeriodState {
  draft: PeriodDraft;
  applied: DateRange | null;
  setMode: (mode: PeriodMode) => void;
  setMonth: (year: number, month: number) => void;
  setCustomRange: (from: string | null, to: string | null) => void;
  apply: () => DateRange | null;
  hydrate: (from: string, to: string) => void;
  applyCurrentMonthDefault: () => DateRange;
  reset: () => void;
}

function createInitialDraft(): PeriodDraft {
  const { year, month } = currentMonthParts();
  const range = monthRange(year, month);

  return {
    mode: "month",
    year,
    month,
    from: range.from,
    to: range.to,
  };
}

function createInitialState(): Pick<PeriodState, "draft" | "applied"> {
  return {
    draft: createInitialDraft(),
    applied: null,
  };
}

export const usePeriodStore = create<PeriodState>((set, get) => ({
  ...createInitialState(),

  setMode: (mode) => {
    set((state) => {
      if (mode === "month") {
        const range = monthRange(state.draft.year, state.draft.month);
        return {
          draft: {
            ...state.draft,
            mode,
            from: range.from,
            to: range.to,
          },
        };
      }

      return {
        draft: {
          ...state.draft,
          mode,
        },
      };
    });
  },

  setMonth: (year, month) => {
    const range = monthRange(year, month);
    set((state) => ({
      draft: {
        ...state.draft,
        mode: "month",
        year,
        month,
        from: range.from,
        to: range.to,
      },
    }));
  },

  setCustomRange: (from, to) => {
    set((state) => ({
      draft: {
        ...state.draft,
        mode: "custom",
        from,
        to,
      },
    }));
  },

  apply: () => {
    const { draft } = get();
    if (!draft.from || !draft.to) {
      return null;
    }

    const applied = { from: draft.from, to: draft.to };
    set({ applied });
    return applied;
  },

  hydrate: (from, to) => {
    const fromDate = dayjs(from);

    set({
      draft: {
        mode: "custom",
        year: fromDate.year(),
        month: fromDate.month() + 1,
        from,
        to,
      },
      applied: { from, to },
    });
  },

  applyCurrentMonthDefault: () => {
    const { year, month } = currentMonthParts();
    const range = monthRange(year, month);

    set({
      draft: {
        mode: "month",
        year,
        month,
        from: range.from,
        to: range.to,
      },
      applied: range,
    });

    return range;
  },

  reset: () => {
    set(createInitialState());
  },
}));
