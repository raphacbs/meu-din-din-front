"use client";

import { useEffect, useMemo, useState, type Key } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  Checkbox,
  Divider,
  Empty,
  Grid,
  Input,
  List,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import type { ColumnsType, TableRowSelection } from "antd/es/table/interface";

import { AttachReceiptModal } from "@/components/transactions/attach-receipt-modal";
import { TransactionRowActions } from "@/components/transactions/transaction-row-actions";
import {
  CurrencyCell,
  TransactionMetadata,
  TransactionStatusBadge,
  TransactionTagList,
} from "@/components/ui/transaction-data";
import { ColoredTag } from "@/components/ui/colored-tag";
import { attachments } from "@/lib/api/attachments";
import { formatCurrency } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";
import {
  isPastMonthMutationBlocked,
  useUserPreferencesStore,
} from "@/lib/preferences/user-preferences";
import { queryKeys } from "@/lib/query/keys";
import { getGroupIndicator, getGroupTone } from "@/lib/transactions/labels";
import {
  filterMeuMesTransactions,
  type MeuMesTypeFilter,
} from "@/lib/transactions/filter";
import { listDistinctTags, partitionByTag } from "@/lib/transactions/totals";
import type { TransactionResponse } from "@/lib/types/api";

const { Text, Title } = Typography;

const SECTION_MAX_HEIGHT = 420;

const TYPE_FILTER_OPTIONS: { value: MeuMesTypeFilter; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "RECEITA", label: "Receita" },
  { value: "DESPESA", label: "Despesa" },
];

/** Linha sintética que representa o grupo de transações com a tag selecionada. */
interface GroupRow {
  __groupKey: string;
  isGroup: true;
  tag: string;
  total: number;
  count: number;
  children: TransactionResponse[];
}

type TableRow = TransactionResponse | GroupRow;

function isGroupRow(row: TableRow): row is GroupRow {
  return (row as GroupRow).isGroup === true;
}

function groupRowKey(tag: string): string {
  return `group:${tag}`;
}

function totalColor(total: number): string {
  return total >= 0 ? "var(--color-cash-green)" : "var(--color-debt-red)";
}

interface MeuMesTransactionListsProps {
  pending: TransactionResponse[];
  settled: TransactionResponse[];
  exitingId: string | null;
  enteringId: string | null;
  selectedRowKeys: React.Key[];
  onSelectedRowKeysChange: (keys: React.Key[]) => void;
  onSettleSuccess: (transaction: TransactionResponse) => void;
  onEdit: (transaction: TransactionResponse) => void;
  pendingGroupTag: string | null;
  settledGroupTag: string | null;
  onPendingGroupTagChange: (tag: string | null) => void;
  onSettledGroupTagChange: (tag: string | null) => void;
}

function DescriptionCell({
  transaction,
  onEdit,
  blocked,
}: {
  transaction: TransactionResponse;
  onEdit: (transaction: TransactionResponse) => void;
  blocked: boolean;
}) {
  const groupIndicator = getGroupIndicator(transaction);
  const groupTone = getGroupTone(transaction.group);

  return (
    <div style={{ minWidth: 0 }}>
      <button
        type="button"
        onClick={() => {
          if (!blocked) {
            onEdit(transaction);
          }
        }}
        disabled={blocked}
        title={
          blocked
            ? "Edição de meses passados está bloqueada. Altere em Configurações."
            : "Editar transação"
        }
        style={{
          appearance: "none",
          border: "none",
          background: "transparent",
          padding: 0,
          margin: 0,
          textAlign: "left",
          cursor: blocked ? "not-allowed" : "pointer",
          color: blocked ? "inherit" : "#1677ff",
          font: "inherit",
          textDecoration: blocked ? "none" : "underline",
          opacity: blocked ? 0.75 : 1,
        }}
      >
        {transaction.description}
      </button>
      {groupIndicator ? (
        <Text
          type={groupTone === "muted" ? "secondary" : undefined}
          style={{ display: "block", marginTop: 4, fontSize: 12 }}
        >
          {groupIndicator}
        </Text>
      ) : null}
    </div>
  );
}

function GroupSummaryLabel({ tag, count }: { tag: string; count: number }) {
  return (
    <Space size={8} align="center">
      <ColoredTag name={tag} />
      <Text type="secondary" style={{ fontSize: 12 }}>
        {count} {count === 1 ? "item" : "itens"}
      </Text>
    </Space>
  );
}

function GroupTotalLabel({ total }: { total: number }) {
  return (
    <Text strong className="tabular-nums" style={{ color: totalColor(total) }}>
      {formatCurrency(total)}
    </Text>
  );
}

function transactionRowClassName(
  transaction: TransactionResponse,
  exitingId: string | null,
  enteringId: string | null,
): string {
  if (transaction.id === exitingId) {
    return "meu-mes-row meu-mes-row--exiting";
  }
  if (transaction.id === enteringId) {
    return "meu-mes-row meu-mes-row--entering";
  }
  return "meu-mes-row";
}

export function MeuMesTransactionLists({
  pending,
  settled,
  exitingId,
  enteringId,
  selectedRowKeys,
  onSelectedRowKeysChange,
  onSettleSuccess,
  onEdit,
  pendingGroupTag,
  settledGroupTag,
  onPendingGroupTagChange,
  onSettledGroupTagChange,
}: MeuMesTransactionListsProps) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [attachTarget, setAttachTarget] = useState<TransactionResponse | null>(null);
  const [pendingSearch, setPendingSearch] = useState("");
  const [settledSearch, setSettledSearch] = useState("");
  const [pendingTypeFilter, setPendingTypeFilter] = useState<MeuMesTypeFilter>("ALL");
  const [settledTypeFilter, setSettledTypeFilter] = useState<MeuMesTypeFilter>("ALL");
  const filteredPending = useMemo(
    () =>
      filterMeuMesTransactions(pending, {
        searchQuery: pendingSearch,
        typeFilter: pendingTypeFilter,
      }),
    [pending, pendingSearch, pendingTypeFilter],
  );
  const filteredSettled = useMemo(
    () =>
      filterMeuMesTransactions(settled, {
        searchQuery: settledSearch,
        typeFilter: settledTypeFilter,
      }),
    [settled, settledSearch, settledTypeFilter],
  );
  const allItems = useMemo(
    () => [...filteredPending, ...filteredSettled],
    [filteredPending, filteredSettled],
  );
  const hydrate = useUserPreferencesStore((state) => state.hydrate);
  const blockPastMonthMutations = useUserPreferencesStore(
    (state) => state.blockPastMonthMutations,
  );

  useEffect(() => {
    void hydrate().catch(() => {
      // Preferências já tentam hidratar no SessionProvider; default protege o gate.
    });
  }, [hydrate]);

  const pendingTagOptions = useMemo(() => listDistinctTags(filteredPending), [filteredPending]);
  const settledTagOptions = useMemo(() => listDistinctTags(filteredSettled), [filteredSettled]);

  // Limpa a seleção de agrupamento se a tag escolhida deixar de existir na seção.
  useEffect(() => {
    if (pendingGroupTag && !pendingTagOptions.includes(pendingGroupTag)) {
      onPendingGroupTagChange(null);
    }
  }, [pendingGroupTag, pendingTagOptions, onPendingGroupTagChange]);

  useEffect(() => {
    if (settledGroupTag && !settledTagOptions.includes(settledGroupTag)) {
      onSettledGroupTagChange(null);
    }
  }, [settledGroupTag, settledTagOptions, onSettledGroupTagChange]);

  const attachmentQueries = useQueries({
    queries: allItems.map((transaction) => ({
      queryKey: [...queryKeys.transaction(transaction.id), "attachments"] as const,
      queryFn: () => attachments.list(transaction.id),
      staleTime: 30_000,
    })),
  });

  const attachmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allItems.forEach((transaction, index) => {
      counts[transaction.id] = attachmentQueries[index]?.data?.length ?? 0;
    });
    return counts;
  }, [attachmentQueries, allItems]);

  function isBlocked(transaction: TransactionResponse): boolean {
    return isPastMonthMutationBlocked(transaction, { blockPastMonthMutations });
  }

  function isRowSelectable(transaction: TransactionResponse): boolean {
    return !isBlocked(transaction);
  }

  const selectedKeySet = useMemo(
    () => new Set(selectedRowKeys.map((key) => String(key))),
    [selectedRowKeys],
  );

  function toggleRowSelection(id: string, checked: boolean) {
    const normalizedId = String(id);
    if (checked) {
      if (selectedKeySet.has(normalizedId)) {
        return;
      }
      onSelectedRowKeysChange([...selectedRowKeys, normalizedId]);
      return;
    }
    onSelectedRowKeysChange(selectedRowKeys.filter((key) => String(key) !== normalizedId));
  }

  /** Marca/desmarca de uma vez todas as transações elegíveis de um grupo. */
  function toggleGroupSelection(children: TransactionResponse[], checked: boolean) {
    if (checked) {
      const eligibleIds = children.filter(isRowSelectable).map((t) => String(t.id));
      const merged = new Set([...selectedRowKeys.map(String), ...eligibleIds]);
      onSelectedRowKeysChange([...merged]);
      return;
    }
    const removeSet = new Set(children.map((t) => String(t.id)));
    onSelectedRowKeysChange(selectedRowKeys.filter((key) => !removeSet.has(String(key))));
  }

  function renderGroupCheckbox(children: TransactionResponse[], tag: string) {
    const eligible = children.filter(isRowSelectable);
    const selectedCount = eligible.filter((t) => selectedKeySet.has(String(t.id))).length;
    const allChecked = eligible.length > 0 && selectedCount === eligible.length;
    const indeterminate = selectedCount > 0 && !allChecked;

    return (
      <Checkbox
        checked={allChecked}
        indeterminate={indeterminate}
        disabled={eligible.length === 0}
        onChange={(event) => toggleGroupSelection(children, event.target.checked)}
        aria-label={`Selecionar transações do grupo ${tag}`}
      />
    );
  }

  function buildRowSelection(sectionItems: TransactionResponse[]): TableRowSelection<TableRow> {
    const sourceIds = new Set(sectionItems.map((transaction) => String(transaction.id)));

    return {
      selectedRowKeys: selectedRowKeys.filter((key) => sourceIds.has(String(key))),
      onChange: (keys: Key[]) => {
        const keysFromOtherTables = selectedRowKeys.filter((key) => !sourceIds.has(String(key)));
        onSelectedRowKeysChange([...keysFromOtherTables, ...keys.map((key) => String(key))]);
      },
      getCheckboxProps: (record: TableRow) => {
        if (isGroupRow(record)) {
          return {};
        }
        return { disabled: !isRowSelectable(record) };
      },
      renderCell: (_checked, record, _index, originNode) => {
        if (!isGroupRow(record)) {
          return originNode;
        }
        return renderGroupCheckbox(record.children, record.tag);
      },
    };
  }

  function transactionRowKey(transaction: TransactionResponse): string {
    return String(transaction.id);
  }

  function tableRowKey(record: TableRow): string {
    return isGroupRow(record) ? record.__groupKey : transactionRowKey(record);
  }

  function buildColumns(showSettleActions: boolean): ColumnsType<TableRow> {
    const columns: ColumnsType<TableRow> = [
      {
        title: "Descrição",
        key: "description",
        render: (_, record) =>
          isGroupRow(record) ? (
            <GroupSummaryLabel tag={record.tag} count={record.count} />
          ) : (
            <DescriptionCell
              transaction={record}
              onEdit={onEdit}
              blocked={isBlocked(record)}
            />
          ),
      },
      {
        title: "Valor",
        key: "amount",
        render: (_, record) =>
          isGroupRow(record) ? (
            <GroupTotalLabel total={record.total} />
          ) : (
            <CurrencyCell amount={record.amount} type={record.type} />
          ),
      },
      {
        title: "Tipo",
        key: "type",
        render: (_, record) => {
          if (isGroupRow(record)) {
            return null;
          }
          return record.type === "RECEITA" ? (
            <Text style={{ color: "var(--color-cash-green)", fontWeight: 600 }}>Receita</Text>
          ) : (
            <Text style={{ color: "var(--color-debt-red)", fontWeight: 600 }}>Despesa</Text>
          );
        },
      },
      {
        title: showSettleActions ? "Vencimento" : "Pagamento",
        key: "date",
        render: (_, record) => {
          if (isGroupRow(record)) {
            return null;
          }
          if (showSettleActions) {
            return record.dueDate ? formatDate(record.dueDate) : "—";
          }
          return record.paymentDate
            ? formatDate(record.paymentDate)
            : formatDate(record.transactionDate);
        },
      },
      {
        title: "Status",
        key: "status",
        render: (_, record) =>
          isGroupRow(record) ? null : <TransactionStatusBadge status={record.status} />,
      },
      {
        title: "Tags",
        key: "tags",
        render: (_, record) =>
          isGroupRow(record) ? null : <TransactionTagList tags={record.tags} />,
      },
      {
        title: "Ações",
        key: "actions",
        fixed: "right",
        render: (_, record) => {
          if (isGroupRow(record)) {
            return null;
          }
          return (
            <TransactionRowActions
              transaction={record}
              attachmentCount={attachmentCounts[record.id] ?? 0}
              onAttach={setAttachTarget}
              onEdit={onEdit}
              onSettleSuccess={showSettleActions ? onSettleSuccess : undefined}
            />
          );
        },
      },
    ];

    return columns;
  }

  function renderTransactionCard(transaction: TransactionResponse, showSettleActions: boolean) {
    return (
      <List.Item
        key={transaction.id}
        className={transactionRowClassName(transaction, exitingId, enteringId)}
        style={{
          background: "#ffffff",
          borderRadius: 12,
          marginBottom: 10,
          padding: "12px 14px",
          border: "1px solid #d7ded8",
        }}
      >
        <div style={{ width: "100%" }}>
          <Space align="start" style={{ width: "100%", justifyContent: "space-between" }}>
            <Space align="start">
              <Checkbox
                checked={selectedKeySet.has(String(transaction.id))}
                disabled={!isRowSelectable(transaction)}
                onChange={(event) => toggleRowSelection(transaction.id, event.target.checked)}
                aria-label={`Selecionar ${transaction.description}`}
              />
              <DescriptionCell
                transaction={transaction}
                onEdit={onEdit}
                blocked={isBlocked(transaction)}
              />
            </Space>
            <CurrencyCell amount={transaction.amount} type={transaction.type} />
          </Space>
          <div style={{ marginTop: 12 }}>
            <TransactionMetadata
              type={transaction.type}
              transactionDate={transaction.transactionDate}
              dueDate={transaction.dueDate}
            />
          </div>
          <Space wrap style={{ marginTop: 12 }} align="center">
            <TransactionStatusBadge status={transaction.status} />
            <TransactionTagList tags={transaction.tags} />
            <TransactionRowActions
              transaction={transaction}
              attachmentCount={attachmentCounts[transaction.id] ?? 0}
              onAttach={setAttachTarget}
              onEdit={onEdit}
              onSettleSuccess={showSettleActions ? onSettleSuccess : undefined}
            />
          </Space>
        </div>
      </List.Item>
    );
  }

  function resolveEmptyDescription(
    sourceItems: TransactionResponse[],
    visibleItems: TransactionResponse[],
    defaultDescription: string,
    hasActiveFilter: boolean,
  ): string {
    if (sourceItems.length === 0) {
      return defaultDescription;
    }

    if (visibleItems.length === 0 && hasActiveFilter) {
      return "Nenhum item encontrado para essa busca ou filtro.";
    }

    return defaultDescription;
  }

  function renderSectionFilters(
    sectionKey: "pendentes" | "liquidados",
    searchQuery: string,
    onSearchChange: (value: string) => void,
    typeFilter: MeuMesTypeFilter,
    onTypeFilterChange: (value: MeuMesTypeFilter) => void,
  ) {
    const sectionLabel = sectionKey === "pendentes" ? "Pendentes" : "Liquidados";

    return (
      <Space wrap style={{ width: "100%", marginBottom: 12 }} size={12}>
        <Input.Search
          allowClear
          aria-label={`Pesquisar transações ${sectionLabel}`}
          placeholder="Pesquisar transações"
          value={searchQuery}
          style={{ minWidth: 220, maxWidth: 320, flex: "1 1 220px" }}
          data-testid={`${sectionKey}-search`}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <Select<MeuMesTypeFilter>
          aria-label={`Filtrar tipo ${sectionLabel}`}
          value={typeFilter}
          style={{ minWidth: 140 }}
          data-testid={`${sectionKey}-type-filter`}
          options={TYPE_FILTER_OPTIONS}
          onChange={onTypeFilterChange}
        />
      </Space>
    );
  }

  function renderMobileSection(
    sourceItems: TransactionResponse[],
    items: TransactionResponse[],
    showSettleActions: boolean,
    defaultEmptyDescription: string,
    groupTag: string | null,
    hasActiveFilter: boolean,
  ) {
    const emptyDescription = resolveEmptyDescription(
      sourceItems,
      items,
      defaultEmptyDescription,
      hasActiveFilter,
    );

    if (items.length === 0) {
      return <Empty description={emptyDescription} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    const { group, rest, total, count } = partitionByTag(items, groupTag);
    const hasGroup = Boolean(groupTag) && group.length > 0;

    return (
      <div style={{ maxHeight: SECTION_MAX_HEIGHT, overflowY: "auto" }}>
        {hasGroup ? (
          <div
            style={{
              marginBottom: 10,
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #b7d6c2",
              background: "#eef8f1",
            }}
          >
            <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
              <Space align="center">
                {renderGroupCheckbox(group, groupTag as string)}
                <GroupSummaryLabel tag={groupTag as string} count={count} />
              </Space>
              <GroupTotalLabel total={total} />
            </Space>
          </div>
        ) : null}
        {hasGroup ? group.map((transaction) => renderTransactionCard(transaction, showSettleActions)) : null}
        {hasGroup && rest.length > 0 ? <Divider style={{ margin: "12px 0" }} /> : null}
        {rest.map((transaction) => renderTransactionCard(transaction, showSettleActions))}
      </div>
    );
  }

  function renderDesktopSection(
    sourceItems: TransactionResponse[],
    items: TransactionResponse[],
    showSettleActions: boolean,
    defaultEmptyDescription: string,
    groupTag: string | null,
    hasActiveFilter: boolean,
  ) {
    const emptyDescription = resolveEmptyDescription(
      sourceItems,
      items,
      defaultEmptyDescription,
      hasActiveFilter,
    );

    if (items.length === 0) {
      return <Empty description={emptyDescription} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    const { group, rest, total, count } = partitionByTag(items, groupTag);
    const hasGroup = Boolean(groupTag) && group.length > 0;

    const rows: TableRow[] = hasGroup
      ? [
          {
            __groupKey: groupRowKey(groupTag as string),
            isGroup: true,
            tag: groupTag as string,
            total,
            count,
            children: group,
          },
          ...rest,
        ]
      : items;

    return (
      <Table<TableRow>
        // Remonta a tabela ao trocar a tag: garante que o grupo novo comece expandido
        // (defaultExpandedRowKeys é não controlado) sem precisar de estado/efeito extra.
        key={groupTag ?? "flat"}
        rowKey={tableRowKey}
        columns={buildColumns(showSettleActions)}
        dataSource={rows}
        pagination={false}
        scroll={{ x: true, y: SECTION_MAX_HEIGHT }}
        rowSelection={buildRowSelection(items)}
        expandable={{
          defaultExpandedRowKeys: hasGroup ? [groupRowKey(groupTag as string)] : [],
        }}
        rowClassName={(record) =>
          isGroupRow(record)
            ? "meu-mes-row meu-mes-row--group"
            : transactionRowClassName(record, exitingId, enteringId)
        }
        style={{
          background: "#ffffff",
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid #d7ded8",
        }}
      />
    );
  }

  function renderSectionHeader(
    title: string,
    tagOptions: string[],
    groupTag: string | null,
    onGroupTagChange: (tag: string | null) => void,
  ) {
    return (
      <Space
        align="center"
        style={{ width: "100%", justifyContent: "space-between", marginBottom: 12, gap: 8 }}
        wrap
      >
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>
        {tagOptions.length > 0 ? (
          <Space
            size={8}
            align="center"
            data-testid={`${title.toLowerCase()}-group-select`}
          >
            <Text type="secondary" style={{ fontSize: 13 }}>
              Agrupar por
            </Text>
            <Select
              allowClear
              showSearch
              placeholder="Nenhuma"
              style={{ minWidth: 180 }}
              value={groupTag ?? undefined}
              options={tagOptions.map((tag) => ({ value: tag, label: tag }))}
              onChange={(value) => onGroupTagChange((value as string | undefined) ?? null)}
              onClear={() => onGroupTagChange(null)}
              aria-label={`Agrupar ${title} por tag`}
            />
          </Space>
        ) : null}
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={28} style={{ width: "100%" }}>
      <section>
        {renderSectionHeader(
          "Pendentes",
          pendingTagOptions,
          pendingGroupTag,
          onPendingGroupTagChange,
        )}
        {renderSectionFilters(
          "pendentes",
          pendingSearch,
          setPendingSearch,
          pendingTypeFilter,
          setPendingTypeFilter,
        )}
        {isMobile
          ? renderMobileSection(
              pending,
              filteredPending,
              true,
              "Nada pendente neste mês.",
              pendingGroupTag,
              pendingSearch.trim().length > 0 || pendingTypeFilter !== "ALL",
            )
          : renderDesktopSection(
              pending,
              filteredPending,
              true,
              "Nada pendente neste mês.",
              pendingGroupTag,
              pendingSearch.trim().length > 0 || pendingTypeFilter !== "ALL",
            )}
      </section>

      <section>
        {renderSectionHeader(
          "Liquidados",
          settledTagOptions,
          settledGroupTag,
          onSettledGroupTagChange,
        )}
        {renderSectionFilters(
          "liquidados",
          settledSearch,
          setSettledSearch,
          settledTypeFilter,
          setSettledTypeFilter,
        )}
        {isMobile
          ? renderMobileSection(
              settled,
              filteredSettled,
              false,
              "Nenhum item liquidado ainda.",
              settledGroupTag,
              settledSearch.trim().length > 0 || settledTypeFilter !== "ALL",
            )
          : renderDesktopSection(
              settled,
              filteredSettled,
              false,
              "Nenhum item liquidado ainda.",
              settledGroupTag,
              settledSearch.trim().length > 0 || settledTypeFilter !== "ALL",
            )}
      </section>

      <AttachReceiptModal
        open={Boolean(attachTarget)}
        transactionId={attachTarget?.id ?? null}
        onClose={() => setAttachTarget(null)}
      />
    </Space>
  );
}
