import Link from "next/link";
import { Button, Card, Result, Spin, Statistic, Typography } from "antd";

import { formatCurrency } from "@/lib/format/currency";
import { formatRelativeTime } from "@/lib/format/date";
import type { ProjectionResponse } from "@/lib/types/api";

const { Text, Title } = Typography;

interface ProjectionPanelProps {
  projection?: ProjectionResponse;
  isLoading: boolean;
  isRecalculating: boolean;
  errorMessage?: string;
  onRecalculate: () => void;
  onRetry: () => void;
}

export function ProjectionPanel({
  projection,
  isLoading,
  isRecalculating,
  errorMessage,
  onRecalculate,
  onRetry,
}: ProjectionPanelProps) {
  if (isLoading) {
    return <Spin tip="Carregando projeção..." />;
  }

  if (errorMessage) {
    return (
      <Result
        status="error"
        title="Projeção indisponível"
        subTitle={errorMessage}
        extra={<Button onClick={onRetry}>Tentar novamente</Button>}
      />
    );
  }

  if (!projection) {
    return null;
  }

  return (
    <Card>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16 }}>
        <div>
          <Title level={4} style={{ marginBottom: 8 }}>
            Saldo projetado
          </Title>
          <Statistic
            value={formatCurrency(projection.projectedBalance)}
            valueStyle={{ fontSize: 36, fontFamily: "var(--font-display)" }}
          />
          <Text type="secondary">recalculado {formatRelativeTime(projection.generatedAt)}</Text>
        </div>
        <Button onClick={onRecalculate} loading={isRecalculating}>
          Recalcular projeção
        </Button>
      </div>
    </Card>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  description: string;
  tone?: "default" | "success" | "warning" | "danger";
}

const TONE_COLORS: Record<NonNullable<SummaryCardProps["tone"]>, string | undefined> = {
  default: undefined,
  success: "var(--color-cash-green)",
  warning: "var(--color-warning)",
  danger: "var(--color-expense)",
};

export function SummaryCard({ title, value, description, tone = "default" }: SummaryCardProps) {
  return (
    <Card>
      <Statistic
        title={title}
        value={value}
        valueStyle={{ color: TONE_COLORS[tone] }}
      />
      <Text type="secondary" style={{ fontSize: 12 }}>
        {description}
      </Text>
    </Card>
  );
}

interface TransactionPreviewListProps {
  title: string;
  emptyLabel: string;
  transactions: Array<{
    id: string;
    description: string;
    amountLabel: string;
    metaLabel: string;
  }>;
}

export function TransactionPreviewList({
  title,
  emptyLabel,
  transactions,
}: TransactionPreviewListProps) {
  return (
    <Card title={title}>
      {transactions.length === 0 ? (
        <Text type="secondary">{emptyLabel}</Text>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {transactions.map((transaction) => (
            <li key={transaction.id} style={{ marginBottom: 8 }}>
              <Link href="/meu-mes">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "8px 0",
                  }}
                >
                  <Text>{transaction.description}</Text>
                  <div style={{ textAlign: "right" }}>
                    <Text className="tabular-nums" style={{ display: "block" }}>
                      {transaction.amountLabel}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {transaction.metaLabel}
                    </Text>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
