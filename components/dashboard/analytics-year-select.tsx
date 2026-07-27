"use client";

import { Select } from "antd";

interface AnalyticsYearSelectProps {
  availableYears: number[];
  value: number | null;
  onChange: (year: number) => void;
}

export function AnalyticsYearSelect({
  availableYears,
  value,
  onChange,
}: AnalyticsYearSelectProps) {
  return (
    <Select
      aria-label="Ano de análise"
      data-testid="analytics-year-select"
      placeholder="Selecione o ano"
      value={value ?? undefined}
      onChange={onChange}
      options={availableYears.map((year) => ({
        label: String(year),
        value: year,
      }))}
      style={{ minWidth: 120 }}
      disabled={availableYears.length === 0}
    />
  );
}
