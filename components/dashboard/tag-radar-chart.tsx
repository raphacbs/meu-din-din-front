"use client";

import { useEffect, useMemo, useState } from "react";
import { Empty, Select, Space, Typography } from "antd";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { getDefaultRadarMonth } from "@/lib/dashboard/analytics-defaults";
import { formatCurrency } from "@/lib/format/currency";
import { getMonthSelectOptions } from "@/lib/format/month";
import { useChartColors } from "@/lib/theme/use-chart-colors";
import type { TagRadar } from "@/lib/types/api";

const { Title, Text } = Typography;
const TOP_TAG_LIMIT = 8;

interface TagRadarChartProps {
  year: number;
  tagRadar: TagRadar;
}

export function TagRadarChart({ year, tagRadar }: TagRadarChartProps) {
  const colors = useChartColors();
  const [selectedMonth, setSelectedMonth] = useState(() => getDefaultRadarMonth(year));

  useEffect(() => {
    setSelectedMonth(getDefaultRadarMonth(year));
  }, [year]);

  const topTags = useMemo(
    () => tagRadar.yearTotals.slice(0, TOP_TAG_LIMIT).map((entry) => entry.tag),
    [tagRadar.yearTotals],
  );

  const radarData = useMemo(() => {
    const monthlyEntry = tagRadar.monthly.find((entry) => entry.month === selectedMonth);

    return topTags.map((tag) => ({
      tag,
      year:
        tagRadar.yearTotals.find((entry) => entry.tag === tag)?.amount ?? 0,
      month: monthlyEntry?.tags.find((entry) => entry.tag === tag)?.amount ?? 0,
    }));
  }, [selectedMonth, tagRadar.monthly, tagRadar.yearTotals, topTags]);

  const hasData = radarData.some((entry) => entry.year > 0 || entry.month > 0);
  const axisTick = { fill: colors.axis, fontSize: 12 };

  return (
    <div className="dashboard-chart-panel">
      <Space
        align="start"
        style={{ width: "100%", justifyContent: "space-between", marginBottom: 8 }}
        wrap
      >
        <div>
          <Title level={4} style={{ marginTop: 0, marginBottom: 4 }}>
            Composição por tags
          </Title>
          <Text type="secondary">
            Top {TOP_TAG_LIMIT} tags por despesa — total anual e mês selecionado.
          </Text>
        </div>
        <Select
          aria-label="Mês do radar"
          value={selectedMonth}
          onChange={setSelectedMonth}
          options={getMonthSelectOptions()}
          style={{ minWidth: 100 }}
        />
      </Space>

      {!hasData ? (
        <Empty
          description="Nenhuma despesa com tag no ano para exibir no radar."
          style={{ marginTop: 24 }}
        />
      ) : (
        <div style={{ width: "100%", height: 320, marginTop: 8 }}>
          <ResponsiveContainer>
            <RadarChart data={radarData}>
              <PolarGrid stroke={colors.grid} />
              <PolarAngleAxis dataKey="tag" tick={axisTick} />
              <PolarRadiusAxis tick={axisTick} tickFormatter={(value) => formatCurrency(Number(value))} />
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
                  name === "year" ? "Total anual" : "Mês selecionado",
                ]}
              />
              <Radar
                name="year"
                dataKey="year"
                stroke={colors.income}
                fill={colors.income}
                fillOpacity={0.25}
              />
              <Radar
                name="month"
                dataKey="month"
                stroke={colors.accent}
                fill={colors.accent}
                fillOpacity={0.25}
              />
              <Legend
                formatter={(value) => (value === "year" ? "Total anual" : "Mês selecionado")}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
