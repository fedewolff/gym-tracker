export function normalizeDecimal(raw: string): string {
  return raw.replace(",", ".");
}

export function extractWeightNumber(weightText: string): number | undefined {
  const normalized = normalizeDecimal(weightText);
  const match = normalized.match(/-?\d+(?:\.\d+)?/);
  if (!match) return undefined;
  const value = Number.parseFloat(match[0]);
  return Number.isFinite(value) ? value : undefined;
}

export function formatWeight(value: number | undefined): string {
  if (value === undefined) return "";
  return Number.isInteger(value) ? `${value}` : `${value.toFixed(1).replace(/\.0$/, "")}`;
}
