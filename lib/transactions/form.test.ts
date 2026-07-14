import { describe, expect, it } from "vitest";

import {
  buildTransactionPayload,
  defaultTransactionFormState,
  validateTransactionForm,
} from "@/lib/transactions/form";

describe("buildTransactionPayload", () => {
  it("builds a single transaction payload with ISO dates", () => {
    const payload = buildTransactionPayload({
      ...defaultTransactionFormState,
      amountInput: "150,50",
      description: "Mercado",
      transactionDate: "2024-07-01",
      dueDate: "2024-07-05",
      tagsInput: "alimentação, casa",
    });

    expect(payload).toEqual({
      type: "DESPESA",
      amount: 150.5,
      description: "Mercado",
      transactionDate: "2024-07-01",
      dueDate: "2024-07-05",
      tags: ["alimentação", "casa"],
    });
  });

  it("builds installment payloads without recurrence", () => {
    const payload = buildTransactionPayload({
      ...defaultTransactionFormState,
      mode: "installment",
      description: "Notebook",
      transactionDate: "2024-07-01",
      installmentCount: "6",
      installmentAmountInput: "500,00",
      firstDueDate: "2024-08-01",
    });

    expect(payload?.amount).toBe(500);
    expect(payload?.installment).toEqual({
      installmentCount: 6,
      installmentAmount: 500,
      firstDueDate: "2024-08-01",
    });
    expect(payload?.recurrence).toBeUndefined();
  });

  it("builds recurring payloads without installment", () => {
    const payload = buildTransactionPayload({
      ...defaultTransactionFormState,
      mode: "recurring",
      amountInput: "49,90",
      description: "Assinatura",
      transactionDate: "2024-07-01",
      dueDate: "2024-07-10",
      frequency: "MONTHLY",
      intervalCount: "1",
      nextOccurrenceDate: "2024-08-01",
      endDate: "2025-01-01",
    });

    expect(payload?.amount).toBe(49.9);
    expect(payload?.dueDate).toBe("2024-07-10");
    expect(payload?.recurrence).toEqual({
      frequency: "MONTHLY",
      intervalCount: 1,
      nextOccurrenceDate: "2024-08-01",
      endDate: "2025-01-01",
    });
    expect(payload?.installment).toBeUndefined();
  });
});

describe("validateTransactionForm", () => {
  it("requires mode-specific fields", () => {
    expect(validateTransactionForm(defaultTransactionFormState)).toMatchObject({
      description: expect.any(String),
      transactionDate: expect.any(String),
      amountInput: expect.any(String),
    });
  });

  it("requires amount and due date for recurring transactions", () => {
    expect(
      validateTransactionForm({
        ...defaultTransactionFormState,
        mode: "recurring",
        description: "Assinatura",
        transactionDate: "2024-07-01",
        nextOccurrenceDate: "2024-08-01",
      }),
    ).toMatchObject({
      amountInput: expect.any(String),
      dueDate: expect.any(String),
    });
  });
});
