import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { message } from "antd";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TransactionList } from "@/components/transactions/transaction-list";
import {
  buildPayPayload,
  canPayTransaction,
} from "@/components/transactions/transaction-row-actions";
import type { TransactionResponse } from "@/lib/types/api";

vi.mock("@/lib/api/transactions", () => ({
  transactions: {
    update: vi.fn(),
  },
}));

vi.mock("@/lib/api/attachments", () => ({
  attachments: {
    add: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/components/transactions/tag-share-pie-chart", () => ({
  TagSharePieChart: () => (
    <div>
      <div>Distribuição por tags</div>
      <div role="group" aria-label="Dimensão do gráfico">
        Tags Status Tipo
      </div>
    </div>
  ),
}));

import { attachments } from "@/lib/api/attachments";
import { transactions } from "@/lib/api/transactions";

const unpaid: TransactionResponse = {
  id: "tx-unpaid",
  type: "DESPESA",
  amount: 80,
  description: "Mercado",
  transactionDate: "2024-07-01",
  dueDate: "2024-07-10",
  status: "A_VENCER",
  tags: ["casa"],
};

const paid: TransactionResponse = {
  id: "tx-paid",
  type: "RECEITA",
  amount: 500,
  description: "Salário",
  transactionDate: "2024-07-05",
  status: "PAGO",
  tags: ["trabalho"],
};

const canceled: TransactionResponse = {
  id: "tx-canceled",
  type: "DESPESA",
  amount: 30,
  description: "Assinatura",
  transactionDate: "2024-07-02",
  status: "CANCELADA",
};

function renderList(transactionsData: TransactionResponse[]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TransactionList transactions={transactionsData} />
    </QueryClientProvider>,
  );
}

describe("canPayTransaction / buildPayPayload", () => {
  it("hides pay for paid and canceled statuses", () => {
    expect(canPayTransaction("A_VENCER")).toBe(true);
    expect(canPayTransaction("VENCE_HOJE")).toBe(true);
    expect(canPayTransaction("ATRASADA")).toBe(true);
    expect(canPayTransaction("PAGO")).toBe(false);
    expect(canPayTransaction("PAGO_COM_ATRASO")).toBe(false);
    expect(canPayTransaction("CANCELADA")).toBe(false);
  });

  it("builds update payload with paymentDate and current fields", () => {
    expect(buildPayPayload(unpaid, "2024-07-12")).toEqual({
      type: "DESPESA",
      amount: 80,
      description: "Mercado",
      transactionDate: "2024-07-01",
      dueDate: "2024-07-10",
      paymentDate: "2024-07-12",
      tags: ["casa"],
    });
  });
});

describe("TransactionList", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(message, "success").mockImplementation(() => undefined as never);
    vi.spyOn(message, "error").mockImplementation(() => undefined as never);
    vi.mocked(transactions.update).mockResolvedValue({
      ...unpaid,
      status: "PAGO",
      paymentDate: "2024-07-12",
    });
    vi.mocked(attachments.add).mockResolvedValue({
      id: "att-1",
      fileName: "recibo.png",
      fileUrl: "https://example.com/recibo.png",
      mimeType: "image/png",
      fileSize: 1024,
    });
    vi.mocked(attachments.list).mockImplementation(async (transactionId: string) => {
      if (transactionId === "tx-paid") {
        return [
          {
            id: "att-1",
            fileName: "recibo.png",
            fileUrl: "https://example.com/recibo.png",
            mimeType: "image/png",
            fileSize: 1024,
          },
        ];
      }
      return [];
    });
    vi.mocked(attachments.update).mockResolvedValue({
      id: "att-1",
      fileName: "recibo.png",
      fileUrl: "https://example.com/recibo.png",
      mimeType: "image/png",
      fileSize: 1024,
    });
    vi.mocked(attachments.delete).mockResolvedValue(undefined);
  });

  it("shows pay action only for unpaid transactions and always shows attach", () => {
    renderList([unpaid, paid, canceled]);

    const payButtons = screen.getAllByRole("button", { name: "Pagar" });
    expect(payButtons).toHaveLength(1);

    expect(screen.getAllByRole("button", { name: "Anexar comprovante" })).toHaveLength(3);
  });

  it("opens payment confirmation and does not call update when canceled", async () => {
    renderList([unpaid]);

    fireEvent.click(screen.getByRole("button", { name: "Pagar" }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Confirmar pagamento?")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancelar" }));

    expect(transactions.update).not.toHaveBeenCalled();
  });

  it("pays after confirmation with paymentDate = today", async () => {
    const today = new Date();
    const expectedPaymentDate = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    renderList([unpaid]);

    fireEvent.click(screen.getByRole("button", { name: "Pagar" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Confirmar pagamento" }));

    await waitFor(() => {
      expect(transactions.update).toHaveBeenCalledWith("tx-unpaid", {
        type: "DESPESA",
        amount: 80,
        description: "Mercado",
        transactionDate: "2024-07-01",
        dueDate: "2024-07-10",
        paymentDate: expectedPaymentDate,
        tags: ["casa"],
      });
    });
  });

  it("opens attach modal with upload button and saves metadata", async () => {
    renderList([paid]);

    fireEvent.click(screen.getByRole("button", { name: /Anexar comprovante/i }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("button", { name: /Selecionar arquivo/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(within(dialog).getByDisplayValue("recibo.png")).toBeInTheDocument();
    });

    const file = new File(["recibo"], "novo.png", { type: "image/png" });
    const input = dialog.querySelector('input[type="file"]');
    expect(input).toBeTruthy();
    fireEvent.change(input as HTMLInputElement, { target: { files: [file] } });

    await waitFor(() => {
      expect(within(dialog).getByLabelText("Nome do arquivo")).toHaveValue("novo.png");
    });

    fireEvent.click(within(dialog).getByRole("button", { name: "Salvar comprovante" }));

    await waitFor(() => {
      expect(attachments.add).toHaveBeenCalledWith(
        "tx-paid",
        expect.objectContaining({
          fileName: "novo.png",
          mimeType: "image/png",
          fileSize: file.size,
          fileUrl: expect.stringMatching(/^data:image\/png;base64,/),
        }),
      );
    });
  });

  it("shows attachment count badge on attach action", async () => {
    renderList([paid, unpaid]);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Anexar comprovante (1)" })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Anexar comprovante" })).toBeInTheDocument();
  });

  it("shows period totals excluding canceled transactions", () => {
    renderList([unpaid, paid, canceled]);

    expect(screen.getByText("DESPESAS")).toBeInTheDocument();
    expect(screen.getByText("RECEITAS")).toBeInTheDocument();
    expect(screen.getByText("SALDO")).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes("420,00"))).toBeInTheDocument();
  });

  it("shows tag distribution chart section", () => {
    renderList([unpaid, paid]);
    expect(screen.getByText("Distribuição por tags")).toBeInTheDocument();
  });
});
