import type { Category, Project } from "./types";

/**
 * Demo dataset. Only Skyhitz is a real project; every number here is invented.
 * Replace this module with calls to the analytics API when one exists.
 */
export const PROJECTS: readonly Project[] = [
  { id: "skyhitz", name: "Skyhitz", category: "DeFi", pageViews: 412000, visitors: 96400, bounceRate: 38, sessionSeconds: 184, botShare: 3.1, apiRequests: 5200000, latencyP95Ms: 240, errorRate: 0.6 },
  { id: "nebula", name: "Nebula DEX", category: "DeFi", pageViews: 688000, visitors: 121000, bounceRate: 44, sessionSeconds: 212, botShare: 6.4, apiRequests: 9100000, latencyP95Ms: 310, errorRate: 1.2 },
  { id: "orbit", name: "Orbit Pay", category: "Payments", pageViews: 254000, visitors: 71800, bounceRate: 51, sessionSeconds: 96, botShare: 2.2, apiRequests: 6800000, latencyP95Ms: 180, errorRate: 0.4 },
  { id: "lend", name: "Lumen Lend", category: "DeFi", pageViews: 143000, visitors: 30200, bounceRate: 47, sessionSeconds: 240, botShare: 4.8, apiRequests: 2400000, latencyP95Ms: 420, errorRate: 2.1 },
  { id: "anchorly", name: "Anchorly", category: "Payments", pageViews: 98000, visitors: 28700, bounceRate: 56, sessionSeconds: 74, botShare: 1.9, apiRequests: 3900000, latencyP95Ms: 205, errorRate: 0.8 },
  { id: "vault", name: "StarVault", category: "Wallets", pageViews: 331000, visitors: 88900, bounceRate: 35, sessionSeconds: 158, botShare: 18.6, apiRequests: 0, latencyP95Ms: 0, errorRate: 0 },
  { id: "quasar", name: "Quasar ID", category: "Tooling", pageViews: 41000, visitors: 12300, bounceRate: 62, sessionSeconds: 58, botShare: 2.7, apiRequests: 720000, latencyP95Ms: 150, errorRate: 0.3 },
  { id: "comet", name: "Comet SDK Docs", category: "Tooling", pageViews: 76000, visitors: 33100, bounceRate: 58, sessionSeconds: 132, botShare: 5.0, apiRequests: 0, latencyP95Ms: 0, errorRate: 0 },
];

export const CATEGORIES: readonly Category[] = ["DeFi", "Payments", "Wallets", "Tooling"];

/** The project the tenant screens show. Comes from the signed-in session once auth exists. */
export const TENANT_PROJECT = PROJECTS[0];
export const TENANT_DOMAIN = "skyhitz.io";

/** Bot share above this is flagged to operators. */
export const BOT_SHARE_FLAG = 15;
/** Error rate above this is highlighted. */
export const ERROR_RATE_FLAG = 1.5;
