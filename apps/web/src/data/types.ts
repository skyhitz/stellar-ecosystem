export type RangeKey = "24H" | "7D" | "30D" | "90D" | "12M";

export type Category = "DeFi" | "Payments" | "Wallets" | "Music" | "Tooling";

/** Semantic colour of a value. Maps to the --ok / --warn / --bad / --acc / --mute tokens. */
export type Tone = "ok" | "warn" | "bad" | "accent" | "mute";

/** An enrolled project with its headline metrics for a 30-day window. */
export interface Project {
  id: string;
  name: string;
  category: Category;
  pageViews: number;
  visitors: number;
  /** Percent. */
  bounceRate: number;
  /** Average session length in seconds. */
  sessionSeconds: number;
  /** Percent of events rejected as bot traffic. */
  botShare: number;
  /** 0 means the project has not instrumented its API. */
  apiRequests: number;
  latencyP95Ms: number;
  /** Percent. */
  errorRate: number;
}

export interface Kpi {
  label: string;
  value: string;
  /** Change against the previous period, in percent. */
  change?: { percent: number; goodWhenUp: boolean };
}
