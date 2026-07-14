"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Empty, Grid, List, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import { AttachReceiptModal } from "@/components/transactions/attach-receipt-modal";
import { TransactionRowActions } from "@/components/transactions/transaction-row-actions";
import {
  CurrencyCell,
  TransactionMetadata,
  TransactionStatusBadge,
  TransactionTagList,
} from "@/components/ui/transaction-data";
import { attachments } from "@/lib/api/attachments";
import { formatDate } from "@/lib/format/date";
import {
  isPastMonthMutationBlocked,
  useUserPreferencesStore,
} from "@/lib/preferences/user-preferences";
import { queryKeys } from "@/lib/query/keys";
import { getGroupIndicator, getGroupTone } from "@/lib/transactions/labels";
import type { TransactionResponse } from "@/lib/types/api";

const { Text, Title } = Typography;

interface MeuMesTransactionListsProps {
  pending: TransactionResponse[];
  settled: TransactionResponse[];
  exitingId: string | null;
  enteringId: string | null;
  onSettleSuccess: (transaction: TransactionResponse) => void;
  onEdit: (transaction: TransactionResponse) => void;
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

function rowClassName(
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
  onSettleSuccess,
  onEdit,
}: MeuMesTransactionListsProps) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [attachTarget, setAttachTarget] = useState<TransactionResponse | null>(null);
  const allItems = useMemo(() => [...pending, ...settled], [pending, settled]);
  const hydrate = useUserPreferencesStore((state) => state.hydrate);
  const blockPastMonthMutations = useUserPreferencesStore(
    (state) => state.blockPastMonthMutations,
  );

  useEffect(() => {
    void hydrate().catch(() => {
      // Preferências já tentam hidratar no SessionProvider; default protege o gate.
    });
  }, [hydrate]);

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

  function buildColumns(showSettleActions: boolean): ColumnsType<TransactionResponse> {
    const columns: ColumnsType<TransactionResponse> = [
      {
        title: "Descrição",
        key: "description",
        render: (_, transaction) => (
          <DescriptionCell
            transaction={transaction}
            onEdit={onEdit}
            blocked={isBlocked(transaction)}
          />
        ),
      },
      {
        title: "Valor",
        key: "amount",
        render: (_, transaction) => (
          <CurrencyCell amount={transaction.amount} type={transaction.type} />
        ),
      },
      {
        title: "Tipo",
        dataIndex: "type",
        key: "type",
        render: (type: TransactionResponse["type"]) =>
          type === "RECEITA" ? (
            <Text style={{ color: "var(--color-cash-green)", fontWeight: 600 }}>Receita</Text>
          ) : (
            <Text style={{ color: "var(--color-debt-red)", fontWeight: 600 }}>Despesa</Text>
          ),
      },
      {
        title: showSettleActions ? "Vencimento" : "Pagamento",
        key: "date",
        render: (_, transaction) => {
          if (showSettleActions) {
            return transaction.dueDate ? formatDate(transaction.dueDate) : "—";
          }
          return transaction.paymentDate
            ? formatDate(transaction.paymentDate)
            : formatDate(transaction.transactionDate);
        },
      },
      {
        title: "Status",
        key: "status",
        render: (_, transaction) => <TransactionStatusBadge status={transaction.status} />,
      },
      {
        title: "Tags",
        key: "tags",
        render: (_, transaction) => <TransactionTagList tags={transaction.tags} />,
      },
      {
        title: "Ações",
        key: "actions",
        fixed: "right",
        render: (_, transaction) => (
          <TransactionRowActions
            transaction={transaction}
            attachmentCount={attachmentCounts[transaction.id] ?? 0}
            onAttach={setAttachTarget}
            onEdit={onEdit}
            onSettleSuccess={showSettleActions ? onSettleSuccess : undefined}
          />
        ),
      },
    ];

    return columns;
  }

  function renderMobileList(
    items: TransactionResponse[],
    showSettleActions: boolean,
    emptyDescription: string,
  ) {
    if (items.length === 0) {
      return <Empty description={emptyDescription} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    return (
      <List
        dataSource={items}
        renderItem={(transaction) => (
          <List.Item
            key={transaction.id}
            className={rowClassName(transaction, exitingId, enteringId)}
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
                <DescriptionCell
                  transaction={transaction}
                  onEdit={onEdit}
                  blocked={isBlocked(transaction)}
                />
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
        )}
      />
    );
  }

  function renderDesktopTable(
    items: TransactionResponse[],
    showSettleActions: boolean,
    emptyDescription: string,
  ) {
    if (items.length === 0) {
      return <Empty description={emptyDescription} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    return (
      <Table
        rowKey="id"
        columns={buildColumns(showSettleActions)}
        dataSource={items}
        pagination={false}
        scroll={{ x: true }}
        rowClassName={(transaction) => rowClassName(transaction, exitingId, enteringId)}
        style={{
          background: "#ffffff",
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid #d7ded8",
        }}
      />
    );
  }

  return (
    <Space direction="vertical" size={28} style={{ width: "100%" }}>
      <section>
        <Title level={4} style={{ marginBottom: 12 }}>
          Pendentes
        </Title>
        {isMobile
          ? renderMobileList(pending, true, "Nada pendente neste mês.")
          : renderDesktopTable(pending, true, "Nada pendente neste mês.")}
      </section>

      <section>
        <Title level={4} style={{ marginBottom: 12 }}>
          Liquidados
        </Title>
        {isMobile
          ? renderMobileList(settled, false, "Nenhum item liquidado ainda.")
          : renderDesktopTable(settled, false, "Nenhum item liquidado ainda.")}
      </section>

      <AttachReceiptModal
        open={Boolean(attachTarget)}
        transactionId={attachTarget?.id ?? null}
        onClose={() => setAttachTarget(null)}
      />
    </Space>
  );
}
