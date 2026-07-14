import type { TransactionGroupResponse, TransactionResponse } from "@/lib/types/api";

export function getGroupIndicator(transaction: TransactionResponse): string | null {
  if (!transaction.group) {
    return null;
  }

  if (transaction.group.type === "PARCELAMENTO") {
    if (transaction.installmentNumber && transaction.installmentCount) {
      return `Parcela ${transaction.installmentNumber}/${transaction.installmentCount}`;
    }

    return "Parcelamento";
  }

  if (transaction.group.type === "RECORRENCIA") {
    return transaction.group.seriesStatus === "ATIVA" ? "Recorrente" : "Recorrência inativa";
  }

  return null;
}

export function getGroupTone(group?: TransactionGroupResponse): "default" | "muted" {
  if (group?.type === "RECORRENCIA" && group.seriesStatus === "INATIVA") {
    return "muted";
  }

  return "default";
}
