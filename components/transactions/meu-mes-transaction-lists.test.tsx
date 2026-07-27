import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import dayjs from "dayjs";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MeuMesTransactionLists } from "@/components/transactions/meu-mes-transaction-lists";
import type { TransactionResponse } from "@/lib/types/api";

vi.mock("@/lib/api/attachments", () => ({
  attachments: {
    list: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/lib/api/tags", () => ({
  tagsApi: {
    list: vi.fn().mockResolvedValue([]),
  },
}));

const today = dayjs();

function tx(overrides: Partial<TransactionResponse> & { id: string }): TransactionResponse {
  return {
    type: "DESPESA",
    amount: 100,
    description: overrides.id,
    transactionDate: today.format("YYYY-MM-DD"),
    dueDate: today.format("YYYY-MM-DD"),
    status: "A_VENCER",
    ...overrides,
  };
}

function Harness({
  pending,
  settled,
}: {
  pending: TransactionResponse[];
  settled: TransactionResponse[];
}) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [pendingGroupTag, setPendingGroupTag] = useState<string | null>(null);
  const [settledGroupTag, setSettledGroupTag] = useState<string | null>(null);

  return (
    <>
      <div data-testid="selected-count">{selectedRowKeys.length}</div>
      <MeuMesTransactionLists
        pending={pending}
        settled={settled}
        exitingId={null}
        enteringId={null}
        selectedRowKeys={selectedRowKeys}
        onSelectedRowKeysChange={setSelectedRowKeys}
        onSettleSuccess={() => {}}
        onEdit={() => {}}
        pendingGroupTag={pendingGroupTag}
        settledGroupTag={settledGroupTag}
        onPendingGroupTagChange={setPendingGroupTag}
        onSettledGroupTagChange={setSettledGroupTag}
      />
    </>
  );
}

function renderHarness(pending: TransactionResponse[], settled: TransactionResponse[] = []) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <Harness pending={pending} settled={settled} />
    </QueryClientProvider>,
  );
}

function openSelect(section: "pendentes" | "liquidados") {
  const container = screen.getByTestId(`${section}-group-select`);
  const selector = container.querySelector(".ant-select-selector");
  expect(selector).not.toBeNull();
  fireEvent.mouseDown(selector!);
}

function openTypeFilter(section: "pendentes" | "liquidados") {
  const container = screen.getByTestId(`${section}-type-filter`);
  const selector = container.querySelector(".ant-select-selector");
  expect(selector).not.toBeNull();
  fireEvent.mouseDown(selector!);
}

describe("MeuMesTransactionLists search and type filter", () => {
  afterEach(() => {
    cleanup();
  });

  it("filters pending transactions by description", async () => {
    const pending = [
      tx({ id: "tx-aluguel", description: "Aluguel" }),
      tx({ id: "tx-netflix", description: "Netflix" }),
    ];

    renderHarness(pending);

    fireEvent.change(screen.getByTestId("pendentes-search"), {
      target: { value: "alug" },
    });

    await waitFor(() => {
      expect(screen.getByText("Aluguel")).toBeInTheDocument();
      expect(screen.queryByText("Netflix")).not.toBeInTheDocument();
    });
  });

  it("filters pending transactions by tag", async () => {
    const pending = [
      tx({ id: "tx-casa", description: "Conta de luz", tags: ["casa"] }),
      tx({ id: "tx-lazer", description: "Cinema", tags: ["lazer"] }),
    ];

    renderHarness(pending);

    fireEvent.change(screen.getByTestId("pendentes-search"), {
      target: { value: "LAZER" },
    });

    await waitFor(() => {
      expect(screen.getByText("Cinema")).toBeInTheDocument();
      expect(screen.queryByText("Conta de luz")).not.toBeInTheDocument();
    });
  });

  it("filters pending transactions by type", async () => {
    const pending = [
      tx({ id: "tx-despesa", description: "Mercado", type: "DESPESA" }),
      tx({ id: "tx-receita", description: "Salário", type: "RECEITA" }),
    ];

    renderHarness(pending);

    openTypeFilter("pendentes");
    fireEvent.click(await screen.findByTitle("Receita"));

    await waitFor(() => {
      expect(screen.getByText("Salário")).toBeInTheDocument();
      expect(screen.queryByText("Mercado")).not.toBeInTheDocument();
    });
  });

  it("shows empty state when search has no matches but section has items", async () => {
    renderHarness([tx({ id: "tx-1", description: "Aluguel" })]);

    fireEvent.change(screen.getByTestId("pendentes-search"), {
      target: { value: "inexistente" },
    });

    expect(
      await screen.findByText("Nenhum item encontrado para essa busca ou filtro."),
    ).toBeInTheDocument();
  });

  it("keeps settled search independent from pending search", async () => {
    const pending = [tx({ id: "tx-pending", description: "Pendente mercado" })];
    const settled = [
      tx({
        id: "tx-settled",
        description: "Liquidado mercado",
        status: "PAGO",
        paymentDate: today.format("YYYY-MM-DD"),
      }),
    ];

    renderHarness(pending, settled);

    fireEvent.change(screen.getByTestId("pendentes-search"), {
      target: { value: "pendente" },
    });

    await waitFor(() => {
      expect(screen.getByText("Pendente mercado")).toBeInTheDocument();
      expect(screen.getByText("Liquidado mercado")).toBeInTheDocument();
    });
  });
});

describe("MeuMesTransactionLists grouping by tag", () => {
  afterEach(() => {
    cleanup();
  });

  it("only lists tags present in that section's own transactions", async () => {
    const pending = [tx({ id: "tx-casa", tags: ["casa"] })];
    const settled = [
      tx({
        id: "tx-lazer",
        status: "PAGO",
        paymentDate: today.format("YYYY-MM-DD"),
        tags: ["lazer"],
      }),
    ];

    renderHarness(pending, settled);

    openSelect("pendentes");
    expect(await screen.findByTitle("casa")).toBeInTheDocument();
    expect(screen.queryByTitle("lazer")).not.toBeInTheDocument();
  });

  it("does not show a group selector when the section has no tags", () => {
    renderHarness([tx({ id: "tx-no-tag" })]);

    expect(screen.queryByTestId("pendentes-group-select")).not.toBeInTheDocument();
  });

  it("groups matching transactions at the top with net total and count, keeping the rest listed", async () => {
    const pending = [
      tx({ id: "tx-casa-1", type: "DESPESA", amount: 100, tags: ["casa"] }),
      tx({ id: "tx-casa-2", type: "RECEITA", amount: 30, tags: ["casa"] }),
      tx({ id: "tx-transporte", type: "DESPESA", amount: 40, tags: ["transporte"] }),
    ];

    renderHarness(pending);

    openSelect("pendentes");
    fireEvent.click(await screen.findByTitle("casa"));

    await waitFor(() => {
      expect(screen.getByText("2 itens")).toBeInTheDocument();
    });

    // Saldo líquido do grupo: 30 (receita) - 100 (despesa) = -70,00
    expect(screen.getByText((content) => content.includes("70,00"))).toBeInTheDocument();

    // Transação sem a tag "casa" continua listada normalmente.
    expect(screen.getByText("tx-transporte")).toBeInTheDocument();
  });

  it("removes the group and shows all transactions flat again when the tag is cleared", async () => {
    const pending = [
      tx({ id: "tx-casa-1", tags: ["casa"] }),
      tx({ id: "tx-transporte", tags: ["transporte"] }),
    ];

    renderHarness(pending);

    openSelect("pendentes");
    fireEvent.click(await screen.findByTitle("casa"));

    await waitFor(() => {
      expect(screen.getByText("1 item")).toBeInTheDocument();
    });

    const container = screen.getByTestId("pendentes-group-select");
    const clearIcon = container.querySelector(".ant-select-clear");
    expect(clearIcon).not.toBeNull();
    fireEvent.mouseDown(clearIcon!);

    await waitFor(() => {
      expect(screen.queryByText("1 item")).not.toBeInTheDocument();
    });
    expect(screen.getByText("tx-casa-1")).toBeInTheDocument();
    expect(screen.getByText("tx-transporte")).toBeInTheDocument();
  });

  it("selecting the group checkbox selects all its eligible transactions", async () => {
    const pending = [
      tx({ id: "tx-casa-1", tags: ["casa"] }),
      tx({ id: "tx-casa-2", tags: ["casa"] }),
      tx({ id: "tx-transporte", tags: ["transporte"] }),
    ];

    renderHarness(pending);

    openSelect("pendentes");
    fireEvent.click(await screen.findByTitle("casa"));

    await waitFor(() => {
      expect(screen.getByText("2 itens")).toBeInTheDocument();
    });

    const groupRow = screen.getByText("2 itens").closest("tr");
    expect(groupRow).not.toBeNull();
    const groupCheckbox = groupRow!.querySelector('input[type="checkbox"]');
    expect(groupCheckbox).not.toBeNull();

    fireEvent.click(groupCheckbox!);

    await waitFor(() => {
      expect(screen.getByTestId("selected-count").textContent).toBe("2");
    });

    fireEvent.click(groupCheckbox!);

    await waitFor(() => {
      expect(screen.getByTestId("selected-count").textContent).toBe("0");
    });
  });

  it("does not select transactions blocked by the past-month gate through the group checkbox", async () => {
    const lastMonth = today.subtract(1, "month");
    const pending = [
      tx({
        id: "tx-casa-blocked",
        tags: ["casa"],
        transactionDate: lastMonth.format("YYYY-MM-DD"),
        dueDate: lastMonth.format("YYYY-MM-DD"),
      }),
      tx({ id: "tx-casa-eligible", tags: ["casa"] }),
    ];

    renderHarness(pending);

    openSelect("pendentes");
    fireEvent.click(await screen.findByTitle("casa"));

    await waitFor(() => {
      expect(screen.getByText("2 itens")).toBeInTheDocument();
    });

    const groupRow = screen.getByText("2 itens").closest("tr");
    const groupCheckbox = groupRow!.querySelector('input[type="checkbox"]');
    fireEvent.click(groupCheckbox!);

    await waitFor(() => {
      // Só a transação do mês corrente entra na seleção; a bloqueada permanece fora.
      expect(screen.getByTestId("selected-count").textContent).toBe("1");
    });
  });
});
