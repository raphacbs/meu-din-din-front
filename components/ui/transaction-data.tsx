import { Space, Tag, Typography } from "antd";
import type { CSSProperties } from "react";

import { formatSignedCurrency } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";
import {
  formatTransactionStatus,
  getTransactionStatusColor,
} from "@/lib/format/status";
import type { TransactionResponse, TransactionType } from "@/lib/types/api";

const { Text } = Typography;

interface CurrencyCellProps {
  amount: number;
  type: TransactionType;
  style?: CSSProperties;
}

export function CurrencyCell({ amount, type, style }: CurrencyCellProps) {
  return (
    <Text
      className="tabular-nums"
      style={{
        fontSize: 14,
        fontWeight: 700,
        color: type === "DESPESA" ? "var(--color-debt-red)" : "var(--color-cash-green)",
        ...style,
      }}
    >
      {formatSignedCurrency(amount, type)}
    </Text>
  );
}

interface TransactionStatusBadgeProps {
  status: TransactionResponse["status"];
}

export function TransactionStatusBadge({ status }: TransactionStatusBadgeProps) {
  return (
    <Tag color={getTransactionStatusColor(status)}>{formatTransactionStatus(status)}</Tag>
  );
}

interface TransactionTagListProps {
  tags?: string[];
}

const TAG_COLORS = [
  "green",
  "blue",
  "orange",
  "magenta",
  "cyan",
  "purple",
  "geekblue",
  "volcano",
] as const;

function tagColor(tag: string): (typeof TAG_COLORS)[number] {
  let hash = 0;
  for (let index = 0; index < tag.length; index += 1) {
    hash = (hash + tag.charCodeAt(index) * (index + 1)) % TAG_COLORS.length;
  }
  return TAG_COLORS[hash];
}

export function TransactionTagList({ tags }: TransactionTagListProps) {
  if (!tags?.length) {
    return <Text type="secondary">—</Text>;
  }

  return (
    <Space size={4} wrap>
      {tags.map((tag) => (
        <Tag key={tag} color={tagColor(tag)}>
          {tag}
        </Tag>
      ))}
    </Space>
  );
}

interface TransactionMetadataProps {
  type: TransactionType;
  transactionDate: string;
  dueDate?: string | null;
}

export function TransactionMetadata({ type, transactionDate, dueDate }: TransactionMetadataProps) {
  return (
    <Space size={8} wrap style={{ fontSize: 12 }}>
      <Text type="secondary">{type === "RECEITA" ? "Receita" : "Despesa"}</Text>
      <Text type="secondary" aria-hidden>
        •
      </Text>
      <Text type="secondary">{formatDate(transactionDate)}</Text>
      {dueDate ? (
        <>
          <Text type="secondary" aria-hidden>
            •
          </Text>
          <Text type="secondary">Vence {formatDate(dueDate)}</Text>
        </>
      ) : null}
    </Space>
  );
}
