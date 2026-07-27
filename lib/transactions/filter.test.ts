import { describe, expect, it } from "vitest";

import { filterMeuMesTransactions } from "@/lib/transactions/filter";
import type { TransactionResponse } from "@/lib/types/api";

function tx(overrides: Partial<TransactionResponse> & { id: string }): TransactionResponse {
  return {
    type: "DESPESA",
    amount: 100,
    description: overrides.description ?? overrides.id,
    transactionDate: "2026-07-01",
    dueDate: "2026-07-01",
    status: "A_VENCER",
    ...overrides,
  };
}

describe("filterMeuMesTransactions", () => {
  const items = [
    tx({ id: "1", description: "Aluguel", tags: ["casa"] }),
    tx({ id: "2", description: "Salário", type: "RECEITA", tags: ["trabalho"] }),
    tx({ id: "3", description: "Netflix", tags: ["lazer"] }),
  ];

  it("returns all items when search and type filter are empty", () => {
    expect(filterMeuMesTransactions(items)).toHaveLength(3);
  });

  it("filters by description case-insensitively", () => {
    expect(filterMeuMesTransactions(items, { searchQuery: "alug" })).toEqual([items[0]]);
  });

  it("filters by tag name case-insensitively", () => {
    expect(filterMeuMesTransactions(items, { searchQuery: "LAZER" })).toEqual([items[2]]);
  });

  it("filters by transaction type", () => {
    expect(filterMeuMesTransactions(items, { typeFilter: "RECEITA" })).toEqual([items[1]]);
    expect(filterMeuMesTransactions(items, { typeFilter: "DESPESA" })).toHaveLength(2);
  });

  it("combines search and type filter", () => {
    expect(
      filterMeuMesTransactions(items, { searchQuery: "net", typeFilter: "DESPESA" }),
    ).toEqual([items[2]]);
  });

  it("returns empty array when nothing matches", () => {
    expect(filterMeuMesTransactions(items, { searchQuery: "inexistente" })).toEqual([]);
  });
});
