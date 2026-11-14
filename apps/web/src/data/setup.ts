/**
 * Instrumentation snippets shown during enrollment and on the Setup screen.
 *
 * Placeholders to replace before launch: the domain `stellarstats.example`,
 * the script versions and the integrity hash.
 */
export const TRACKER = {
  version: "v1.4.2",
  nextVersion: "v1.5.0",
  src: "https://stellarstats.example/v/1.4.2/app.js",
  integrity: "sha384-Qm9vZ2FsbG9uZ2hhc2hwbGFjZWhvbGRlcg",
  /** Where "changelog + new hash" points. No changelog is published yet. */
  changelogUrl: "#",
} as const;

/** The version-pinned script tag a tenant pastes into their site. */
export function trackerTag(siteId: string): string {
  return [
    "<script defer",
    `  src="${TRACKER.src}"`,
    `  integrity="${TRACKER.integrity}"`,
    '  crossorigin="anonymous"',
    `  data-site="${siteId}"></script>`,
  ].join("\n");
}

/** OpenTelemetry Collector config that keeps the tenant's own APM and adds the SCF collector. */
export const OTEL_COLLECTOR_CONFIG = [
  "exporters:",
  "  otlphttp/own:",
  "    endpoint: https://apm.your-company.example",
  "  otlphttp/scf:",
  "    endpoint: https://stellarstats.example/otlp",
  "    headers:",
  "      x-tenant-key: ${SES_TENANT_KEY}",
  "",
  "service:",
  "  pipelines:",
  "    traces:",
  "      receivers: [otlp]",
  "      exporters: [otlphttp/own, otlphttp/scf]",
].join("\n");

export const OTEL_NOTE =
  "Keep exporting to your own APM. The SCF collector drops traces, spans and logs and keeps only counters and histograms.";
export const OTEL_FILE = "otel-collector.yaml";

export type SetupTabId = "html" | "spa" | "ssr" | "otel";

export interface SetupGuide {
  id: SetupTabId;
  label: string;
  file: string;
  code: string;
  note: string;
}

/** Setup guides for one site, in tab order. */
export function setupGuides(siteId: string): SetupGuide[] {
  const tag = trackerTag(siteId);
  return [
    {
      id: "html",
      label: "Static HTML",
      file: "index.html",
      code: tag,
      note: "Paste before the closing head tag. Works on any static site.",
    },
    {
      id: "spa",
      label: "SPA",
      file: "index.html (React, Vue, Svelte)",
      code: `${tag}\n\n// route changes are tracked automatically\n// via the History API`,
      note: "Add the tag once to your app shell. Client-side navigations are counted as page views.",
    },
    {
      id: "ssr",
      label: "SSR",
      file: "app/layout.tsx (Next.js)",
      code: [
        'import NextScript from "next/script"',
        "",
        "<NextScript",
        `  src="${TRACKER.src}"`,
        `  integrity="${TRACKER.integrity}"`,
        '  crossOrigin="anonymous"',
        `  data-site="${siteId}"`,
        '  strategy="afterInteractive" />',
      ].join("\n"),
      note: "Events are only accepted from browser execution. Server-side posts are rejected.",
    },
    {
      id: "otel",
      label: "OpenTelemetry",
      file: OTEL_FILE,
      code: OTEL_COLLECTOR_CONFIG,
      note: OTEL_NOTE,
    },
  ];
}

/** Examples of the collector's built-in path normalization: raw path → stored route. */
export const NORMALIZATION_EXAMPLES: ReadonlyArray<{ raw: string; route: string }> = [
  { raw: "/accounts/GA7Q…X3LM", route: "/accounts/{g_address}" },
  { raw: "/contracts/CDLZ…Y4QW/state", route: "/contracts/{c_address}/state" },
  { raw: "/tx/3389e9f0f1a65f19…", route: "/tx/{hash}" },
  { raw: "/offers/6f1c2a9e-…-b41d", route: "/offers/{uuid}" },
  { raw: "/tracks/48213/", route: "/tracks/{id}" },
];
