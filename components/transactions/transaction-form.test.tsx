import type { ComponentProps } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import dayjs from "dayjs";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TransactionForm } from "@/components/transactions/transaction-form";

function renderTransactionForm(
  props: Partial<ComponentProps<typeof TransactionForm>> = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TransactionForm
        submitLabel="Criar transação"
        submittingLabel="Salvando..."
        onSubmit={props.onSubmit ?? vi.fn().mockResolvedValue(undefined)}
        {...props}
      />
    </QueryClientProvider>,
  );
}

describe("TransactionForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("submits a valid single transaction", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    renderTransactionForm({
      onSubmit,
      initialValues: {
        mode: "single",
        type: "DESPESA",
        description: "Mercado",
        amount: 80,
        transactionDate: dayjs("2024-07-01"),
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Criar transação" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Mercado",
          amount: 80,
          transactionDate: "2024-07-01",
        }),
      );
    });

    const payload = onSubmit.mock.calls[0]?.[0];
    expect(payload).not.toHaveProperty("installment");
    expect(payload).not.toHaveProperty("recurrence");
  });

  it("submits a valid installment transaction", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    renderTransactionForm({
      onSubmit,
      initialValues: {
        mode: "installment",
        type: "DESPESA",
        description: "Notebook",
        transactionDate: dayjs("2024-07-01"),
        installmentCount: 6,
        installmentAmount: 500,
        firstDueDate: dayjs("2024-08-01"),
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Criar transação" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 500,
          installment: {
            installmentCount: 6,
            installmentAmount: 500,
            firstDueDate: "2024-08-01",
          },
        }),
      );
    });

    expect(onSubmit.mock.calls[0]?.[0]).not.toHaveProperty("recurrence");
  });

  it("submits a valid recurring transaction", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    renderTransactionForm({
      onSubmit,
      initialValues: {
        mode: "recurring",
        type: "DESPESA",
        description: "Assinatura",
        amount: 49.9,
        transactionDate: dayjs("2024-07-01"),
        dueDate: dayjs("2024-07-10"),
        nextOccurrenceDate: dayjs("2024-08-01"),
        frequency: "MONTHLY",
        intervalCount: 1,
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Criar transação" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 49.9,
          dueDate: "2024-07-10",
          recurrence: {
            frequency: "MONTHLY",
            intervalCount: 1,
            nextOccurrenceDate: "2024-08-01",
          },
        }),
      );
    });

    expect(onSubmit.mock.calls[0]?.[0]).not.toHaveProperty("installment");
  });

  it("shows validation errors for recurring transactions without amount or due date", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    renderTransactionForm({
      onSubmit,
      initialValues: {
        mode: "recurring",
        type: "DESPESA",
        description: "Assinatura",
        transactionDate: dayjs("2024-07-01"),
        nextOccurrenceDate: dayjs("2024-08-01"),
        frequency: "MONTHLY",
        intervalCount: 1,
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Criar transação" }));

    expect(await screen.findByText("Informe o valor da transação.")).toBeInTheDocument();
    expect(screen.getByText("Informe o vencimento da recorrência.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows installment fields when parcelada mode is selected", () => {
    renderTransactionForm({
      initialValues: {
        mode: "installment",
        type: "DESPESA",
        transactionDate: dayjs("2024-07-01"),
      },
    });

    expect(screen.getByLabelText("Parcelas")).toBeInTheDocument();
    expect(screen.getByLabelText("Valor da parcela")).toBeInTheDocument();
  });

  it("preserves user input when backend validation fails", async () => {
    renderTransactionForm({
      formError: "Valor inválido para parcelamento.",
      initialValues: {
        mode: "single",
        type: "DESPESA",
        description: "Notebook",
        transactionDate: dayjs("2024-07-01"),
      },
    });

    expect(screen.getByLabelText("Descrição")).toHaveValue("Notebook");
    expect(screen.getByRole("alert")).toHaveTextContent("Valor inválido para parcelamento.");
  });
});
