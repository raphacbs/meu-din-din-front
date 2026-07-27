import type { BatchTransactionItem } from "@/lib/types/api";

import { remainingInstallmentCount } from "./installment-description";

export type ImportLineMode = "single" | "installment" | "recurring";

export interface ImportBatchRow {
  description: string;
  amount: number;
  transactionDate: string;
  dueDate: string;
  tags: string[];
  lineMode: ImportLineMode;
  installmentCurrent?: number;
  installmentTotal?: number;
}

export function buildImportBatchItem(row: ImportBatchRow): BatchTransactionItem {
  const base: BatchTransactionItem = {
    description: row.description,
    amount: row.amount,
    transactionDate: row.transactionDate,
    dueDate: row.dueDate,
    type: "DESPESA",
    tags: row.tags,
  };

  if (row.lineMode === "recurring") {
    return {
      ...base,
      recurrence: {
        frequency: "MONTHLY",
        intervalCount: 1,
        nextOccurrenceDate: row.dueDate || row.transactionDate,
      },
    };
  }

  if (
    row.lineMode === "installment" &&
    row.installmentCurrent !== undefined &&
    row.installmentTotal !== undefined
  ) {
    const remainingCount = remainingInstallmentCount(
      row.installmentCurrent,
      row.installmentTotal,
    );

    return {
      ...base,
      amount: row.amount,
      installment: {
        installmentCount: remainingCount,
        installmentAmount: row.amount,
        firstDueDate: row.dueDate,
        startingInstallmentNumber: row.installmentCurrent,
        originalInstallmentCount: row.installmentTotal,
      },
    };
  }

  return base;
}
