import { describe, expect, it } from "vitest";
import { OTEL_COLLECTOR_CONFIG, TRACKER, setupGuides, trackerTag } from "./setup";

describe("trackerTag", () => {
  const tag = trackerTag("my-app");

  it("pins the script to one version, verified by its hash", () => {
    expect(tag).toContain(`src="${TRACKER.src}"`);
    expect(TRACKER.src).toContain(TRACKER.version.replace("v", ""));
    expect(tag).toContain(`integrity="${TRACKER.integrity}"`);
    // Subresource Integrity is only enforced for cross-origin scripts fetched with CORS.
    expect(tag).toContain('crossorigin="anonymous"');
  });

  it("carries the site id", () => {
    expect(tag).toContain('data-site="my-app"');
  });

  it("is a single well-formed script element", () => {
    expect(tag.startsWith("<script defer\n")).toBe(true);
    expect(tag.endsWith("></script>")).toBe(true);
    expect(tag.match(/<script/g)).toHaveLength(1);
  });
});

describe("OTEL_COLLECTOR_CONFIG", () => {
  it("exports to the tenant's own backend as well as the SCF collector", () => {
    expect(OTEL_COLLECTOR_CONFIG).toContain("exporters: [otlphttp/own, otlphttp/scf]");
  });

  it("reads the tenant key from the environment instead of embedding it", () => {
    expect(OTEL_COLLECTOR_CONFIG).toContain("x-tenant-key: ${SES_TENANT_KEY}");
  });
});

describe("setupGuides", () => {
  const guides = setupGuides("skyhitz");

  it("offers the four platforms in tab order", () => {
    expect(guides.map((guide) => guide.label)).toEqual(["Static HTML", "SPA", "SSR", "OpenTelemetry"]);
  });

  it("uses the site id in every script snippet", () => {
    for (const guide of guides.filter((candidate) => candidate.id !== "otel")) {
      expect(guide.code).toContain('data-site="skyhitz"');
      expect(guide.code).toContain(TRACKER.integrity);
    }
  });
});
