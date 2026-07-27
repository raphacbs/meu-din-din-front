const MONTH_LABELS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const;

export function formatMonthLabel(month: number): string {
  return MONTH_LABELS[month - 1] ?? String(month);
}

export function getMonthSelectOptions(): { label: string; value: number }[] {
  return MONTH_LABELS.map((label, index) => ({
    label,
    value: index + 1,
  }));
}
