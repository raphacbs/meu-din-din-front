import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "antd";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal<typeof import("antd")>();

  function MockDatePicker(props: {
    "aria-label"?: string;
    value?: dayjs.Dayjs | null;
    onChange?: (value: dayjs.Dayjs | null) => void;
    disabled?: boolean;
    style?: React.CSSProperties;
  }) {
    return (
      <input
        type="date"
        aria-label={props["aria-label"]}
        disabled={props.disabled}
        value={props.value ? props.value.format("YYYY-MM-DD") : ""}
        onChange={(event) =>
          props.onChange?.(event.target.value ? dayjs(event.target.value) : null)
        }
      />
    );
  }

  return {
    ...actual,
    DatePicker: Object.assign(MockDatePicker, {
      RangePicker: actual.DatePicker.RangePicker,
    }),
  };
});

vi.mock("@/lib/api/transactions-import", () => ({
  transactionsImport: {
    parseInvoice: vi.fn(),
    createBatch: vi.fn(),
  },
}));

vi.mock("@/lib/api/transactions", () => ({
  transactions: {
    list: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/components/ui/tag-select", () => ({
  TagSelect: ({
    value = [],
    onChange,
    "aria-label": ariaLabel,
  }: {
    value?: string[];
    onChange?: (value: string[]) => void;
    "aria-label"?: string;
  }) => (
    <input
      aria-label={ariaLabel ?? "TagSelect"}
      value={value.join(",")}
      onChange={(event) =>
        onChange?.(
          event.target.value
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        )
      }
    />
  ),
}));

import { InvoiceImportDrawer } from "@/components/transactions/invoice-import-drawer";
import { transactionsImport } from "@/lib/api/transactions-import";
import type { InvoiceParseResponse } from "@/lib/types/api";

const parseResponse: InvoiceParseResponse = {
  dueDate: "2024-08-10",
  items: [
    {
      sourceIndex: 0,
      description: "Mercado Central",
      amount: 120.5,
      transactionDate: "2024-07-15",
      dueDate: "2024-08-10",
      type: "DESPESA",
      entryKind: "DEBIT",
      tags: ["mercado"],
    },
    {
      sourceIndex: 1,
      description: "Farmacia Popular",
      amount: 45.9,
      transactionDate: "2024-07-18",
      dueDate: "2024-08-10",
      type: "DESPESA",
      entryKind: "DEBIT",
      tags: [],
    },
    {
      sourceIndex: 2,
      description: "PAGAMENTO ON LINE",
      amount: 200,
      transactionDate: "2024-07-20",
      dueDate: "2024-08-10",
      type: "DESPESA",
      entryKind: "CREDIT",
      tags: [],
    },
  ],
};

const installmentParseResponse: InvoiceParseResponse = {
  dueDate: "2024-08-10",
  items: [
    {
      sourceIndex: 0,
      description: "LOJA XYZ (Parcela 05 de 10)",
      amount: 100,
      transactionDate: "2024-07-15",
      dueDate: "2024-08-10",
      type: "DESPESA",
      entryKind: "DEBIT",
      tags: [],
    },
  ],
};

function renderDrawer(onImported = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <App>
        <InvoiceImportDrawer open onClose={vi.fn()} onImported={onImported} />
      </App>
    </QueryClientProvider>,
  );
}

function uploadPdf(name = "fatura.pdf") {
  const input = document.body.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement;
  const file = new File(["%PDF-1.4"], name, { type: "application/pdf" });
  fireEvent.change(input, { target: { files: [file] } });
  return file;
}

async function reachConfigStep() {
  uploadPdf();
  await waitFor(() => {
    expect(screen.getByText("fatura.pdf")).toBeInTheDocument();
  });
  fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
  await waitFor(() => {
    expect(screen.getByText("Selecionar e configurar")).toBeInTheDocument();
  });
}

async function reachReviewAndSave() {
  await reachConfigStep();
  fireEvent.click(screen.getByRole("button", { name: /Revisar/ }));
  await waitFor(() => {
    expect(screen.getByText("Revisar antes de salvar")).toBeInTheDocument();
  });
  fireEvent.click(screen.getByRole("button", { name: "Criar no Meu mês" }));
}

describe("InvoiceImportDrawer", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(transactionsImport.parseInvoice).mockResolvedValue(parseResponse);
    vi.mocked(transactionsImport.createBatch).mockResolvedValue({
      created: [],
      failures: [],
    });
  });

  it("blocks parse and warns when no file is selected", async () => {
    renderDrawer();

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    await waitFor(() => {
      expect(
        screen.getByText("Selecione o arquivo PDF da fatura."),
      ).toBeInTheDocument();
    });
    expect(transactionsImport.parseInvoice).not.toHaveBeenCalled();
  });

  it("parses the invoice and moves to the config step", async () => {
    renderDrawer();

    await reachConfigStep();

    expect(transactionsImport.parseInvoice).toHaveBeenCalledWith(
      expect.objectContaining({ bank: "INTER" }),
    );
    expect(screen.getByDisplayValue("Mercado Central")).toBeInTheDocument();
    expect(screen.getByDisplayValue("PAGAMENTO ON LINE")).toBeInTheDocument();
  });

  it("selects DEBIT rows by default and keeps CREDIT rows unselected", async () => {
    renderDrawer();

    await reachReviewAndSave();

    await waitFor(() => {
      expect(transactionsImport.createBatch).toHaveBeenCalledTimes(1);
    });

    const items = vi.mocked(transactionsImport.createBatch).mock.calls[0][0];
    expect(items).toHaveLength(2);
    expect(items.map((item) => item.description)).toEqual([
      "Mercado Central",
      "Farmacia Popular",
    ]);
    expect(items.every((item) => item.type === "DESPESA")).toBe(true);
  });

  it("applies a reference due date to the target rows before saving", async () => {
    renderDrawer();

    await reachConfigStep();

    const refDueDate = screen.getByLabelText("Vencimento de referência");
    fireEvent.change(refDueDate, { target: { value: "2024-09-05" } });
    fireEvent.click(screen.getByRole("button", { name: "Aplicar vencimento" }));

    fireEvent.click(screen.getByRole("button", { name: /Revisar/ }));
    await waitFor(() => {
      expect(screen.getByText("Revisar antes de salvar")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar no Meu mês" }));

    await waitFor(() => {
      expect(transactionsImport.createBatch).toHaveBeenCalledTimes(1);
    });

    const items = vi.mocked(transactionsImport.createBatch).mock.calls[0][0];
    expect(items.every((item) => item.dueDate === "2024-09-05")).toBe(true);
  });

  it("applies reference tags to selected rows", async () => {
    renderDrawer();

    await reachConfigStep();

    const refTags = screen.getAllByLabelText("TagSelect")[0];
    fireEvent.change(refTags, { target: { value: "cartao, viagem" } });
    fireEvent.click(screen.getByRole("button", { name: "Aplicar tags" }));

    fireEvent.click(screen.getByRole("button", { name: /Revisar/ }));
    await waitFor(() => {
      expect(screen.getByText("Revisar antes de salvar")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar no Meu mês" }));

    await waitFor(() => {
      expect(transactionsImport.createBatch).toHaveBeenCalledTimes(1);
    });

    const items = vi.mocked(transactionsImport.createBatch).mock.calls[0][0];
    expect(items.every((item) => item.tags?.join(",") === "cartao,viagem")).toBe(
      true,
    );
  });

  it("sends installment payload when parcela is detected", async () => {
    vi.mocked(transactionsImport.parseInvoice).mockResolvedValue(
      installmentParseResponse,
    );
    renderDrawer();

    await reachReviewAndSave();

    await waitFor(() => {
      expect(transactionsImport.createBatch).toHaveBeenCalledTimes(1);
    });

    const items = vi.mocked(transactionsImport.createBatch).mock.calls[0][0];
    expect(items[0].installment).toEqual({
      installmentCount: 6,
      installmentAmount: 100,
      firstDueDate: "2024-08-10",
      startingInstallmentNumber: 5,
      originalInstallmentCount: 10,
    });
  });

  it("blocks review when no row is selected", async () => {
    renderDrawer();

    await reachConfigStep();

    const table = document.body.querySelector(".ant-table") as HTMLElement;
    const headerCheckbox = within(table).getAllByRole("checkbox")[0];
    fireEvent.click(headerCheckbox);
    fireEvent.click(headerCheckbox);

    const reviewButton = screen.getByRole("button", { name: /Revisar/ });
    await waitFor(() => {
      expect(reviewButton).toBeDisabled();
    });
    expect(transactionsImport.createBatch).not.toHaveBeenCalled();
  });

  it("reports success and returns to Meu mês after a full batch create", async () => {
    vi.mocked(transactionsImport.createBatch).mockResolvedValue({
      created: [
        {
          id: "t1",
          type: "DESPESA",
          amount: 120.5,
          description: "Mercado Central",
          transactionDate: "2024-07-15",
          status: "A_VENCER",
        },
        {
          id: "t2",
          type: "DESPESA",
          amount: 45.9,
          description: "Farmacia Popular",
          transactionDate: "2024-07-18",
          status: "A_VENCER",
        },
      ],
      failures: [],
    });
    const onImported = vi.fn();
    renderDrawer(onImported);

    await reachReviewAndSave();

    await waitFor(() => {
      expect(onImported).toHaveBeenCalledTimes(1);
    });
  });

  it("keeps failed rows for retry after partial batch failure", async () => {
    vi.mocked(transactionsImport.createBatch).mockResolvedValue({
      created: [
        {
          id: "t1",
          type: "DESPESA",
          amount: 120.5,
          description: "Mercado Central",
          transactionDate: "2024-07-15",
          status: "A_VENCER",
        },
      ],
      failures: [{ index: 1, message: "Erro simulado" }],
    });

    renderDrawer();

    await reachReviewAndSave();

    await waitFor(() => {
      expect(screen.getByText("Algumas linhas falharam")).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue("Farmacia Popular")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Mercado Central")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Revisar (1)" })).toBeInTheDocument();
  });
});
