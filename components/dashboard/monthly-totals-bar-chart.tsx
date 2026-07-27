"use client";

import { Empty, Typography } from "antd";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/format/currency";
import { formatMonthLabel } from "@/lib/format/month";
import { useChartColors } from "@/lib/theme/use-chart-colors";
import type { MonthlyTotals } from "@/lib/types/api";

const { Title, Text } = Typography;

interface MonthlyTotalsBarChartProps {
  monthlyTotals: MonthlyTotals[];
}

export function MonthlyTotalsBarChart({ monthlyTotals }: MonthlyTotalsBarChartProps) {
  const colors = useChartColors();
  const data = monthlyTotals.map((entry) => ({
    month: formatMonthLabel(entry.month),
    expense: entry.expenseTotal,
    income: entry.incomeTotal,
  }));

  const hasData = monthlyTotals.some(
    (entry) => entry.expenseTotal > 0 || entry.incomeTotal > 0,
  );
  const axisTick = { fill: colors.axis, fontSize: 12 };

  return (
    <div className="dashboard-chart-panel">
      <Title level={4} style={{ marginTop: 0, marginBottom: 4 }}>
        Despesas e receitas por mês
      </Title>
      <Text type="secondary">Totais mensais do ano selecionado.</Text>

      {!hasData ? (
        <Empty
          description="Nenhuma movimentação no ano para exibir no gráfico."
          style={{ marginTop: 24 }}
        />
      ) : (
        <div style={{ width: "100%", height: 320, marginTop: 16 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={axisTick} />
              <YAxis tick={axisTick} tickFormatter={(value) => formatCurrency(Number(value))} width={96} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                }}
                labelStyle={{ color: "var(--color-foreground)" }}
                itemStyle={{ color: "var(--color-foreground)" }}
                formatter={(value, name) => [
                  formatCurrency(typeof value === "number" ? value : Number(value ?? 0)),
                  name === "expense" ? "Despesas" : "Receitas",
                ]}
              />
              <Legend
                formatter={(value) => (value === "expense" ? "Despesas" : "Receitas")}
              />
              <Bar dataKey="expense" fill={colors.expense} radius={[4, 4, 0, 0]} />
              <Bar dataKey="income" fill={colors.income} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
