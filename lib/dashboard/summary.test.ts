import { describe, expect, it } from "vitest";

import { summarizeTransactions } from "@/lib/dashboard/summary";
import type { TransactionResponse } from "@/lib/types/api";

const baseTransaction: TransactionResponse = {
  id: "tx-1",
  type: "DESPESA",
  amount: 100,
  description: "Mercado",
  transactionDate: "2024-07-01",
  dueDate: "2024-07-05",
  status: "A_VENCER",
};

describe("summarizeTransactions", () => {
  it("groups transactions by financial status", () => {
    const items: TransactionResponse[] = [
      baseTransaction,
      { ...baseTransaction, id: "tx-2", type: "RECEITA", amount: 500, status: "PAGO" },
      { ...baseTransaction, id: "tx-3", status: "VENCE_HOJE" },
      { ...baseTransaction, id: "tx-4", status: "ATRASADA" },
      { ...baseTransaction, id: "tx-5", status: "CANCELADA" },
    ];

    const summary = summarizeTransactions(items);

    expect(summary.revenueTotal).toBe(500);
    expect(summary.expenseTotal).toBe(300);
    expect(summary.dueToday).toHaveLength(1);
    expect(summary.overdue).toHaveLength(1);
    expect(summary.paid).toHaveLength(1);
    expect(summary.upcoming).toHaveLength(1);
  });
});
