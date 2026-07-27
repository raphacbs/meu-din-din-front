import { describe, expect, it } from "vitest";

import {
  calculateDistributionShares,
  calculateMeuMesSummary,
  calculatePeriodTotals,
  calculateTagShares,
  listDistinctTags,
  partitionByTag,
  splitMeuMesLists,
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

describe("splitMeuMesLists / calculateMeuMesSummary", () => {
  it("splits pending vs settled, excludes canceled, and sorts pending by urgency", () => {
    const items: TransactionResponse[] = [
      {
        ...baseTransaction,
        id: "tx-a-vencer",
        status: "A_VENCER",
        dueDate: "2024-07-20",
      },
      {
        ...baseTransaction,
        id: "tx-atrasada",
        status: "ATRASADA",
        dueDate: "2024-07-01",
      },
      {
        ...baseTransaction,
        id: "tx-hoje",
        status: "VENCE_HOJE",
        dueDate: "2024-07-12",
      },
      {
        ...baseTransaction,
        id: "tx-pago-old",
        status: "PAGO",
        paymentDate: "2024-07-02",
      },
      {
        ...baseTransaction,
        id: "tx-pago-new",
        type: "RECEITA",
        amount: 200,
        status: "PAGO_COM_ATRASO",
        paymentDate: "2024-07-10",
      },
      {
        ...baseTransaction,
        id: "tx-cancel",
        status: "CANCELADA",
      },
    ];

    const { pending, settled } = splitMeuMesLists(items);
    expect(pending.map((item) => item.id)).toEqual([
      "tx-atrasada",
      "tx-hoje",
      "tx-a-vencer",
    ]);
    expect(settled.map((item) => item.id)).toEqual(["tx-pago-new", "tx-pago-old"]);
  });

  it("computes dual balances and pending pay/receive totals", () => {
    const items: TransactionResponse[] = [
      { ...baseTransaction, id: "tx-1", amount: 100, status: "A_VENCER" },
      {
        ...baseTransaction,
        id: "tx-2",
        type: "RECEITA",
        amount: 500,
        status: "PAGO",
        paymentDate: "2024-07-05",
      },
      {
        ...baseTransaction,
        id: "tx-3",
        type: "RECEITA",
        amount: 80,
        status: "A_VENCER",
      },
      { ...baseTransaction, id: "tx-4", amount: 200, status: "CANCELADA" },
    ];

    expect(calculateMeuMesSummary(items)).toEqual({
      planned: { expenseTotal: 100, revenueTotal: 580, balance: 480 },
      realized: { expenseTotal: 0, revenueTotal: 500, balance: 500 },
      activeCount: 3,
      settledCount: 1,
      pendingExpenseTotal: 100,
      pendingRevenueTotal: 80,
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

describe("listDistinctTags", () => {
  it("returns distinct tags sorted alphabetically", () => {
    const items: TransactionResponse[] = [
      { ...baseTransaction, id: "tx-1", tags: ["mercado", "casa"] },
      { ...baseTransaction, id: "tx-2", tags: ["casa"] },
      { ...baseTransaction, id: "tx-3", tags: [] },
      { ...baseTransaction, id: "tx-4" },
    ];

    expect(listDistinctTags(items)).toEqual(["casa", "mercado"]);
  });

  it("returns an empty array when there are no tags", () => {
    expect(listDistinctTags([baseTransaction])).toEqual([]);
  });
});

describe("partitionByTag", () => {
  const items: TransactionResponse[] = [
    { ...baseTransaction, id: "tx-1", type: "DESPESA", amount: 100, tags: ["casa"] },
    { ...baseTransaction, id: "tx-2", type: "DESPESA", amount: 50, tags: ["transporte"] },
    {
      ...baseTransaction,
      id: "tx-3",
      type: "RECEITA",
      amount: 30,
      status: "PAGO",
      tags: ["casa", "extra"],
    },
    { ...baseTransaction, id: "tx-4", type: "DESPESA", amount: 20, tags: [] },
  ];

  it("puts everything in rest and zeroes total/count when tag is null", () => {
    expect(partitionByTag(items, null)).toEqual({
      group: [],
      rest: items,
      total: 0,
      count: 0,
    });
  });

  it("splits into group/rest, preserving rest order, and computes net total", () => {
    const result = partitionByTag(items, "casa");

    expect(result.group.map((item) => item.id)).toEqual(["tx-1", "tx-3"]);
    expect(result.rest.map((item) => item.id)).toEqual(["tx-2", "tx-4"]);
    expect(result.total).toBe(30 - 100);
    expect(result.count).toBe(2);
  });

  it("returns an empty group when no transaction has the tag", () => {
    const result = partitionByTag(items, "inexistente");

    expect(result.group).toEqual([]);
    expect(result.rest).toEqual(items);
    expect(result.total).toBe(0);
    expect(result.count).toBe(0);
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
