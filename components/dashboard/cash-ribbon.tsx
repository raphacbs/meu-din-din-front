import { Card, Space, Tag, Typography } from "antd";

import type { DashboardSummary } from "@/lib/dashboard/summary";

const { Text } = Typography;

interface CashRibbonProps {
  summary: DashboardSummary;
}

const SEGMENTS = [
  { key: "revenue", label: "Receita", color: "var(--color-cash-green)" },
  { key: "expense", label: "Despesa", color: "var(--color-expense)" },
  { key: "dueToday", label: "Vence hoje", color: "var(--color-warning)" },
  { key: "paid", label: "Pago", color: "var(--color-border)" },
] as const;

const TICK_COLORS = {
  upcoming: "green",
  paid: "default",
  dueToday: "gold",
} as const;

export function CashRibbon({ summary }: CashRibbonProps) {
  const counts = {
    revenue: summary.revenueTotal > 0 ? 1 : 0,
    expense: summary.expenseTotal > 0 ? 1 : 0,
    dueToday: summary.dueToday.length,
    paid: summary.paid.length,
  };

  const ticks = [
    ...summary.upcoming.slice(0, 4).map((transaction) => ({
      id: transaction.id,
      label: transaction.description,
      kind: "upcoming" as const,
    })),
    ...summary.paid.slice(0, 3).map((transaction) => ({
      id: transaction.id,
      label: transaction.description,
      kind: "paid" as const,
    })),
    ...summary.dueToday.slice(0, 2).map((transaction) => ({
      id: transaction.id,
      label: transaction.description,
      kind: "dueToday" as const,
    })),
  ];

  return (
    <Card aria-label="Faixa de caixa">
      <Space wrap size={16}>
        {SEGMENTS.map((segment) => (
          <Space key={segment.key} size={8}>
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 40,
                height: 6,
                borderRadius: 999,
                background: segment.color,
              }}
            />
            <Text type="secondary">
              {segment.label}
              {counts[segment.key] > 0 ? ` (${counts[segment.key]})` : ""}
            </Text>
          </Space>
        ))}
      </Space>

      {ticks.length > 0 ? (
        <Space wrap aria-label="Marcações do caderno" style={{ marginTop: 16 }}>
          {ticks.map((tick) => (
            <Tag key={tick.id} color={TICK_COLORS[tick.kind]}>
              {tick.label}
            </Tag>
          ))}
        </Space>
      ) : (
        <Text type="secondary" style={{ display: "block", marginTop: 16 }}>
          Nenhuma movimentação recente para marcar na faixa.
        </Text>
      )}
    </Card>
  );
}
