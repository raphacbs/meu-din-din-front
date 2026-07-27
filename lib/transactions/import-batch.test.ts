import { describe, expect, it } from "vitest";

import { buildImportBatchItem } from "./import-batch";

describe("buildImportBatchItem", () => {
  const baseRow = {
    description: "Compra teste",
    amount: 100,
    transactionDate: "2024-07-01",
    dueDate: "2024-08-01",
    tags: ["cartao"],
  };

  it("builds avulso payload by default", () => {
    expect(
      buildImportBatchItem({
        ...baseRow,
        tags: baseRow.tags,
        lineMode: "single",
      }),
    ).toEqual({
      ...baseRow,
      type: "DESPESA",
    });
  });

  it("builds installment payload with remaining series", () => {
    expect(
      buildImportBatchItem({
        ...baseRow,
        tags: baseRow.tags,
        lineMode: "installment",
        installmentCurrent: 5,
        installmentTotal: 10,
      }),
    ).toEqual({
      ...baseRow,
      type: "DESPESA",
      installment: {
        installmentCount: 6,
        installmentAmount: 100,
        firstDueDate: "2024-08-01",
        startingInstallmentNumber: 5,
        originalInstallmentCount: 10,
      },
    });
  });

  it("builds recurring payload with monthly defaults", () => {
    expect(
      buildImportBatchItem({
        ...baseRow,
        tags: baseRow.tags,
        lineMode: "recurring",
      }),
    ).toEqual({
      ...baseRow,
      type: "DESPESA",
      recurrence: {
        frequency: "MONTHLY",
        intervalCount: 1,
        nextOccurrenceDate: "2024-08-01",
      },
    });
  });
});
