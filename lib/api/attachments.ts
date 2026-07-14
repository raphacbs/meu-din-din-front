import { apiFetch } from "@/lib/api/client";
import type {
  AttachmentRequest,
  AttachmentResponse,
  AttachmentUpdateRequest,
} from "@/lib/types/api";

export const attachments = {
  add: (transactionId: string, body: AttachmentRequest) =>
    apiFetch<AttachmentResponse>(`/api/transactions/${transactionId}/attachments`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  list: (transactionId: string) =>
    apiFetch<AttachmentResponse[]>(`/api/transactions/${transactionId}/attachments`),

  update: (transactionId: string, attachmentId: string, body: AttachmentUpdateRequest) =>
    apiFetch<AttachmentResponse>(
      `/api/transactions/${transactionId}/attachments/${attachmentId}`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      },
    ),

  delete: (transactionId: string, attachmentId: string) =>
    apiFetch<void>(`/api/transactions/${transactionId}/attachments/${attachmentId}`, {
      method: "DELETE",
    }),
};
