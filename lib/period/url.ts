import { isValidIsoDate, type DateRange } from "@/lib/period/date-range";

type SearchParamsLike = {
  get: (key: string) => string | null;
};

export function parsePeriodSearchParams(searchParams: SearchParamsLike): DateRange | null {
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!isValidIsoDate(from) || !isValidIsoDate(to)) {
    return null;
  }

  return { from, to };
}

export function buildPeriodQueryString(from: string, to: string): string {
  const params = new URLSearchParams();
  params.set("from", from);
  params.set("to", to);
  return params.toString();
}

export function replacePeriodInUrl(
  router: { replace: (href: string) => void },
  pathname: string,
  from: string,
  to: string,
): void {
  router.replace(`${pathname}?${buildPeriodQueryString(from, to)}`);
}
