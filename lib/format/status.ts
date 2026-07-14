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

/** Cor do `antd Tag` por status (preset ou hex customizado). */
export type TransactionStatusColor = string;

const STATUS_TONES: Record<TransactionStatus, StatusTone> = {
  A_VENCER: "default",
  VENCE_HOJE: "warning",
  ATRASADA: "danger",
  PAGO: "success",
  PAGO_COM_ATRASO: "danger",
  CANCELADA: "muted",
};

/** Vermelho claro — distinto de `error` (ATRASADA) e de `success` (PAGO). */
export const PAGO_COM_ATRASO_COLOR = "#f87171";

const STATUS_COLORS: Record<TransactionStatus, TransactionStatusColor> = {
  A_VENCER: "processing",
  VENCE_HOJE: "warning",
  ATRASADA: "error",
  PAGO: "success",
  PAGO_COM_ATRASO: PAGO_COM_ATRASO_COLOR,
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
