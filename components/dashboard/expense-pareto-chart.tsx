"use client";

import { Empty, Typography } from "antd";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/format/currency";
import { useChartColors } from "@/lib/theme/use-chart-colors";
import type { ExpenseParetoItem } from "@/lib/types/api";

const { Title, Text } = Typography;

interface ExpenseParetoChartProps {
  expensePareto: ExpenseParetoItem[];
}

export function ExpenseParetoChart({ expensePareto }: ExpenseParetoChartProps) {
  const colors = useChartColors();
  const isApplicable = expensePareto.length >= 2;
  const axisTick = { fill: colors.axis, fontSize: 12 };

  return (
    <div className="dashboard-chart-panel">
      <Title level={4} style={{ marginTop: 0, marginBottom: 4 }}>
        Pareto de despesas por tag
      </Title>
      <Text type="secondary">
        Concentração de gastos tagueados e percentual acumulado.
      </Text>

      {!isApplicable ? (
        <Empty
          description="Pareto indisponível: são necessárias pelo menos duas tags com despesas."
          style={{ marginTop: 24 }}
        />
      ) : (
        <div style={{ width: "100%", height: 320, marginTop: 16 }}>
          <ResponsiveContainer>
            <ComposedChart data={expensePareto}>
              <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" />
              <XAxis dataKey="tag" tick={axisTick} />
              <YAxis
                yAxisId="amount"
                tick={axisTick}
                tickFormatter={(value) => formatCurrency(Number(value))}
                width={96}
              />
              <YAxis
                yAxisId="percent"
                orientation="right"
                domain={[0, 100]}
                tick={axisTick}
                tickFormatter={(value) => `${value}%`}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                }}
                labelStyle={{ color: "var(--color-foreground)" }}
                itemStyle={{ color: "var(--color-foreground)" }}
                formatter={(value, name) => {
                  const numericValue = typeof value === "number" ? value : Number(value ?? 0);

                  if (name === "amount") {
                    return [formatCurrency(numericValue), "Despesa"];
                  }

                  return [`${numericValue.toFixed(1)}%`, "% acumulado"];
                }}
              />
              <Legend
                formatter={(value) =>
                  value === "amount" ? "Despesa por tag" : "% acumulado"
                }
              />
              <Bar
                yAxisId="amount"
                dataKey="amount"
                fill={colors.expense}
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="percent"
                type="monotone"
                dataKey="cumulativePercent"
                stroke={colors.accent}
                strokeWidth={2}
                dot={{ r: 3, fill: colors.accent }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
