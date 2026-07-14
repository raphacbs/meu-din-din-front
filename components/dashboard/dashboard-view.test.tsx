import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardView } from "@/components/dashboard/dashboard-view";

vi.mock("@/lib/api/projections", () => ({
  projections: {
    current: vi.fn(),
    recalculate: vi.fn(),
  },
}));

vi.mock("@/lib/api/transactions", () => ({
  transactions: {
    list: vi.fn(),
  },
}));

import { projections } from "@/lib/api/projections";
import { transactions } from "@/lib/api/transactions";

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <DashboardView />
    </QueryClientProvider>,
  );
}

describe("DashboardView", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(projections.current).mockResolvedValue({
      projectedBalance: 1200.5,
      generatedAt: "2024-07-05T12:00:00.000Z",
    });
    vi.mocked(transactions.list).mockResolvedValue([
      {
        id: "tx-1",
        type: "DESPESA",
        amount: 80,
        description: "Mercado",
        transactionDate: "2024-07-01",
        dueDate: "2024-07-10",
        status: "A_VENCER",
      },
      {
        id: "tx-2",
        type: "RECEITA",
        amount: 500,
        description: "Salário",
        transactionDate: "2024-07-01",
        status: "PAGO",
      },
    ]);
  });

  it("loads projection and transaction summaries independently", async () => {
    vi.mocked(projections.current).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                projectedBalance: 1200.5,
                generatedAt: "2024-07-05T12:00:00.000Z",
              }),
            50,
          );
        }),
    );
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
                  dueDate: "2024-07-10",
                  status: "A_VENCER",
                },
                {
                  id: "tx-2",
                  type: "RECEITA",
                  amount: 500,
                  description: "Salário",
                  transactionDate: "2024-07-01",
                  status: "PAGO",
                },
              ]),
            50,
          );
        }),
    );

    renderDashboard();

    expect(document.querySelectorAll(".ant-spin-spinning").length).toBeGreaterThanOrEqual(1);

    await waitFor(() => {
      expect(projections.current).toHaveBeenCalledTimes(1);
      expect(transactions.list).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText("Saldo projetado")).toBeInTheDocument();
      expect(screen.getByText("Receitas")).toBeInTheDocument();
      expect(screen.getAllByText("Vence hoje").length).toBeGreaterThan(0);
    });
  });

  it("recalculates projection and disables the action while pending", async () => {
    let resolveRecalculate: (value: { projectedBalance: number; generatedAt: string }) => void;
    const recalculatePromise = new Promise<{ projectedBalance: number; generatedAt: string }>(
      (resolve) => {
        resolveRecalculate = resolve;
      },
    );

    vi.mocked(projections.recalculate).mockReturnValue(recalculatePromise);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Saldo projetado")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Recalcular projeção" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Recalcular projeção/i }),
      ).toHaveClass("ant-btn-loading");
    });

    resolveRecalculate!({
      projectedBalance: 1500,
      generatedAt: "2024-07-05T12:05:00.000Z",
    });

    await waitFor(() => {
      expect(projections.recalculate).toHaveBeenCalledTimes(1);
      expect(screen.getByText("R$ 1.500,00")).toBeInTheDocument();
    });
  });

  it("keeps the dashboard usable when projection fails", async () => {
    vi.mocked(projections.current).mockRejectedValue(new Error("Projection failed"));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Projeção indisponível")).toBeInTheDocument();
      expect(screen.getByText("Receitas")).toBeInTheDocument();
    });
  });

  it("links dashboard summaries to transaction detail routes", async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /Salário/i })).toHaveAttribute(
        "href",
        "/transactions/tx-2",
      );
    });
  });
});
