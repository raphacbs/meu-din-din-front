export function getDefaultAnalyticsYear(availableYears: number[]): number | null {
  if (availableYears.length === 0) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  if (availableYears.includes(currentYear)) {
    return currentYear;
  }

  return Math.max(...availableYears);
}

export function getDefaultRadarMonth(year: number): number {
  const currentYear = new Date().getFullYear();

  if (year === currentYear) {
    return new Date().getMonth() + 1;
  }

  return 12;
}
