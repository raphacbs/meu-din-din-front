import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "antd";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TransactionFormDrawer } from "@/components/transactions/transaction-form-drawer";
import type { TransactionResponse } from "@/lib/types/api";

const modalConfirmMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/transactions", () => ({
  transactions: {
    create: vi.fn(),
    update: vi.fn(),
    listInstallments: vi.fn(),
    updateInstallments: vi.fn(),
  },
}));

import { transactions } from "@/lib/api/transactions";

const installmentTransaction: TransactionResponse = {
  id: "tx-1",
  type: "DESPESA",
  amount: 500,
  description: "Notebook",
  transactionDate: "2024-08-01",
  dueDate: "2024-08-01",
  status: "A_VENCER",
  tags: ["eletrônicos"],
  group: { id: "group-1", type: "PARCELAMENTO", seriesStatus: "ATIVA" },
  installmentNumber: 1,
  installmentCount: 3,
};

const installments: TransactionResponse[] = [
  installmentTransaction,
  {
    ...installmentTransaction,
    id: "tx-2",
    installmentNumber: 2,
    dueDate: "2024-09-01",
    transactionDate: "2024-09-01",
  },
  {
    ...installmentTransaction,
    id: "tx-3",
    installmentNumber: 3,
    dueDate: "2024-10-01",
    transactionDate: "2024-10-01",
  },
];

function renderDrawer(props: Partial<Parameters<typeof TransactionFormDrawer>[0]> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <App>
        <TransactionFormDrawer
          open
          mode="edit"
          transaction={installmentTransaction}
          onClose={vi.fn()}
          {...props}
        />
      </App>
    </QueryClientProvider>,
  );
}

describe("TransactionFormDrawer installment group", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    modalConfirmMock.mockImplementation((config) => {
      void config.onOk?.();
      return { destroy: vi.fn(), update: vi.fn() };
    });
    vi.spyOn(App, "useApp").mockReturnValue({
      modal: { confirm: modalConfirmMock },
      message: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
        loading: vi.fn(),
        open: vi.fn(),
        destroy: vi.fn(),
      },
    } as ReturnType<typeof App.useApp>);
    vi.mocked(transactions.listInstallments).mockResolvedValue(installments);
    vi.mocked(transactions.updateInstallments).mockResolvedValue(installments);
    vi.mocked(transactions.update).mockResolvedValue(installmentTransaction);
  });

  it("loads installment list when editing a PARCELAMENTO group", async () => {
    renderDrawer();

    expect(await screen.findByText("Editar parcelamento")).toBeInTheDocument();
    expect(transactions.listInstallments).toHaveBeenCalledWith("group-1");
    expect(await screen.findByText(/#1 · 01\/08\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/#2 · 01\/09\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/#3 · 01\/10\/2024/)).toBeInTheDocument();
  });

  it("requires confirmation and PUTs group installments when amount changes", async () => {
    renderDrawer();

    expect(await screen.findByLabelText("Valor da parcela")).toBeInTheDocument();

    const amountInput = screen.getByLabelText("Valor da parcela");
    fireEvent.change(amountInput, { target: { value: "550,00" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => {
      expect(modalConfirmMock).toHaveBeenCalledWith(
        expect.objectContaining({ zIndex: 1100 }),
      );
      expect(transactions.updateInstallments).toHaveBeenCalledWith(
        "group-1",
        expect.objectContaining({
          installmentCount: 3,
          installmentAmount: 550,
          firstDueDate: "2024-08-01",
          description: "Notebook",
        }),
      );
    });

    expect(transactions.update).not.toHaveBeenCalled();
  });

  it("requires confirmation and PUTs group installments when count and amount change", async () => {
    const tenInstallmentTransaction: TransactionResponse = {
      ...installmentTransaction,
      installmentCount: 10,
    };

    vi.mocked(transactions.listInstallments).mockResolvedValue([
      tenInstallmentTransaction,
      ...installments.slice(1),
    ]);

    renderDrawer({ transaction: tenInstallmentTransaction });

    expect(await screen.findByLabelText("Parcelas")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Parcelas"), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText("Valor da parcela"), {
      target: { value: "600,00" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => {
      expect(modalConfirmMock).toHaveBeenCalled();
      expect(transactions.updateInstallments).toHaveBeenCalledWith(
        "group-1",
        expect.objectContaining({
          installmentCount: 5,
          installmentAmount: 600,
        }),
      );
    });
  });

  it("does not send installment on individual update path", async () => {
    const singleTransaction: TransactionResponse = {
      id: "tx-single",
      type: "DESPESA",
      amount: 80,
      description: "Mercado",
      transactionDate: "2024-07-01",
      dueDate: "2024-07-05",
      status: "A_VENCER",
    };

    renderDrawer({
      transaction: singleTransaction,
    });

    expect(await screen.findByText("Editar transação")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => {
      expect(transactions.update).toHaveBeenCalledWith(
        "tx-single",
        expect.objectContaining({
          amount: 80,
          dueDate: "2024-07-05",
          description: "Mercado",
        }),
      );
    });

    const payload = vi.mocked(transactions.update).mock.calls[0]?.[1];
    expect(payload).not.toHaveProperty("installment");
    expect(transactions.updateInstallments).not.toHaveBeenCalled();
    expect(transactions.listInstallments).not.toHaveBeenCalled();
  });
});
