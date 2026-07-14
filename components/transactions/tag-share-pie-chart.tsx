"use client";

import { useState } from "react";
import { Empty, Segmented, Space, Typography } from "antd";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { formatCurrency } from "@/lib/format/currency";
import {
  calculateDistributionShares,
  type DistributionDimension,
} from "@/lib/transactions/totals";
import type { TransactionResponse } from "@/lib/types/api";

const { Title, Text } = Typography;

const CHART_COLORS = [
  "#2f7d4c",
  "#1d6fbf",
  "#c77a19",
  "#b84232",
  "#6b4ce6",
  "#0f9d8a",
  "#d9486f",
  "#3f8cff",
];

const DIMENSION_OPTIONS: { label: string; value: DistributionDimension }[] = [
  { label: "Tags", value: "tag" },
  { label: "Status", value: "status" },
  { label: "Tipo", value: "type" },
];

const DIMENSION_COPY: Record<
  DistributionDimension,
  { title: string; description: string; empty: string }
> = {
  tag: {
    title: "Distribuição por tags",
    description: "Percentual do valor do período por tag (canceladas excluídas).",
    empty: "Nenhuma tag no período para montar o gráfico.",
  },
  status: {
    title: "Distribuição por status",
    description: "Percentual do valor do período por status.",
    empty: "Nenhum status no período para montar o gráfico.",
  },
  type: {
    title: "Distribuição por tipo",
    description: "Percentual do valor do período por tipo (canceladas excluídas).",
    empty: "Nenhum tipo no período para montar o gráfico.",
  },
};

interface TagSharePieChartProps {
  transactions: TransactionResponse[];
}

export function TagSharePieChart({ transactions }: TagSharePieChartProps) {
  const [dimension, setDimension] = useState<DistributionDimension>("tag");
  const copy = DIMENSION_COPY[dimension];
  const shares = calculateDistributionShares(transactions, dimension);

  const data = shares.map((share) => ({
    name: share.label,
    value: share.amount,
    percent: share.percent,
  }));

  return (
    <div
      style={{
        marginTop: 24,
        padding: 24,
        borderRadius: 16,
        background: "linear-gradient(135deg, #f3faf5 0%, #e8f3ff 100%)",
        border: "1px solid #d7ded8",
      }}
    >
      <Space
        align="start"
        style={{ width: "100%", justifyContent: "space-between", marginBottom: 8 }}
        wrap
      >
        <div>
          <Title level={4} style={{ marginTop: 0, marginBottom: 4 }}>
            {copy.title}
          </Title>
          <Text type="secondary">{copy.description}</Text>
        </div>
        <Segmented
          options={DIMENSION_OPTIONS}
          value={dimension}
          onChange={(value) => setDimension(value as DistributionDimension)}
          aria-label="Dimensão do gráfico"
        />
      </Space>

      {!shares.length ? (
        <Empty description={copy.empty} style={{ marginTop: 24 }} />
      ) : (
        <div style={{ width: "100%", height: 320, marginTop: 8 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={110}
                paddingAngle={2}
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, item) => {
                  const amount = typeof value === "number" ? value : Number(value ?? 0);
                  const percent = item?.payload?.percent as number | undefined;
                  return [
                    `${formatCurrency(amount)}${percent != null ? ` (${percent.toFixed(1)}%)` : ""}`,
                    String(name),
                  ];
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
