import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const replaceMock = vi.fn();
const searchParamsState = {
  current: new URLSearchParams(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => "/meu-mes",
  useSearchParams: () => searchParamsState.current,
}));

vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal<typeof import("antd")>();

  function MockMonthPicker({
    onChange,
    value,
  }: {
    onChange?: (value: dayjs.Dayjs | null) => void;
    value?: dayjs.Dayjs | null;
  }) {
    return (
      <input
        id="meu-mes-month"
        aria-label="Selecionar mês"
        type="month"
        value={value?.format("YYYY-MM") ?? ""}
        onChange={(event) =>
          onChange?.(event.target.value ? dayjs(`${event.target.value}-01`) : null)
        }
      />
    );
  }

  function MockDatePicker(props: {
    picker?: "time" | "date" | "week" | "month" | "quarter" | "year";
    onChange?: (value: dayjs.Dayjs | null) => void;
    value?: dayjs.Dayjs | null;
  }) {
    if (props.picker === "month") {
      return <MockMonthPicker onChange={props.onChange} value={props.value} />;
    }

    return <actual.DatePicker {...props} />;
  }

  return {
    ...actual,
    DatePicker: Object.assign(MockDatePicker, {
      RangePicker: actual.DatePicker.RangePicker,
    }),
  };
});

import { MeuMesView } from "@/components/transactions/meu-mes-view";
import { currentMonthRange } from "@/lib/period/date-range";
import { usePeriodStore } from "@/lib/stores/period-store";

vi.mock("@/lib/api/transactions", () => ({
  transactions: {
    extract: vi.fn(),
  },
}));

vi.mock("@/lib/api/attachments", () => ({
  attachments: {
    list: vi.fn().mockResolvedValue([]),
  },
}));

import { transactions } from "@/lib/api/transactions";

function renderMeuMesView() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MeuMesView />
    </QueryClientProvider>,
  );
}

describe("MeuMesView", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    searchParamsState.current = new URLSearchParams();
    usePeriodStore.getState().reset();
    vi.mocked(transactions.extract).mockResolvedValue([
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
        transactionDate: "2024-07-05",
        status: "PAGO",
        paymentDate: "2024-07-05",
      },
    ]);
  });

  it("applies current month by default and requests extract", async () => {
    const expected = currentMonthRange();
    renderMeuMesView();

    await waitFor(() => {
      expect(transactions.extract).toHaveBeenCalledWith(expected.from, expected.to);
      expect(replaceMock).toHaveBeenCalledWith(
        `/meu-mes?from=${expected.from}&to=${expected.to}`,
      );
      expect(screen.getAllByText("Mercado").length).toBeGreaterThan(0);
    });
  });

  it("hydrates month from URL and normalizes custom ranges to full month", async () => {
    searchParamsState.current = new URLSearchParams("from=2024-06-10&to=2024-06-20");
    renderMeuMesView();

    await waitFor(() => {
      expect(transactions.extract).toHaveBeenCalledWith("2024-06-01", "2024-06-30");
      expect(replaceMock).toHaveBeenCalledWith("/meu-mes?from=2024-06-01&to=2024-06-30");
    });
  });

  it("applies selected month immediately without Filtrar", async () => {
    renderMeuMesView();

    await waitFor(() => {
      expect(transactions.extract).toHaveBeenCalled();
    });
    vi.mocked(transactions.extract).mockClear();
    replaceMock.mockClear();

    fireEvent.change(screen.getByLabelText("Selecionar mês"), {
      target: { value: "2024-07" },
    });

    await waitFor(() => {
      expect(transactions.extract).toHaveBeenCalledWith("2024-07-01", "2024-07-31");
      expect(replaceMock).toHaveBeenCalledWith("/meu-mes?from=2024-07-01&to=2024-07-31");
    });
  });

  it("does not expose custom period controls", async () => {
    renderMeuMesView();

    await waitFor(() => {
      expect(transactions.extract).toHaveBeenCalled();
    });

    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Filtrar" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("De")).not.toBeInTheDocument();
  });

  it("shows dual hero and pending/settled sections", async () => {
    renderMeuMesView();

    await waitFor(() => {
      expect(screen.getByText("Previsto")).toBeInTheDocument();
      expect(screen.getByText("Realizado")).toBeInTheDocument();
      expect(screen.getByText("Pendentes")).toBeInTheDocument();
      expect(screen.getByText("Liquidados")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Quitar" })).toBeInTheDocument();
    });
  });

  it("shows API errors for extract requests", async () => {
    vi.mocked(transactions.extract).mockRejectedValue(new Error("Extract failed"));

    renderMeuMesView();

    await waitFor(() => {
      expect(screen.getByText("Não foi possível carregar Meu mês.")).toBeInTheDocument();
    });
  });
});
