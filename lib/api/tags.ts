import { apiFetch } from "@/lib/api/client";
import { normalizeTagName } from "@/lib/tags/constants";
import type { TagRenameRequest, TagRenameResponse, TagSummary, TagUpsertRequest } from "@/lib/types/api";

export const tagsApi = {
  list: () => apiFetch<TagSummary[]>("/api/tags"),

  upsert: (body: TagUpsertRequest) =>
    apiFetch<TagSummary>("/api/tags", {
      method: "PUT",
      body: JSON.stringify({
        name: normalizeTagName(body.name),
        color: body.color,
      }),
    }),

  rename: (body: TagRenameRequest) =>
    apiFetch<TagRenameResponse>("/api/tags/rename", {
      method: "PUT",
      body: JSON.stringify({
        from: normalizeTagName(body.from),
        to: normalizeTagName(body.to),
      }),
    }),

  delete: (tagName: string) =>
    apiFetch<void>(`/api/tags/${encodeURIComponent(normalizeTagName(tagName))}`, {
      method: "DELETE",
    }),
};
