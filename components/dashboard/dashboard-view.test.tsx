import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardView } from "@/components/dashboard/dashboard-view";
import type { DashboardAnalyticsResponse } from "@/lib/types/api";

vi.mock("@/lib/api/projections", () => ({
  projections: {
    current: vi.fn(),
    recalculate: vi.fn(),
  },
}));

vi.mock("@/lib/api/analytics", () => ({
  analytics: {
    dashboard: vi.fn(),
  },
}));

import { analytics } from "@/lib/api/analytics";
import { projections } from "@/lib/api/projections";

function buildAnalyticsResponse(
  overrides: Partial<DashboardAnalyticsResponse> = {},
): DashboardAnalyticsResponse {
  return {
    year: 2024,
    availableYears: [2024, 2023],
    monthlyTotals: Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      expenseTotal: 100 * (index + 1),
      incomeTotal: 200 * (index + 1),
    })),
    tagRadar: {
      yearTotals: [
        { tag: "Alimentação", amount: 1200 },
        { tag: "Transporte", amount: 800 },
      ],
      monthly: Array.from({ length: 12 }, (_, index) => ({
        month: index + 1,
        tags: [
          { tag: "Alimentação", amount: 100 + index * 10 },
          { tag: "Transporte", amount: 80 + index * 5 },
        ],
      })),
    },
    expensePareto: [
      { tag: "Alimentação", amount: 1200, percent: 60, cumulativePercent: 60 },
      { tag: "Transporte", amount: 800, percent: 40, cumulativePercent: 100 },
    ],
    ...overrides,
  };
}

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
    vi.mocked(analytics.dashboard).mockResolvedValue(buildAnalyticsResponse());
  });

  it("loads projection and analytics independently", async () => {
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
    vi.mocked(analytics.dashboard).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(buildAnalyticsResponse()), 50);
        }),
    );

    renderDashboard();

    expect(document.querySelectorAll(".ant-spin-spinning").length).toBeGreaterThanOrEqual(1);

    await waitFor(() => {
      expect(projections.current).toHaveBeenCalledTimes(1);
      expect(analytics.dashboard).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText("Saldo projetado")).toBeInTheDocument();
      expect(screen.getByText("Despesas e receitas por mês")).toBeInTheDocument();
      expect(screen.getByText("Composição por tags")).toBeInTheDocument();
      expect(screen.getByText("Pareto de despesas por tag")).toBeInTheDocument();
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

  it("keeps analytics visible when projection fails", async () => {
    vi.mocked(projections.current).mockRejectedValue(new Error("Projection failed"));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Projeção indisponível")).toBeInTheDocument();
      expect(screen.getByText("Despesas e receitas por mês")).toBeInTheDocument();
    });
  });

  it("keeps projection visible when analytics fails", async () => {
    vi.mocked(analytics.dashboard).mockRejectedValue(new Error("Analytics failed"));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Saldo projetado")).toBeInTheDocument();
      expect(screen.getByText("Estatísticas indisponíveis")).toBeInTheDocument();
    });
  });

  it("renders year selector and refetches analytics when year changes", async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByTestId("analytics-year-select")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(analytics.dashboard).toHaveBeenCalledWith(2024);
    });

    const selector = screen
      .getByTestId("analytics-year-select")
      .querySelector(".ant-select-selector");

    expect(selector).not.toBeNull();
    fireEvent.mouseDown(selector!);

    const option = await screen.findByTitle("2023");
    fireEvent.click(option);

    await waitFor(() => {
      expect(analytics.dashboard).toHaveBeenCalledWith(2023);
    });
  });

  it("shows analytics empty state when no years are available", async () => {
    vi.mocked(analytics.dashboard).mockResolvedValue(
      buildAnalyticsResponse({
        availableYears: [],
        monthlyTotals: Array.from({ length: 12 }, (_, index) => ({
          month: index + 1,
          expenseTotal: 0,
          incomeTotal: 0,
        })),
        tagRadar: { yearTotals: [], monthly: [] },
        expensePareto: [],
      }),
    );

    renderDashboard();

    await waitFor(() => {
      expect(
        screen.getByText(
          "Não há transações para analisar. Cadastre movimentações para ver os gráficos.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("shows Pareto not applicable state when fewer than two tags exist", async () => {
    vi.mocked(analytics.dashboard).mockResolvedValue(
      buildAnalyticsResponse({
        expensePareto: [{ tag: "Alimentação", amount: 1200, percent: 100, cumulativePercent: 100 }],
      }),
    );

    renderDashboard();

    await waitFor(() => {
      expect(
        screen.getByText(
          "Pareto indisponível: são necessárias pelo menos duas tags com despesas.",
        ),
      ).toBeInTheDocument();
    });
  });
});
