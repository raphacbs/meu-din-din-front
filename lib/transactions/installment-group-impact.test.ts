import { describe, expect, it } from "vitest";

import { buildInstallmentGroupImpact } from "@/lib/transactions/installment-group-impact";

const baseline = {
  installmentCount: 6,
  installmentAmount: 500,
  firstDueDate: "2024-08-01",
  description: "Notebook",
  tags: ["eletrônicos"],
};

describe("buildInstallmentGroupImpact", () => {
  it("returns no structural impact when only description/tags change", () => {
    const impact = buildInstallmentGroupImpact(baseline, {
      ...baseline,
      description: "Notebook atualizado",
      tags: ["eletrônicos", "trabalho"],
    });

    expect(impact.hasStructuralImpact).toBe(false);
    expect(impact.messages).toEqual([]);
  });

  it("warns when installment amount changes", () => {
    const impact = buildInstallmentGroupImpact(baseline, {
      ...baseline,
      installmentAmount: 550,
    });

    expect(impact.hasStructuralImpact).toBe(true);
    expect(impact.amountChanged).toBe(true);
    expect(impact.messages).toContain(
      "O novo valor será aplicado a todas as parcelas do grupo, inclusive as já liquidadas.",
    );
  });

  it("warns when installment count increases", () => {
    const impact = buildInstallmentGroupImpact(baseline, {
      ...baseline,
      installmentCount: 8,
    });

    expect(impact.hasStructuralImpact).toBe(true);
    expect(impact.countDelta).toBe(2);
    expect(impact.messages).toContain("Serão criadas 2 parcelas no fim da série.");
  });

  it("warns when installment count decreases", () => {
    const impact = buildInstallmentGroupImpact(baseline, {
      ...baseline,
      installmentCount: 5,
    });

    expect(impact.hasStructuralImpact).toBe(true);
    expect(impact.countDelta).toBe(-1);
    expect(impact.messages).toContain(
      "Serão removidas 1 parcela do fim da série (apenas parcelas não liquidadas).",
    );
  });

  it("includes firstDueDate change in messages without forcing structural confirm alone", () => {
    const impact = buildInstallmentGroupImpact(baseline, {
      ...baseline,
      firstDueDate: "2024-09-01",
    });

    expect(impact.firstDueDateChanged).toBe(true);
    expect(impact.hasStructuralImpact).toBe(false);
    expect(impact.messages).toContain(
      "Os vencimentos de todas as parcelas serão recalculados a partir do novo primeiro vencimento.",
    );
  });
});
