import { formatCount, formatDuration } from "@/lib/format";
import { BOT_SHARE_FLAG, ERROR_RATE_FLAG } from "./projects";
import { perPoint, scaleTotal, scaleVisitors } from "./ranges";
import { demoSeries } from "./series";
import type { Category, Project, RangeKey } from "./types";

export type SortKey =
  | "name"
  | "pageViews"
  | "visitors"
  | "bounceRate"
  | "sessionSeconds"
  | "botShare"
  | "apiRequests"
  | "latencyP95Ms"
  | "errorRate";

export type SortDirection = 1 | -1;
export type CategoryFilter = "All" | Category;

/** Columns of the operator table, in display order. */
export const COLUMNS: ReadonlyArray<{ key: SortKey; label: string }> = [
  { key: "name", label: "Project" },
  { key: "pageViews", label: "Views" },
  { key: "visitors", label: "Visitors" },
  { key: "bounceRate", label: "Bounce" },
  { key: "sessionSeconds", label: "Session" },
  { key: "botShare", label: "Bot %" },
  { key: "apiRequests", label: "API req" },
  { key: "latencyP95Ms", label: "p95" },
  { key: "errorRate", label: "Errors" },
];

/** At most this many projects can be compared side by side. */
export const MAX_COMPARED = 3;

export interface TableQuery {
  query: string;
  category: CategoryFilter;
  sortKey: SortKey;
  sortDir: SortDirection;
}

export interface EcosystemTotals {
  projects: number;
  pageViews: number;
  visitors: number;
  apiRequests: number;
}

export interface ProjectRow {
  id: string;
  name: string;
  category: Category;
  pageViews: string;
  visitors: string;
  bounceRate: string;
  session: string;
  botShare: string;
  botFlagged: boolean;
  apiRequests: string;
  latencyP95: string;
  errorRate: string;
  errorsFlagged: boolean;
}

export interface ComparisonMetric {
  label: string;
  cells: Array<{ id: string; name: string; value: string; /** 0..1 of the largest value. */ share: number }>;
}

export interface Comparison {
  /** One page-view series per project, in the order given. */
  series: number[][];
  chartMax: number;
  metrics: ComparisonMetric[];
}

const NOT_INSTRUMENTED = "not instrumented";

/** Projects that have not been removed by an operator. */
export function liveProjects(projects: readonly Project[], removedIds: readonly string[]): Project[] {
  return projects.filter((project) => !removedIds.includes(project.id));
}

/** 30-day totals across the given projects. */
export function ecosystemTotals(projects: readonly Project[]): EcosystemTotals {
  const sum = (pick: (project: Project) => number) =>
    projects.reduce((total, project) => total + pick(project), 0);
  return {
    projects: projects.length,
    pageViews: sum((p) => p.pageViews),
    visitors: sum((p) => p.visitors),
    apiRequests: sum((p) => p.apiRequests),
  };
}

function compareBy(a: Project, b: Project, key: SortKey): number {
  const x = a[key];
  const y = b[key];
  return typeof x === "string" ? x.localeCompare(y as string, "en") : x - (y as number);
}

/** Applies the table's search, category filter and sort. */
export function selectProjects(projects: readonly Project[], q: TableQuery): Project[] {
  const needle = q.query.toLowerCase();
  return projects
    .filter(
      (project) =>
        (q.category === "All" || project.category === q.category) &&
        project.name.toLowerCase().includes(needle),
    )
    .sort((a, b) => compareBy(a, b, q.sortKey) * q.sortDir);
}

export function toProjectRow(project: Project, range: RangeKey): ProjectRow {
  const instrumented = project.apiRequests > 0;
  return {
    id: project.id,
    name: project.name,
    category: project.category,
    pageViews: formatCount(scaleTotal(project.pageViews, range)),
    visitors: formatCount(scaleVisitors(project.visitors, range)),
    bounceRate: `${project.bounceRate}%`,
    session: formatDuration(project.sessionSeconds),
    botShare: `${project.botShare}%`,
    botFlagged: project.botShare > BOT_SHARE_FLAG,
    apiRequests: instrumented ? formatCount(scaleTotal(project.apiRequests, range)) : "—",
    latencyP95: instrumented ? `${project.latencyP95Ms} ms` : "—",
    errorRate: instrumented ? `${project.errorRate}%` : "—",
    errorsFlagged: project.errorRate > ERROR_RATE_FLAG,
  };
}

/** Side-by-side figures for the given projects (usually up to three). */
export function compareProjects(projects: readonly Project[], range: RangeKey): Comparison {
  const series = projects.map((project, i) =>
    demoSeries(range, project.name.length * 13 + i, perPoint(project.pageViews, range), 0.15),
  );

  const metric = (
    label: string,
    measure: (project: Project) => number,
    format: (value: number) => string,
  ): ComparisonMetric => {
    const largest = Math.max(1e-9, ...projects.map(measure));
    return {
      label,
      cells: projects.map((project) => ({
        id: project.id,
        name: project.name,
        value: format(measure(project)),
        share: measure(project) / largest,
      })),
    };
  };

  return {
    series,
    chartMax: Math.max(1, ...series.flat()) * 1.12,
    metrics: [
      metric("Page views", (p) => scaleTotal(p.pageViews, range), formatCount),
      metric("Unique visitors", (p) => scaleVisitors(p.visitors, range), formatCount),
      metric("Bounce rate", (p) => p.bounceRate, (v) => `${v}%`),
      metric("Session duration", (p) => p.sessionSeconds, formatDuration),
      metric("API requests", (p) => scaleTotal(p.apiRequests, range), (v) => (v ? formatCount(v) : NOT_INSTRUMENTED)),
      metric("Latency p95", (p) => p.latencyP95Ms, (v) => (v ? `${v} ms` : NOT_INSTRUMENTED)),
    ],
  };
}
