import { describe, expect, it } from "vitest";

import {
  formatInstallmentPreview,
  parseInstallmentFromDescription,
  remainingInstallmentCount,
} from "./installment-description";

describe("parseInstallmentFromDescription", () => {
  it("parses Inter-style parcela suffix", () => {
    expect(
      parseInstallmentFromDescription("LOJA XYZ (Parcela 05 de 10)"),
    ).toEqual({ current: 5, total: 10 });
  });

  it("parses generic N de M pattern", () => {
    expect(parseInstallmentFromDescription("Compra 5 de 10")).toEqual({
      current: 5,
      total: 10,
    });
  });

  it("rejects last installment", () => {
    expect(
      parseInstallmentFromDescription("LOJA XYZ (Parcela 10 de 10)"),
    ).toBeNull();
  });

  it("rejects invalid ranges", () => {
    expect(parseInstallmentFromDescription("Parcela 11 de 10")).toBeNull();
    expect(parseInstallmentFromDescription("Sem parcela")).toBeNull();
  });
});

describe("remainingInstallmentCount", () => {
  it("counts remaining installments including current", () => {
    expect(remainingInstallmentCount(5, 10)).toBe(6);
    expect(formatInstallmentPreview({ current: 5, total: 10 })).toBe(
      "5/10 → 6x",
    );
  });
});
