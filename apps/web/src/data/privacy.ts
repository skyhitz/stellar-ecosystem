/**
 * Privacy copy shown to tenants.
 *
 * The compliance statement and the session-hash wording are drafts: data
 * residency, opt-in jurisdictions and salt rotation still need real decisions.
 */
export const STORED: readonly string[] = [
  "Page path and referrer domain",
  "Country, derived from an IP with the last octet dropped",
  "Device class and browser family",
  "A session hash salted with a key that rotates every 24 hours",
  "Custom events you choose to send",
];

export const NEVER_STORED: readonly string[] = [
  "Cookies or local storage identifiers",
  "Full IP addresses",
  "Cross-site or cross-day visitor identifiers",
  "OpenTelemetry traces, spans or logs",
];

export const COMPLIANCE: ReadonlyArray<{ label: string; value: string }> = [
  { label: "Data residency", value: "EU (Frankfurt)" },
  { label: "No opt-in needed", value: "EU/EEA, UK" },
  { label: "Opt-in required", value: "To be declared" },
  { label: "Aggregate retention", value: "24 months+" },
];

export type ErasureScope = "Custom event property" | "Date range" | "All data for this site";

export interface ErasureRequest {
  id: string;
  scope: ErasureScope;
  target: string;
  status: "Queued" | "Completed";
}

/** Erasure scopes with the example shown in the empty target field. */
export const ERASURE_SCOPES: ReadonlyArray<{ scope: ErasureScope; placeholder: string }> = [
  { scope: "Custom event property", placeholder: "event: signup, property: email" },
  { scope: "Date range", placeholder: "2026-11-01 to 2026-11-05" },
  { scope: "All data for this site", placeholder: "skyhitz.io" },
];

/** Erasing everything needs no target; every other scope does. */
export function erasureNeedsTarget(scope: ErasureScope): boolean {
  return scope !== "All data for this site";
}
