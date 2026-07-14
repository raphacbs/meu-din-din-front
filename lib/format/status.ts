import type { TransactionStatus } from "@/lib/types/api";

const STATUS_LABELS: Record<TransactionStatus, string> = {
  A_VENCER: "A vencer",
  VENCE_HOJE: "Vence hoje",
  ATRASADA: "Atrasada",
  PAGO: "Pago",
  PAGO_COM_ATRASO: "Pago com atraso",
  CANCELADA: "Cancelada",
};

export type StatusTone = "default" | "success" | "warning" | "danger" | "muted";

/** Cores semânticas do `antd Tag` por status de transação. */
export type TransactionStatusColor =
  | "processing"
  | "warning"
  | "error"
  | "success"
  | "cyan"
  | "default";

const STATUS_TONES: Record<TransactionStatus, StatusTone> = {
  A_VENCER: "default",
  VENCE_HOJE: "warning",
  ATRASADA: "danger",
  PAGO: "success",
  PAGO_COM_ATRASO: "success",
  CANCELADA: "muted",
};

const STATUS_COLORS: Record<TransactionStatus, TransactionStatusColor> = {
  A_VENCER: "processing",
  VENCE_HOJE: "warning",
  ATRASADA: "error",
  PAGO: "success",
  PAGO_COM_ATRASO: "cyan",
  CANCELADA: "default",
};

export function formatTransactionStatus(status: TransactionStatus): string {
  return STATUS_LABELS[status];
}

export function getTransactionStatusTone(status: TransactionStatus): StatusTone {
  return STATUS_TONES[status];
}

export function getTransactionStatusColor(status: TransactionStatus): TransactionStatusColor {
  return STATUS_COLORS[status];
}
