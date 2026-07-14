import { describe, expect, it } from "vitest";

import {
  calculateDistributionShares,
  calculatePeriodTotals,
  calculateTagShares,
} from "@/lib/transactions/totals";
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

describe("calculatePeriodTotals", () => {
  it("sums expenses, revenues and balance excluding canceled", () => {
    const items: TransactionResponse[] = [
      baseTransaction,
      { ...baseTransaction, id: "tx-2", type: "RECEITA", amount: 500, status: "PAGO" },
      { ...baseTransaction, id: "tx-3", amount: 50, status: "ATRASADA" },
      { ...baseTransaction, id: "tx-4", amount: 200, status: "CANCELADA" },
      {
        ...baseTransaction,
        id: "tx-5",
        type: "RECEITA",
        amount: 80,
        status: "CANCELADA",
      },
    ];

    expect(calculatePeriodTotals(items)).toEqual({
      expenseTotal: 150,
      revenueTotal: 500,
      balance: 350,
    });
  });

  it("returns zeros for an empty list", () => {
    expect(calculatePeriodTotals([])).toEqual({
      expenseTotal: 0,
      revenueTotal: 0,
      balance: 0,
    });
  });
});

describe("calculateTagShares", () => {
  it("computes percentual shares by tag amount and ignores canceled", () => {
    const items: TransactionResponse[] = [
      { ...baseTransaction, id: "tx-1", amount: 100, tags: ["casa"] },
      { ...baseTransaction, id: "tx-2", amount: 100, tags: ["casa", "mercado"] },
      {
        ...baseTransaction,
        id: "tx-3",
        type: "RECEITA",
        amount: 200,
        status: "PAGO",
        tags: ["trabalho"],
      },
      {
        ...baseTransaction,
        id: "tx-4",
        amount: 999,
        status: "CANCELADA",
        tags: ["casa"],
      },
    ];

    const shares = calculateTagShares(items);
    expect(shares).toEqual([
      { tag: "casa", amount: 200, count: 2, percent: 40 },
      { tag: "trabalho", amount: 200, count: 1, percent: 40 },
      { tag: "mercado", amount: 100, count: 1, percent: 20 },
    ]);
  });
});

describe("calculateDistributionShares", () => {
  const items: TransactionResponse[] = [
    { ...baseTransaction, id: "tx-1", amount: 100, status: "A_VENCER", tags: ["casa"] },
    {
      ...baseTransaction,
      id: "tx-2",
      type: "RECEITA",
      amount: 300,
      status: "PAGO",
      tags: ["trabalho"],
    },
    {
      ...baseTransaction,
      id: "tx-3",
      amount: 100,
      status: "CANCELADA",
      tags: ["casa"],
    },
  ];

  it("groups by status including canceled", () => {
    expect(calculateDistributionShares(items, "status")).toEqual([
      {
        key: "PAGO",
        label: "Pago",
        amount: 300,
        count: 1,
        percent: 60,
      },
      {
        key: "A_VENCER",
        label: "A vencer",
        amount: 100,
        count: 1,
        percent: 20,
      },
      {
        key: "CANCELADA",
        label: "Cancelada",
        amount: 100,
        count: 1,
        percent: 20,
      },
    ]);
  });

  it("groups by type excluding canceled", () => {
    expect(calculateDistributionShares(items, "type")).toEqual([
      {
        key: "RECEITA",
        label: "Receita",
        amount: 300,
        count: 1,
        percent: 75,
      },
      {
        key: "DESPESA",
        label: "Despesa",
        amount: 100,
        count: 1,
        percent: 25,
      },
    ]);
  });
});
