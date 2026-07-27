import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { tagsApi } from "@/lib/api/tags";

vi.mock("@/lib/api/client", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "@/lib/api/client";

describe("tags API", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("lists tags", async () => {
    const mockTags = [{ name: "mercado", usageCount: 2, color: "#64748B" }];
    vi.mocked(apiFetch).mockResolvedValue(mockTags);

    const result = await tagsApi.list();

    expect(apiFetch).toHaveBeenCalledWith("/api/tags");
    expect(result).toEqual(mockTags);
  });

  it("upserts a tag color", async () => {
    const response = { name: "mercado", usageCount: 1, color: "#FF5733" };
    vi.mocked(apiFetch).mockResolvedValue(response);

    const result = await tagsApi.upsert({ name: "mercado", color: "#FF5733" });

    expect(apiFetch).toHaveBeenCalledWith("/api/tags", {
      method: "PUT",
      body: JSON.stringify({ name: "MERCADO", color: "#FF5733" }),
    });
    expect(result).toEqual(response);
  });

  it("renames a tag", async () => {
    const response = { renamedCount: 2, mergedCount: 0 };
    vi.mocked(apiFetch).mockResolvedValue(response);

    const result = await tagsApi.rename({ from: "mercado", to: "Supermercado" });

    expect(apiFetch).toHaveBeenCalledWith("/api/tags/rename", {
      method: "PUT",
      body: JSON.stringify({ from: "MERCADO", to: "SUPERMERCADO" }),
    });
    expect(result).toEqual(response);
  });

  it("deletes a tag with encoded name", async () => {
    vi.mocked(apiFetch).mockResolvedValue(undefined);

    await tagsApi.delete("tag com espaço");

    expect(apiFetch).toHaveBeenCalledWith("/api/tags/TAG%20COM%20ESPA%C3%87O", {
      method: "DELETE",
    });
  });
});
