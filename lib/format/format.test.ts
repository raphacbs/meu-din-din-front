import { describe, expect, it } from "vitest";

import { formatCurrency, formatSignedCurrency } from "@/lib/format/currency";
import { formatDate, formatDateTime, formatRelativeTime } from "@/lib/format/date";
import { formatFileSize } from "@/lib/format/file-size";
import {
  formatTransactionStatus,
  getTransactionStatusColor,
  getTransactionStatusTone,
} from "@/lib/format/status";

describe("formatCurrency", () => {
  it("formats BRL values", () => {
    expect(formatCurrency(1200.5)).toContain("1.200,50");
    expect(formatCurrency(1200.5)).toContain("R$");
  });
});

describe("formatSignedCurrency", () => {
  it("prefixes expense and revenue amounts", () => {
    expect(formatSignedCurrency(80, "DESPESA")).toMatch(/^-/);
    expect(formatSignedCurrency(500, "RECEITA")).toMatch(/^\+/);
  });
});

describe("formatDate", () => {
  it("formats ISO date-only values without timezone drift", () => {
    expect(formatDate("2024-07-05")).toBe("05/07/2024");
  });
});

describe("formatDateTime", () => {
  it("formats datetime values in pt-BR", () => {
    const formatted = formatDateTime("2024-07-05T15:30:00.000Z");
    expect(formatted).toContain("2024");
  });
});

describe("formatRelativeTime", () => {
  it("returns minute-based labels", () => {
    const now = new Date("2024-07-05T12:10:00.000Z");
    expect(formatRelativeTime("2024-07-05T12:05:00.000Z", now)).toBe("há 5 min");
  });
});

describe("formatTransactionStatus", () => {
  it("maps backend statuses to readable labels", () => {
    expect(formatTransactionStatus("VENCE_HOJE")).toBe("Vence hoje");
    expect(formatTransactionStatus("CANCELADA")).toBe("Cancelada");
  });

  it("assigns visual tones for statuses", () => {
    expect(getTransactionStatusTone("ATRASADA")).toBe("danger");
    expect(getTransactionStatusTone("PAGO")).toBe("success");
  });

  it("assigns distinct semantic colors for each status", () => {
    expect(getTransactionStatusColor("A_VENCER")).toBe("processing");
    expect(getTransactionStatusColor("VENCE_HOJE")).toBe("warning");
    expect(getTransactionStatusColor("ATRASADA")).toBe("error");
    expect(getTransactionStatusColor("PAGO")).toBe("success");
    expect(getTransactionStatusColor("PAGO_COM_ATRASO")).toBe("#f87171");
    expect(getTransactionStatusColor("CANCELADA")).toBe("default");
  });
});

describe("formatFileSize", () => {
  it("formats byte sizes progressively", () => {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(2048)).toBe("2 KB");
    expect(formatFileSize(1_572_864)).toBe("1,5 MB");
  });

  it("returns a placeholder for invalid values", () => {
    expect(formatFileSize(Number.NaN)).toBe("—");
  });
});
