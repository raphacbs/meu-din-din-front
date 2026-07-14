import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Modal, message } from "antd";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TransactionAttachments } from "@/components/transactions/transaction-attachments";

vi.mock("@/lib/api/attachments", () => ({
  attachments: {
    list: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { attachments } from "@/lib/api/attachments";

function renderAttachments() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TransactionAttachments transactionId="tx-1" />
    </QueryClientProvider>,
  );
}

describe("TransactionAttachments", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(message, "success").mockImplementation(() => undefined as never);
    vi.spyOn(message, "error").mockImplementation(() => undefined as never);
    vi.spyOn(Modal, "confirm").mockImplementation((config) => {
      void config.onOk?.();
      return { destroy: vi.fn(), update: vi.fn() };
    });
    vi.mocked(attachments.list).mockResolvedValue([
      {
        id: "att-1",
        fileName: "nota.pdf",
        fileUrl: "https://example.com/nota.pdf",
        mimeType: "application/pdf",
        fileSize: 2048,
      },
    ]);
    vi.mocked(attachments.add).mockResolvedValue({
      id: "att-2",
      fileName: "recibo.png",
      fileUrl: "https://example.com/recibo.png",
      mimeType: "image/png",
      fileSize: 1024,
    });
    vi.mocked(attachments.update).mockResolvedValue({
      id: "att-1",
      fileName: "nota-atualizada.pdf",
      fileUrl: "https://example.com/nota.pdf",
      mimeType: "application/pdf",
      fileSize: 2048,
    });
    vi.mocked(attachments.delete).mockResolvedValue(undefined);
  });

  it("lists attachments for the transaction in a table", async () => {
    renderAttachments();

    await waitFor(() => {
      expect(attachments.list).toHaveBeenCalledWith("tx-1");
      expect(screen.getByDisplayValue("nota.pdf")).toBeInTheDocument();
      expect(screen.getByText(/2 KB/)).toBeInTheDocument();
    });
  });

  it("adds attachment from local file upload", async () => {
    renderAttachments();

    await waitFor(() => {
      expect(screen.getByDisplayValue("nota.pdf")).toBeInTheDocument();
    });

    const file = new File(["recibo"], "recibo.png", { type: "image/png" });
    const input = document.querySelector('input[type="file"]');
    expect(input).toBeTruthy();
    fireEvent.change(input as HTMLInputElement, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByLabelText("Nome do arquivo")).toHaveValue("recibo.png");
    });

    fireEvent.click(screen.getByRole("button", { name: "Adicionar anexo" }));

    await waitFor(() => {
      expect(attachments.add).toHaveBeenCalledWith(
        "tx-1",
        expect.objectContaining({
          fileName: "recibo.png",
          mimeType: "image/png",
          fileSize: file.size,
          fileUrl: expect.stringMatching(/^data:image\/png;base64,/),
        }),
      );
    });
  });

  it("renames an attachment", async () => {
    renderAttachments();

    await waitFor(() => {
      expect(screen.getByDisplayValue("nota.pdf")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Nome do anexo nota.pdf"), {
      target: { value: "nota-atualizada.pdf" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar nome de nota.pdf" }));

    await waitFor(() => {
      expect(attachments.update).toHaveBeenCalledWith("tx-1", "att-1", {
        fileName: "nota-atualizada.pdf",
      });
    });
  });

  it("deletes attachments after confirmation", async () => {
    renderAttachments();

    await waitFor(() => {
      expect(screen.getByDisplayValue("nota.pdf")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Excluir nota.pdf" }));

    await waitFor(() => {
      expect(Modal.confirm).toHaveBeenCalled();
      expect(attachments.delete).toHaveBeenCalledWith("tx-1", "att-1");
    });
  });
});
