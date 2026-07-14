import dayjs, { type Dayjs } from "dayjs";
import { create } from "zustand";

import { users } from "@/lib/api/users";
import type { TransactionResponse } from "@/lib/types/api";

export interface UserPreferences {
  blockPastMonthMutations: boolean;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  blockPastMonthMutations: true,
};

interface UserPreferencesState extends UserPreferences {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setBlockPastMonthMutations: (value: boolean) => void;
}

export const useUserPreferencesStore = create<UserPreferencesState>((set) => ({
  ...DEFAULT_USER_PREFERENCES,
  hydrated: false,

  hydrate: async () => {
    try {
      const prefs = await users.getPreferences();
      set({
        blockPastMonthMutations: prefs.blockPastMonthMutations,
        hydrated: true,
      });
    } catch (error) {
      set({
        ...DEFAULT_USER_PREFERENCES,
        hydrated: true,
      });
      throw error;
    }
  },

  setBlockPastMonthMutations: (value) => {
    set({ blockPastMonthMutations: value, hydrated: true });
  },
}));

export function getTransactionReferenceDate(
  transaction: Pick<TransactionResponse, "dueDate" | "transactionDate">,
): string {
  return transaction.dueDate ?? transaction.transactionDate;
}

/** True quando a preferência bloqueia mutações desta transação (mês passado). */
export function isPastMonthMutationBlocked(
  transaction: Pick<TransactionResponse, "dueDate" | "transactionDate">,
  prefs: Pick<UserPreferences, "blockPastMonthMutations">,
  today: Dayjs = dayjs(),
): boolean {
  if (!prefs.blockPastMonthMutations) {
    return false;
  }

  const reference = dayjs(getTransactionReferenceDate(transaction));
  const referenceYm = reference.year() * 12 + reference.month();
  const todayYm = today.year() * 12 + today.month();

  return referenceYm < todayYm;
}
