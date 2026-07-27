export interface ParsedInstallmentDescription {
  current: number;
  total: number;
}

const PARCELA_PATTERN =
  /(?:^|[\s(])parcela\s*0*(\d+)\s*de\s*0*(\d+)(?:[\s)]|$)/i;
const GENERIC_PATTERN =
  /(?:^|[\s(])0*(\d+)\s*de\s*0*(\d+)(?:[\s)]|$)/i;

function validateInstallmentNumbers(
  current: number,
  total: number,
): ParsedInstallmentDescription | null {
  if (!Number.isFinite(current) || !Number.isFinite(total)) {
    return null;
  }
  if (current < 1 || total < 1 || current >= total || total > 360) {
    return null;
  }
  return { current, total };
}

export function parseInstallmentFromDescription(
  description: string,
): ParsedInstallmentDescription | null {
  const withParcela = PARCELA_PATTERN.exec(description);
  if (withParcela) {
    return validateInstallmentNumbers(
      Number(withParcela[1]),
      Number(withParcela[2]),
    );
  }

  const generic = GENERIC_PATTERN.exec(description);
  if (generic) {
    return validateInstallmentNumbers(
      Number(generic[1]),
      Number(generic[2]),
    );
  }

  return null;
}

export function remainingInstallmentCount(
  current: number,
  total: number,
): number {
  return total - current + 1;
}

export function formatInstallmentPreview(
  parsed: ParsedInstallmentDescription,
): string {
  const remaining = remainingInstallmentCount(parsed.current, parsed.total);
  return `${parsed.current}/${parsed.total} → ${remaining}x`;
}
