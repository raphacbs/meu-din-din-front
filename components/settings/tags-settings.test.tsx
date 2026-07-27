import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TagsSettings } from "@/components/settings/tags-settings";

vi.mock("@/lib/api/tags", () => ({
  tagsApi: {
    list: vi.fn(),
    upsert: vi.fn(),
    rename: vi.fn(),
    delete: vi.fn(),
  },
}));

import { tagsApi } from "@/lib/api/tags";

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("TagsSettings", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.mocked(tagsApi.list).mockResolvedValue([
      { name: "mercado", usageCount: 3, color: "#FF5733" },
      { name: "fixo", usageCount: 1, color: "#64748B" },
    ]);
    vi.mocked(tagsApi.upsert).mockResolvedValue({
      name: "mercado",
      usageCount: 3,
      color: "#22C55E",
    });
    vi.mocked(tagsApi.rename).mockResolvedValue({ renamedCount: 3, mergedCount: 0 });
    vi.mocked(tagsApi.delete).mockResolvedValue(undefined);
  });

  it("renders tags from API", async () => {
    renderWithClient(<TagsSettings />);

    expect(await screen.findByText("mercado")).toBeInTheDocument();
    expect(screen.getByText("fixo")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("opens edit modal for tag", async () => {
    renderWithClient(<TagsSettings />);

    await screen.findByText("mercado");
    fireEvent.click(screen.getAllByRole("button", { name: "Editar" })[0]);

    expect(await screen.findByText("Editar tag")).toBeInTheDocument();
    expect(screen.getByDisplayValue("mercado")).toBeInTheDocument();
  });

  it("deletes a tag after confirmation", async () => {
    renderWithClient(<TagsSettings />);

    await screen.findByText("mercado");
    fireEvent.click(screen.getAllByRole("button", { name: "Excluir" })[0]);
    const confirmButtons = await screen.findAllByRole("button", { name: "Excluir" });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);

    await waitFor(() => {
      expect(tagsApi.delete).toHaveBeenCalledWith("mercado");
    });
  });

  it("filters tags by search query", async () => {
    renderWithClient(<TagsSettings />);

    await screen.findByText("mercado");
    expect(screen.getByText("fixo")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox", { name: "Pesquisar tags" }), {
      target: { value: "mer" },
    });

    expect(screen.getByText("mercado")).toBeInTheDocument();
    expect(screen.queryByText("fixo")).not.toBeInTheDocument();
  });

  it("shows empty state when search has no matches", async () => {
    renderWithClient(<TagsSettings />);

    await screen.findByText("mercado");
    fireEvent.change(screen.getByRole("searchbox", { name: "Pesquisar tags" }), {
      target: { value: "inexistente" },
    });

    expect(await screen.findByText("Nenhuma tag encontrada para essa busca.")).toBeInTheDocument();
    expect(screen.queryByText("mercado")).not.toBeInTheDocument();
  });
});
