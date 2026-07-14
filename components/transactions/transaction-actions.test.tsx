import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Modal } from "antd";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TransactionActions } from "@/components/transactions/transaction-actions";
import type { TransactionResponse } from "@/lib/types/api";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/lib/api/transactions", () => ({
  transactions: {
    cancel: vi.fn(),
    delete: vi.fn(),
    deleteInstallments: vi.fn(),
    deactivateRecurrence: vi.fn(),
  },
}));

import { transactions } from "@/lib/api/transactions";

const baseTransaction: TransactionResponse = {
  id: "tx-1",
  type: "DESPESA",
  amount: 80,
  description: "Mercado",
  transactionDate: "2024-07-01",
  status: "A_VENCER",
};

function renderActions(transaction: TransactionResponse) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TransactionActions transaction={transaction} />
    </QueryClientProvider>,
  );
}

describe("TransactionActions", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Modal, "confirm").mockImplementation((config) => {
      void config.onOk?.();
      return { destroy: vi.fn(), update: vi.fn() };
    });
    vi.mocked(transactions.cancel).mockResolvedValue({
      ...baseTransaction,
      status: "CANCELADA",
    });
    vi.mocked(transactions.delete).mockResolvedValue(undefined);
    vi.mocked(transactions.deleteInstallments).mockResolvedValue(undefined);
    vi.mocked(transactions.deactivateRecurrence).mockResolvedValue({
      id: "group-1",
      type: "RECORRENCIA",
      seriesStatus: "INATIVA",
    });
  });

  it("requires confirmation before canceling", async () => {
    renderActions(baseTransaction);

    fireEvent.click(screen.getByRole("button", { name: "Cancelar transação" }));

    await waitFor(() => {
      expect(Modal.confirm).toHaveBeenCalled();
      expect(transactions.cancel).toHaveBeenCalledWith("tx-1");
    });
  });

  it("deletes installment groups after confirmation", async () => {
    renderActions({
      ...baseTransaction,
      group: { id: "group-1", type: "PARCELAMENTO", seriesStatus: "ATIVA" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Excluir parcelamento" }));

    await waitFor(() => {
      expect(transactions.deleteInstallments).toHaveBeenCalledWith("group-1");
      expect(pushMock).toHaveBeenCalledWith("/transactions");
    });
  });

  it("deactivates recurrence series after confirmation", async () => {
    renderActions({
      ...baseTransaction,
      group: { id: "group-2", type: "RECORRENCIA", seriesStatus: "ATIVA" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Desativar recorrência" }));

    await waitFor(() => {
      expect(transactions.deactivateRecurrence).toHaveBeenCalledWith("group-2");
    });
  });
});
