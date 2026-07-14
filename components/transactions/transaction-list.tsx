"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { Grid, List, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import { AttachReceiptModal } from "@/components/transactions/attach-receipt-modal";
import { TagSharePieChart } from "@/components/transactions/tag-share-pie-chart";
import { TransactionRowActions } from "@/components/transactions/transaction-row-actions";
import {
  CurrencyCell,
  TransactionMetadata,
  TransactionStatusBadge,
  TransactionTagList,
} from "@/components/ui/transaction-data";
import { attachments } from "@/lib/api/attachments";
import { formatCurrency } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";
import { queryKeys } from "@/lib/query/keys";
import { getGroupIndicator, getGroupTone } from "@/lib/transactions/labels";
import { calculatePeriodTotals } from "@/lib/transactions/totals";
import type { TransactionResponse } from "@/lib/types/api";

const { Text } = Typography;

interface TransactionListProps {
  transactions: TransactionResponse[];
  showRowActions?: boolean;
  showSummary?: boolean;
  showTagChart?: boolean;
}

function DescriptionCell({ transaction }: { transaction: TransactionResponse }) {
  const groupIndicator = getGroupIndicator(transaction);
  const groupTone = getGroupTone(transaction.group);

  return (
    <div style={{ minWidth: 0 }}>
      <Link href={`/transactions/${transaction.id}`}>{transaction.description}</Link>
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

function TotalStatCard({
  label,
  value,
  background,
  color,
}: {
  label: string;
  value: number;
  background: string;
  color: string;
}) {
  return (
    <div
      style={{
        flex: "1 1 160px",
        minWidth: 140,
        padding: "14px 16px",
        borderRadius: 14,
        background,
        border: `1px solid ${color}33`,
        boxShadow: `0 8px 20px ${color}14`,
      }}
    >
      <Text style={{ display: "block", color, fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" }}>
        {label.toUpperCase()}
      </Text>
      <Text
        className="tabular-nums"
        style={{ display: "block", marginTop: 6, color, fontSize: 22, fontWeight: 700 }}
      >
        {formatCurrency(value)}
      </Text>
    </div>
  );
}

function PeriodTotalsSummary({ transactions }: { transactions: TransactionResponse[] }) {
  const totals = calculatePeriodTotals(transactions);
  const balanceColor =
    totals.balance >= 0 ? "var(--color-cash-green)" : "var(--color-debt-red)";
  const balanceBg =
    totals.balance >= 0
      ? "linear-gradient(135deg, #e8f7ee 0%, #d9f0e2 100%)"
      : "linear-gradient(135deg, #fdeceb 0%, #f8d7d3 100%)";

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        width: "100%",
        padding: "4px 0",
      }}
    >
      <TotalStatCard
        label="Despesas"
        value={totals.expenseTotal}
        color="var(--color-debt-red)"
        background="linear-gradient(135deg, #fdeceb 0%, #f8d7d3 100%)"
      />
      <TotalStatCard
        label="Receitas"
        value={totals.revenueTotal}
        color="var(--color-cash-green)"
        background="linear-gradient(135deg, #e8f7ee 0%, #d9f0e2 100%)"
      />
      <TotalStatCard
        label="Saldo"
        value={totals.balance}
        color={balanceColor}
        background={balanceBg}
      />
    </div>
  );
}

export function TransactionList({
  transactions: items,
  showRowActions = true,
  showSummary = true,
  showTagChart = true,
}: TransactionListProps) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [attachTarget, setAttachTarget] = useState<TransactionResponse | null>(null);

  const attachmentQueries = useQueries({
    queries: showRowActions
      ? items.map((transaction) => ({
          queryKey: [...queryKeys.transaction(transaction.id), "attachments"] as const,
          queryFn: () => attachments.list(transaction.id),
          staleTime: 30_000,
        }))
      : [],
  });

  const attachmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((transaction, index) => {
      counts[transaction.id] = attachmentQueries[index]?.data?.length ?? 0;
    });
    return counts;
  }, [attachmentQueries, items]);

  const columns: ColumnsType<TransactionResponse> = [
    {
      title: "Descrição",
      key: "description",
      render: (_, transaction) => <DescriptionCell transaction={transaction} />,
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
      title: "Data",
      key: "transactionDate",
      render: (_, transaction) => formatDate(transaction.transactionDate),
    },
    {
      title: "Vencimento",
      key: "dueDate",
      render: (_, transaction) =>
        transaction.dueDate ? formatDate(transaction.dueDate) : "—",
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
  ];

  if (showRowActions) {
    columns.push({
      title: "Ações",
      key: "actions",
      fixed: "right",
      render: (_, transaction) => (
        <TransactionRowActions
          transaction={transaction}
          attachmentCount={attachmentCounts[transaction.id] ?? 0}
          onAttach={setAttachTarget}
        />
      ),
    });
  }

  const footer = (
    <>
      {showSummary && items.length > 0 ? (
        <div style={{ marginTop: 16 }}>
          <PeriodTotalsSummary transactions={items} />
        </div>
      ) : null}
      {showTagChart && items.length > 0 ? <TagSharePieChart transactions={items} /> : null}
      <AttachReceiptModal
        open={Boolean(attachTarget)}
        transactionId={attachTarget?.id ?? null}
        onClose={() => setAttachTarget(null)}
      />
    </>
  );

  if (isMobile) {
    return (
      <>
        <List
          dataSource={items}
          renderItem={(transaction) => (
            <List.Item
              key={transaction.id}
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
                  <DescriptionCell transaction={transaction} />
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
                  {showRowActions ? (
                    <TransactionRowActions
                      transaction={transaction}
                      attachmentCount={attachmentCounts[transaction.id] ?? 0}
                      onAttach={setAttachTarget}
                    />
                  ) : null}
                </Space>
              </div>
            </List.Item>
          )}
        />
        {footer}
      </>
    );
  }

  return (
    <>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={items}
        pagination={false}
        scroll={{ x: true }}
        style={{
          background: "#ffffff",
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid #d7ded8",
        }}
      />
      {footer}
    </>
  );
}
