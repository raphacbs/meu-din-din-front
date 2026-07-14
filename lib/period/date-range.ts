import dayjs from "dayjs";

export type PeriodMode = "month" | "custom";

export interface DateRange {
  from: string;
  to: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidIsoDate(value: string | null | undefined): value is string {
  if (!value || !ISO_DATE.test(value)) {
    return false;
  }

  const parsed = dayjs(value);
  return parsed.isValid() && parsed.format("YYYY-MM-DD") === value;
}

export function monthRange(year: number, month: number): DateRange {
  const date = dayjs()
    .year(year)
    .month(month - 1)
    .date(1);

  return {
    from: date.startOf("month").format("YYYY-MM-DD"),
    to: date.endOf("month").format("YYYY-MM-DD"),
  };
}

export function currentMonthParts(): { year: number; month: number } {
  const now = dayjs();
  return {
    year: now.year(),
    month: now.month() + 1,
  };
}

export function currentMonthRange(): DateRange {
  const { year, month } = currentMonthParts();
  return monthRange(year, month);
}

export function inferPeriodMode(from: string, to: string): PeriodMode {
  if (!isValidIsoDate(from) || !isValidIsoDate(to)) {
    return "custom";
  }

  const fromDate = dayjs(from);
  const expected = monthRange(fromDate.year(), fromDate.month() + 1);

  if (from === expected.from && to === expected.to) {
    return "month";
  }

  return "custom";
}

export function validateCustomRange(
  from: string | null | undefined,
  to: string | null | undefined,
): string | null {
  if (!from || !to) {
    return "Selecione a data início e a data fim para filtrar o extrato.";
  }

  if (!isValidIsoDate(from) || !isValidIsoDate(to)) {
    return "Datas inválidas. Use o formato de data válido.";
  }

  if (from > to) {
    return "A data início não pode ser posterior à data fim.";
  }

  return null;
}
