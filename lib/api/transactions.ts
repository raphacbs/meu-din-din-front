import { apiFetch } from "@/lib/api/client";
import type {
  InstallmentGroupUpdateRequest,
  TransactionBatchDeleteRequest,
  TransactionBatchDeleteResponse,
  TransactionBatchSettleRequest,
  TransactionBatchSettleResponse,
  TransactionResponse,
  TransactionUpsertRequest,
  TransactionGroupResponse,
} from "@/lib/types/api";

export const transactions = {
  create: (body: TransactionUpsertRequest) =>
    apiFetch<TransactionResponse>("/api/transactions", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  list: () => apiFetch<TransactionResponse[]>("/api/transactions"),

  getById: (id: string) => apiFetch<TransactionResponse>(`/api/transactions/${id}`),

  extract: (from?: string, to?: string) =>
    apiFetch<TransactionResponse[]>("/api/transactions/extract", {
      headers: {
        ...(from ? { "X-From-Date": from } : {}),
        ...(to ? { "X-To-Date": to } : {}),
      },
    }),

  update: (id: string, body: TransactionUpsertRequest) =>
    apiFetch<TransactionResponse>(`/api/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/api/transactions/${id}`, {
      method: "DELETE",
    }),

  deleteRecurrenceFromHere: (id: string) =>
    apiFetch<void>(`/api/transactions/${id}/recurrence/from-here`, {
      method: "DELETE",
    }),

  cancel: (id: string) =>
    apiFetch<TransactionResponse>(`/api/transactions/${id}/cancel`, {
      method: "POST",
    }),

  listInstallments: (groupId: string) =>
    apiFetch<TransactionResponse[]>(`/api/transactions/groups/${groupId}/installments`),

  updateInstallments: (groupId: string, body: InstallmentGroupUpdateRequest) =>
    apiFetch<TransactionResponse[]>(`/api/transactions/groups/${groupId}/installments`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteInstallments: (groupId: string) =>
    apiFetch<void>(`/api/transactions/groups/${groupId}/installments`, {
      method: "DELETE",
    }),

  deactivateRecurrence: (groupId: string) =>
    apiFetch<TransactionGroupResponse>(
      `/api/transactions/groups/${groupId}/recurrence/deactivate`,
      { method: "POST" },
    ),

  settleBatch: (body: TransactionBatchSettleRequest) =>
    apiFetch<TransactionBatchSettleResponse>("/api/transactions/batch/settle", {
      method: "POST",
      body: JSON.stringify({
        ...body,
        ids: body.ids.map((id) => Number(id)),
      }),
    }),

  deleteBatch: (body: TransactionBatchDeleteRequest) =>
    apiFetch<TransactionBatchDeleteResponse>("/api/transactions/batch/delete", {
      method: "POST",
      body: JSON.stringify({
        ...body,
        items: body.items.map((item) => ({
          ...item,
          id: Number(item.id),
        })),
      }),
    }),
};
