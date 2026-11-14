import type { RangeKey } from "./types";

export const RANGES: readonly RangeKey[] = ["24H", "7D", "30D", "90D", "12M"];
export const DEFAULT_RANGE: RangeKey = "30D";

/** Window length relative to the 30-day window the demo dataset is expressed in. */
const WINDOW_SCALE: Record<RangeKey, number> = {
  "24H": 1 / 30,
  "7D": 7 / 30,
  "30D": 1,
  "90D": 3,
  "12M": 12,
};

/** Number of points plotted for each range. */
const POINTS: Record<RangeKey, number> = { "24H": 24, "7D": 7, "30D": 30, "90D": 45, "12M": 12 };

/** Axis labels for the demo window, which ends on 2026-11-13. */
const AXIS_LABELS: Record<RangeKey, readonly string[]> = {
  "24H": ["00:00", "06:00", "12:00", "18:00", "now"],
  "7D": ["Sat", "Mon", "Wed", "Fri"],
  "30D": ["Oct 14", "Oct 22", "Oct 30", "Nov 6", "Nov 13"],
  "90D": ["Aug 15", "Sep 14", "Oct 14", "Nov 13"],
  "12M": ["Dec", "Mar", "Jun", "Sep", "Nov"],
};

export function pointCount(range: RangeKey): number {
  return POINTS[range];
}

export function axisLabels(range: RangeKey): readonly string[] {
  return AXIS_LABELS[range];
}

/** Additive metrics (views, requests) scale linearly with the window. */
export function scaleTotal(per30Days: number, range: RangeKey): number {
  return per30Days * WINDOW_SCALE[range];
}

/** Unique visitors grow more slowly than the window: the same people come back. */
export function scaleVisitors(per30Days: number, range: RangeKey): number {
  return per30Days * Math.pow(WINDOW_SCALE[range], 0.92);
}

/** Average value of one plotted point, given a 30-day total. */
export function perPoint(per30Days: number, range: RangeKey): number {
  return (per30Days / 30) * ((30 * WINDOW_SCALE[range]) / POINTS[range]);
}
