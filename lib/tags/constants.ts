export const DEFAULT_TAG_COLOR = "#64748B";

export const TAG_COLOR_PRESETS = [
  "#64748B",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#14B8A6",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
] as const;

export function normalizeTagColor(color: string): string {
  return color.trim().toUpperCase();
}

export function normalizeTagName(name: string): string {
  return name.trim().toUpperCase();
}

export function normalizeTagNames(tags: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const tag of tags) {
    const value = normalizeTagName(tag);
    if (value && !seen.has(value)) {
      seen.add(value);
      normalized.push(value);
    }
  }

  return normalized;
}
