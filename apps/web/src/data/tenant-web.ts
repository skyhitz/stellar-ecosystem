import { formatCount, formatDuration } from "@/lib/format";
import { TENANT_PROJECT } from "./projects";
import { perPoint, scaleTotal, scaleVisitors } from "./ranges";
import { demoSeries } from "./series";
import type { Kpi, RangeKey } from "./types";

export interface BreakdownRow {
  name: string;
  value: string;
  /** 0..1, relative to the largest row. Drives the bar behind the row. */
  share: number;
}

export interface Breakdown {
  title: string;
  unit: string;
  rows: BreakdownRow[];
}

export interface WebAnalytics {
  kpis: Kpi[];
  pageViews: number[];
  visitors: number[];
  /** Shared vertical scale for both series. */
  chartMax: number;
  breakdowns: Breakdown[];
}

type Slice = readonly [name: string, amount: number];

/** Share of page views by referrer. */
const REFERRERS: readonly Slice[] = [
  ["Direct / none", 0.41],
  ["stellar.org", 0.17],
  ["x.com", 0.14],
  ["google.com", 0.12],
  ["communityfund.stellar.org", 0.09],
  ["discord.com", 0.07],
];

/** Share of visitors by country. */
const COUNTRIES: readonly Slice[] = [
  ["United States", 0.28],
  ["Mexico", 0.16],
  ["Germany", 0.11],
  ["Nigeria", 0.1],
  ["Brazil", 0.09],
  ["India", 0.08],
];

/** Percent of sessions. */
const DEVICES: readonly Slice[] = [
  ["Mobile", 54],
  ["Desktop", 41],
  ["Tablet", 5],
];

const BROWSERS: readonly Slice[] = [
  ["Chrome", 52],
  ["Safari", 29],
  ["Firefox", 9],
  ["Edge", 6],
  ["Other", 4],
];

function breakdown(
  title: string,
  unit: string,
  slices: readonly Slice[],
  format: (amount: number) => string,
): Breakdown {
  const largest = Math.max(...slices.map(([, amount]) => amount));
  return {
    title,
    unit,
    rows: slices.map(([name, amount]) => ({ name, value: format(amount), share: amount / largest })),
  };
}

const asPercent = (amount: number) => `${amount}%`;

export function getWebAnalytics(range: RangeKey): WebAnalytics {
  const project = TENANT_PROJECT;
  const pageViews = demoSeries(range, 11, perPoint(project.pageViews, range), 0.18);
  const visitors = pageViews.map((views, i) => views * (0.22 + 0.04 * Math.sin(i)));
  const totalViews = scaleTotal(project.pageViews, range);
  const totalVisitors = scaleVisitors(project.visitors, range);

  return {
    kpis: [
      { label: "Page views", value: formatCount(totalViews), change: { percent: 12.4, goodWhenUp: true } },
      { label: "Unique visitors", value: formatCount(totalVisitors), change: { percent: 8.1, goodWhenUp: true } },
      { label: "Session duration", value: formatDuration(project.sessionSeconds), change: { percent: 3.2, goodWhenUp: true } },
      { label: "Bounce rate", value: `${project.bounceRate}%`, change: { percent: -1.8, goodWhenUp: false } },
    ],
    pageViews,
    visitors,
    chartMax: Math.max(...pageViews) * 1.15,
    breakdowns: [
      breakdown("Referrers", "Views", REFERRERS, (share) => formatCount(share * totalViews)),
      breakdown("Countries", "Visitors", COUNTRIES, (share) => formatCount(share * totalVisitors)),
      breakdown("Devices", "%", DEVICES, asPercent),
      breakdown("Browsers", "%", BROWSERS, asPercent),
    ],
  };
}
