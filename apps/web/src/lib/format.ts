/** Compact count: 1,234 → 12.3K → 1.23M → 1.23B. */
export function formatCount(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e4) return (n / 1e3).toFixed(1) + "K";
  return Math.round(n).toLocaleString("en-US");
}

/** Seconds as "3m 04s". */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = String(Math.round(seconds % 60)).padStart(2, "0");
  return `${minutes}m ${rest}s`;
}

/**
 * A 0..1 fraction as a CSS percentage. Rounded so the string is short and
 * identical on server and client regardless of floating-point noise.
 */
export function toPercent(fraction: number): string {
  return `${Number((fraction * 100).toFixed(4))}%`;
}

/** Joins class names, skipping falsy entries. */
export function cx(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(" ");
}

/** A period-over-period change as "▲ 12.4% vs previous". */
export function formatChange(percent: number): string {
  return `${percent >= 0 ? "▲" : "▼"} ${Math.abs(percent).toFixed(1)}% vs previous`;
}
