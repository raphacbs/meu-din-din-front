import { formatTransactionStatus } from "@/lib/format/status";
import type { TransactionResponse, TransactionStatus } from "@/lib/types/api";

export interface PeriodTotals {
  expenseTotal: number;
  revenueTotal: number;
  balance: number;
}

export interface MeuMesSummary {
  planned: PeriodTotals;
  realized: PeriodTotals;
  activeCount: number;
  settledCount: number;
  pendingExpenseTotal: number;
  pendingRevenueTotal: number;
}

export interface MeuMesLists {
  pending: TransactionResponse[];
  settled: TransactionResponse[];
}

const SETTLED_STATUSES: ReadonlySet<TransactionStatus> = new Set([
  "PAGO",
  "PAGO_COM_ATRASO",
]);

const PENDING_STATUS_RANK: Record<string, number> = {
  ATRASADA: 0,
  VENCE_HOJE: 1,
};

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

function sumByType(
  transactions: TransactionResponse[],
  type: TransactionResponse["type"],
): number {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0);
}

export function calculatePeriodTotals(transactions: TransactionResponse[]): PeriodTotals {
  const active = transactions.filter((transaction) => transaction.status !== "CANCELADA");
  const revenueTotal = sumByType(active, "RECEITA");
  const expenseTotal = sumByType(active, "DESPESA");

  return {
    expenseTotal,
    revenueTotal,
    balance: revenueTotal - expenseTotal,
  };
}

export function isSettledStatus(status: TransactionStatus): boolean {
  return SETTLED_STATUSES.has(status);
}

export function isPendingStatus(status: TransactionStatus): boolean {
  return status !== "CANCELADA" && !SETTLED_STATUSES.has(status);
}

function sortKeyDate(transaction: TransactionResponse, preferDue: boolean): string {
  if (preferDue) {
    return transaction.dueDate ?? transaction.transactionDate;
  }
  return transaction.paymentDate ?? transaction.transactionDate;
}

export function splitMeuMesLists(transactions: TransactionResponse[]): MeuMesLists {
  const pending = transactions
    .filter((transaction) => isPendingStatus(transaction.status))
    .sort((left, right) => {
      const rankLeft = PENDING_STATUS_RANK[left.status] ?? 2;
      const rankRight = PENDING_STATUS_RANK[right.status] ?? 2;
      if (rankLeft !== rankRight) {
        return rankLeft - rankRight;
      }
      return sortKeyDate(left, true).localeCompare(sortKeyDate(right, true));
    });

  const settled = transactions
    .filter((transaction) => isSettledStatus(transaction.status))
    .sort((left, right) => sortKeyDate(right, false).localeCompare(sortKeyDate(left, false)));

  return { pending, settled };
}

export function calculateMeuMesSummary(transactions: TransactionResponse[]): MeuMesSummary {
  const active = transactions.filter((transaction) => transaction.status !== "CANCELADA");
  const settled = active.filter((transaction) => isSettledStatus(transaction.status));
  const pending = active.filter((transaction) => isPendingStatus(transaction.status));

  return {
    planned: calculatePeriodTotals(active),
    realized: calculatePeriodTotals(settled),
    activeCount: active.length,
    settledCount: settled.length,
    pendingExpenseTotal: sumByType(pending, "DESPESA"),
    pendingRevenueTotal: sumByType(pending, "RECEITA"),
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

/** Tags distintas presentes na lista, ordenadas alfabeticamente. Não inclui "Sem tag". */
export function listDistinctTags(transactions: TransactionResponse[]): string[] {
  const tags = new Set<string>();
  for (const transaction of transactions) {
    for (const tag of transaction.tags ?? []) {
      tags.add(tag);
    }
  }
  return [...tags].sort((left, right) => left.localeCompare(right));
}

export interface TagPartition {
  group: TransactionResponse[];
  rest: TransactionResponse[];
  total: number;
  count: number;
}

/**
 * Particiona `transactions` entre quem possui `tag` (grupo) e quem não possui (resto).
 * `rest` preserva a ordem original de `transactions`. `total` é o saldo líquido
 * (RECEITA − DESPESA) do grupo. Quando `tag` é `null`, tudo cai em `rest`.
 */
export function partitionByTag(
  transactions: TransactionResponse[],
  tag: string | null,
): TagPartition {
  if (!tag) {
    return { group: [], rest: transactions, total: 0, count: 0 };
  }

  const group: TransactionResponse[] = [];
  const rest: TransactionResponse[] = [];

  for (const transaction of transactions) {
    if (transaction.tags?.includes(tag)) {
      group.push(transaction);
    } else {
      rest.push(transaction);
    }
  }

  const total =
    sumByType(group, "RECEITA") - sumByType(group, "DESPESA");

  return { group, rest, total, count: group.length };
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
