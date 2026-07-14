import type { TransactionResponse } from "@/lib/types/api";

export interface DashboardSummary {
  revenueTotal: number;
  expenseTotal: number;
  dueToday: TransactionResponse[];
  overdue: TransactionResponse[];
  paid: TransactionResponse[];
  upcoming: TransactionResponse[];
}

function isPaid(status: TransactionResponse["status"]): boolean {
  return status === "PAGO" || status === "PAGO_COM_ATRASO";
}

export function summarizeTransactions(
  transactions: TransactionResponse[],
): DashboardSummary {
  const active = transactions.filter((transaction) => transaction.status !== "CANCELADA");

  const revenueTotal = active
    .filter((transaction) => transaction.type === "RECEITA")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expenseTotal = active
    .filter((transaction) => transaction.type === "DESPESA")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const dueToday = active.filter((transaction) => transaction.status === "VENCE_HOJE");
  const overdue = active.filter((transaction) => transaction.status === "ATRASADA");
  const paid = active.filter((transaction) => isPaid(transaction.status));
  const upcoming = active.filter((transaction) => transaction.status === "A_VENCER");

  return {
    revenueTotal,
    expenseTotal,
    dueToday,
    overdue,
    paid,
    upcoming,
  };
}
