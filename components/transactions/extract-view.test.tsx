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
  usePathname: () => "/extract",
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
        id="extract-month"
        aria-label="Selecionar mês"
        type="month"
        value={value?.format("YYYY-MM") ?? ""}
        onChange={(event) =>
          onChange?.(event.target.value ? dayjs(`${event.target.value}-01`) : null)
        }
      />
    );
  }

  function MockRangePicker({
    onChange,
    value,
  }: {
    onChange?: (values: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => void;
    value?: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
  }) {
    return (
      <div>
        <label htmlFor="extract-from">De</label>
        <input
          id="extract-from"
          aria-label="De"
          type="date"
          value={value?.[0]?.format("YYYY-MM-DD") ?? ""}
          onChange={(event) =>
            onChange?.([
              event.target.value ? dayjs(event.target.value) : null,
              value?.[1] ?? null,
            ])
          }
        />
        <label htmlFor="extract-to">Até</label>
        <input
          id="extract-to"
          aria-label="Até"
          type="date"
          value={value?.[1]?.format("YYYY-MM-DD") ?? ""}
          onChange={(event) =>
            onChange?.([
              value?.[0] ?? null,
              event.target.value ? dayjs(event.target.value) : null,
            ])
          }
        />
      </div>
    );
  }

  function MockDatePicker(props: {
    picker?: string;
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
    DatePicker: Object.assign(MockDatePicker, { RangePicker: MockRangePicker }),
  };
});

import { ExtractView } from "@/components/transactions/extract-view";
import { currentMonthRange } from "@/lib/period/date-range";
import { usePeriodStore } from "@/lib/stores/period-store";

vi.mock("@/lib/api/transactions", () => ({
  transactions: {
    extract: vi.fn(),
  },
}));

import { transactions } from "@/lib/api/transactions";

function renderExtractView() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ExtractView />
    </QueryClientProvider>,
  );
}

describe("ExtractView", () => {
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
        status: "PAGO",
      },
    ]);
  });

  it("applies current month by default and requests extract", async () => {
    const expected = currentMonthRange();
    renderExtractView();

    await waitFor(() => {
      expect(transactions.extract).toHaveBeenCalledWith(expected.from, expected.to);
      expect(replaceMock).toHaveBeenCalledWith(
        `/extract?from=${expected.from}&to=${expected.to}`,
      );
      expect(screen.getAllByText("Mercado").length).toBeGreaterThan(0);
    });
  });

  it("hydrates from URL query params in custom mode with dates filled", async () => {
    searchParamsState.current = new URLSearchParams("from=2024-06-01&to=2024-06-30");
    renderExtractView();

    await waitFor(() => {
      expect(transactions.extract).toHaveBeenCalledWith("2024-06-01", "2024-06-30");
    });
    expect(replaceMock).not.toHaveBeenCalled();
    expect(screen.getByRole("switch")).not.toBeChecked();
    expect(screen.getByLabelText("De")).toHaveValue("2024-06-01");
    expect(screen.getByLabelText("Até")).toHaveValue("2024-06-30");
  });

  it("filters by selected month when clicking Filtrar", async () => {
    renderExtractView();

    await waitFor(() => {
      expect(transactions.extract).toHaveBeenCalled();
    });
    vi.mocked(transactions.extract).mockClear();
    replaceMock.mockClear();

    fireEvent.change(screen.getByLabelText("Selecionar mês"), {
      target: { value: "2024-07" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Filtrar" }));

    await waitFor(() => {
      expect(transactions.extract).toHaveBeenCalledWith("2024-07-01", "2024-07-31");
      expect(replaceMock).toHaveBeenCalledWith("/extract?from=2024-07-01&to=2024-07-31");
      expect(screen.getAllByText("Mercado").length).toBeGreaterThan(0);
    });
  });

  it("filters by custom range when clicking Filtrar", async () => {
    renderExtractView();

    await waitFor(() => {
      expect(transactions.extract).toHaveBeenCalled();
    });
    vi.mocked(transactions.extract).mockClear();
    replaceMock.mockClear();

    fireEvent.click(screen.getByRole("switch"));
    fireEvent.change(screen.getByLabelText("De"), {
      target: { value: "2024-07-01" },
    });
    fireEvent.change(screen.getByLabelText("Até"), {
      target: { value: "2024-07-15" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Filtrar" }));

    await waitFor(() => {
      expect(transactions.extract).toHaveBeenCalledWith("2024-07-01", "2024-07-15");
      expect(replaceMock).toHaveBeenCalledWith("/extract?from=2024-07-01&to=2024-07-15");
    });
  });

  it("shows validation feedback when custom dates are missing", async () => {
    renderExtractView();

    await waitFor(() => {
      expect(transactions.extract).toHaveBeenCalled();
    });
    const callsBefore = vi.mocked(transactions.extract).mock.calls.length;
    replaceMock.mockClear();

    fireEvent.click(screen.getByRole("switch"));
    fireEvent.change(screen.getByLabelText("De"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("Até"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Filtrar" }));

    expect(
      await screen.findByText("Selecione a data início e a data fim para filtrar o extrato."),
    ).toBeInTheDocument();
    expect(vi.mocked(transactions.extract).mock.calls.length).toBe(callsBefore);
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("shows API errors for extract requests", async () => {
    vi.mocked(transactions.extract).mockRejectedValue(new Error("Extract failed"));

    renderExtractView();

    await waitFor(() => {
      expect(screen.getByText("Não foi possível carregar o extrato.")).toBeInTheDocument();
    });
  });

  it("does not mention technical API headers in the copy", async () => {
    renderExtractView();

    expect(
      screen.getByText("Filtre movimentações por mês ou por um período personalizado."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/headers/i)).not.toBeInTheDocument();
  });
});
