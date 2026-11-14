import { mulberry32 } from "@/lib/prng";
import { pointCount } from "./ranges";
import type { RangeKey } from "./types";

/**
 * A plausible-looking demo time series: a level with a linear trend, seeded
 * noise and a gentle wave. Deterministic for a given range and seed.
 */
export function demoSeries(
  range: RangeKey,
  seed: number,
  level: number,
  volatility: number,
  trend = 0.25,
): number[] {
  const n = pointCount(range);
  const random = mulberry32(seed + n * 7);
  const values: number[] = [];
  for (let i = 0; i < n; i++) {
    values.push(
      level *
        (1 + trend * (i / n - 0.5)) *
        (1 + volatility * (random() - 0.5) * 2) *
        (1 + 0.12 * Math.sin(i * 0.9 + seed)),
    );
  }
  return values;
}
