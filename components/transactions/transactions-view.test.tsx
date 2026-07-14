import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TransactionsView } from "@/components/transactions/transactions-view";

vi.mock("@/lib/api/transactions", () => ({
  transactions: {
    list: vi.fn(),
  },
}));

import { transactions } from "@/lib/api/transactions";

function renderTransactionsView() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TransactionsView />
    </QueryClientProvider>,
  );
}

describe("TransactionsView", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading and then renders the transaction list", async () => {
    vi.mocked(transactions.list).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve([
                {
                  id: "tx-1",
                  type: "DESPESA",
                  amount: 80,
                  description: "Mercado",
                  transactionDate: "2024-07-01",
                  dueDate: "2024-07-05",
                  status: "A_VENCER",
                  tags: ["alimentação"],
                },
              ]),
            50,
          );
        }),
    );

    renderTransactionsView();

    expect(document.querySelector(".ant-spin-spinning")).toBeInTheDocument();

    await waitFor(() => {
      expect(transactions.list).toHaveBeenCalledTimes(1);
      expect(screen.getAllByText("Mercado").length).toBeGreaterThan(0);
      expect(screen.getAllByText("alimentação").length).toBeGreaterThan(0);
    });
  });

  it("shows empty state with create action", async () => {
    vi.mocked(transactions.list).mockResolvedValue([]);

    renderTransactionsView();

    await waitFor(() => {
      expect(screen.getByText("Nenhuma transação ainda")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Criar transação" })).toHaveAttribute(
        "href",
        "/transactions/new",
      );
    });
  });

  it("shows API errors with retry", async () => {
    vi.mocked(transactions.list).mockRejectedValue(new Error("API down"));

    renderTransactionsView();

    await waitFor(() => {
      expect(screen.getByText("Não foi possível carregar as transações.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
    });
  });
});
