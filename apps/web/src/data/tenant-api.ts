import { formatCount } from "@/lib/format";
import { ERROR_RATE_FLAG, TENANT_PROJECT } from "./projects";
import { perPoint, scaleTotal } from "./ranges";
import { demoSeries } from "./series";
import type { Kpi, RangeKey, Tone } from "./types";

export interface StatusClass {
  label: string;
  /** Percent of all responses. */
  percent: number;
  tone: Tone;
}

export interface RouteStats {
  method: string;
  /** Path after normalization, with identifiers replaced by placeholders. */
  route: string;
  requests: string;
  errorRate: string;
  errorsFlagged: boolean;
  p50: string;
  p95: string;
}

export interface ApiAnalytics {
  kpis: Kpi[];
  requests: number[];
  latencyP50: number[];
  latencyP95: number[];
  /** Shared vertical scale for both latency series. */
  latencyMax: number;
  statusClasses: StatusClass[];
  routes: RouteStats[];
}

const LATENCY_P50_MS = 82;

const STATUS_CLASSES: StatusClass[] = [
  { label: "2xx", percent: 96.1, tone: "ok" },
  { label: "3xx", percent: 1.4, tone: "accent" },
  { label: "4xx", percent: 1.9, tone: "warn" },
  { label: "5xx", percent: 0.6, tone: "bad" },
];

/** method, normalized route, share of requests, error rate %, p50 ms, p95 ms */
const ROUTES: ReadonlyArray<readonly [string, string, number, number, number, number]> = [
  ["GET", "/v1/tracks", 0.31, 0.2, 64, 170],
  ["GET", "/v1/accounts/{g_address}", 0.22, 0.4, 88, 230],
  ["POST", "/v1/tx/submit", 0.15, 1.9, 210, 610],
  ["GET", "/v1/tx/{hash}", 0.13, 0.5, 71, 190],
  ["GET", "/v1/contracts/{c_address}/state", 0.11, 0.7, 120, 340],
  ["GET", "/v1/offers/{uuid}", 0.08, 0.3, 77, 205],
];

export function getApiAnalytics(range: RangeKey): ApiAnalytics {
  const project = TENANT_PROJECT;
  const requests = demoSeries(range, 23, perPoint(project.apiRequests, range), 0.14);
  const latencyP50 = demoSeries(range, 31, LATENCY_P50_MS, 0.1, 0.05);
  const latencyP95 = demoSeries(range, 37, project.latencyP95Ms, 0.16, 0.1);
  const totalRequests = scaleTotal(project.apiRequests, range);

  return {
    kpis: [
      { label: "Requests", value: formatCount(totalRequests), change: { percent: 9.7, goodWhenUp: true } },
      { label: "Error rate", value: `${project.errorRate}%`, change: { percent: -0.2, goodWhenUp: false } },
      { label: "Latency p50", value: `${LATENCY_P50_MS} ms`, change: { percent: -4.1, goodWhenUp: false } },
      { label: "Latency p95", value: `${project.latencyP95Ms} ms`, change: { percent: 2.6, goodWhenUp: false } },
    ],
    requests,
    latencyP50,
    latencyP95,
    latencyMax: Math.max(...latencyP95) * 1.2,
    statusClasses: STATUS_CLASSES,
    routes: ROUTES.map(([method, route, share, errorRate, p50, p95]) => ({
      method,
      route,
      requests: formatCount(totalRequests * share),
      errorRate: `${errorRate}%`,
      errorsFlagged: errorRate > ERROR_RATE_FLAG,
      p50: `${p50} ms`,
      p95: `${p95} ms`,
    })),
  };
}
