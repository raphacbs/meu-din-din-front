import { apiFetch } from "@/lib/api/client";
import type {
  BatchCreateRequest,
  BatchCreateResponse,
  BatchTransactionItem,
  ImportBank,
  InvoiceParseResponse,
} from "@/lib/types/api";

interface ParseInvoiceParams {
  file: File;
  bank: ImportBank;
}

export const transactionsImport = {
  parseInvoice: ({ file, bank }: ParseInvoiceParams) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bank", bank);

    return apiFetch<InvoiceParseResponse>("/api/transactions/import/parse", {
      method: "POST",
      body: formData,
    });
  },

  createBatch: (items: BatchTransactionItem[]) =>
    apiFetch<BatchCreateResponse>("/api/transactions/import/batch", {
      method: "POST",
      body: JSON.stringify({ items } satisfies BatchCreateRequest),
    }),
};
