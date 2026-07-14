import { formatTransactionStatus } from "@/lib/format/status";
import type { TransactionResponse } from "@/lib/types/api";

export interface PeriodTotals {
  expenseTotal: number;
  revenueTotal: number;
  balance: number;
}

export interface DistributionShare {
  key: string;
  label: string;
  amount: number;
  count: number;
  percent: number;
}

/** @deprecated Prefer DistributionShare — mantido para compatibilidade dos testes existentes. */
export interface TagShare {
  tag: string;
  amount: number;
  count: number;
  percent: number;
}

export type DistributionDimension = "tag" | "status" | "type";

export function calculatePeriodTotals(transactions: TransactionResponse[]): PeriodTotals {
  const active = transactions.filter((transaction) => transaction.status !== "CANCELADA");

  const revenueTotal = active
    .filter((transaction) => transaction.type === "RECEITA")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expenseTotal = active
    .filter((transaction) => transaction.type === "DESPESA")
    .reduce((total, transaction) => total + transaction.amount, 0);

  return {
    expenseTotal,
    revenueTotal,
    balance: revenueTotal - expenseTotal,
  };
}

function toShares(
  buckets: Map<string, { label: string; amount: number; count: number }>,
): DistributionShare[] {
  const totalAmount = [...buckets.values()].reduce((sum, item) => sum + item.amount, 0);
  if (totalAmount <= 0) {
    return [];
  }

  return [...buckets.entries()]
    .map(([key, { label, amount, count }]) => ({
      key,
      label,
      amount,
      count,
      percent: (amount / totalAmount) * 100,
    }))
    .sort((a, b) => b.amount - a.amount || a.label.localeCompare(b.label));
}

function addToBucket(
  buckets: Map<string, { label: string; amount: number; count: number }>,
  key: string,
  label: string,
  amount: number,
) {
  const current = buckets.get(key) ?? { label, amount: 0, count: 0 };
  buckets.set(key, {
    label,
    amount: current.amount + amount,
    count: current.count + 1,
  });
}

/** Distribuição percentual das tags por valor (exclui canceladas). */
export function calculateTagShares(transactions: TransactionResponse[]): TagShare[] {
  return calculateDistributionShares(transactions, "tag").map((share) => ({
    tag: share.label,
    amount: share.amount,
    count: share.count,
    percent: share.percent,
  }));
}

export function calculateDistributionShares(
  transactions: TransactionResponse[],
  dimension: DistributionDimension,
): DistributionShare[] {
  const source =
    dimension === "status"
      ? transactions
      : transactions.filter((transaction) => transaction.status !== "CANCELADA");

  const buckets = new Map<string, { label: string; amount: number; count: number }>();

  for (const transaction of source) {
    if (dimension === "tag") {
      const tags = transaction.tags?.length ? transaction.tags : ["Sem tag"];
      for (const tag of tags) {
        addToBucket(buckets, tag, tag, transaction.amount);
      }
      continue;
    }

    if (dimension === "status") {
      addToBucket(
        buckets,
        transaction.status,
        formatTransactionStatus(transaction.status),
        transaction.amount,
      );
      continue;
    }

    addToBucket(
      buckets,
      transaction.type,
      transaction.type === "RECEITA" ? "Receita" : "Despesa",
      transaction.amount,
    );
  }

  return toShares(buckets);
}
