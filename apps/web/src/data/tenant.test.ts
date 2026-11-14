import { describe, expect, it } from "vitest";
import { pointCount, RANGES } from "./ranges";
import { getApiAnalytics } from "./tenant-api";
import { getWebAnalytics } from "./tenant-web";

const values = (kpis: Array<{ value: string }>) => kpis.map((kpi) => kpi.value);

describe("getWebAnalytics", () => {
  it("reports the tenant's headline figures per range", () => {
    expect(values(getWebAnalytics("24H").kpis)).toEqual(["13.7K", "4,218", "3m 04s", "38%"]);
    expect(values(getWebAnalytics("30D").kpis)).toEqual(["412.0K", "96.4K", "3m 04s", "38%"]);
    expect(values(getWebAnalytics("12M").kpis)).toEqual(["4.94M", "948.3K", "3m 04s", "38%"]);
  });

  it.each(RANGES)("plots one point per bucket at %s, with visitors below views", (range) => {
    const web = getWebAnalytics(range);
    expect(web.pageViews).toHaveLength(pointCount(range));
    expect(web.visitors).toHaveLength(pointCount(range));
    expect(web.visitors.every((count, i) => count < web.pageViews[i])).toBe(true);
    expect(Math.max(...web.pageViews)).toBeLessThan(web.chartMax);
  });

  it("is deterministic, so server and client renders agree", () => {
    expect(getWebAnalytics("7D")).toEqual(getWebAnalytics("7D"));
  });

  it("sizes each breakdown bar against its largest row", () => {
    const [referrers, , devices] = getWebAnalytics("30D").breakdowns;
    expect(referrers.rows[0]).toEqual({ name: "Direct / none", value: "168.9K", share: 1 });
    expect(devices.rows.map((row) => row.value)).toEqual(["54%", "41%", "5%"]);
    expect(devices.rows[2].share).toBeCloseTo(5 / 54);
  });
});

describe("getApiAnalytics", () => {
  it("reports the tenant's headline figures per range", () => {
    expect(values(getApiAnalytics("7D").kpis)).toEqual(["1.21M", "0.6%", "82 ms", "240 ms"]);
    expect(values(getApiAnalytics("90D").kpis)).toEqual(["15.60M", "0.6%", "82 ms", "240 ms"]);
  });

  it("treats a rise in latency as bad and a fall in errors as good", () => {
    const changes = Object.fromEntries(getApiAnalytics("30D").kpis.map((kpi) => [kpi.label, kpi.change!]));
    expect(changes["Latency p95"]).toEqual({ percent: 2.6, goodWhenUp: false });
    expect(changes["Error rate"]).toEqual({ percent: -0.2, goodWhenUp: false });
    expect(changes["Requests"]).toEqual({ percent: 9.7, goodWhenUp: true });
  });

  it("covers every response with its status classes", () => {
    const total = getApiAnalytics("30D").statusClasses.reduce((sum, status) => sum + status.percent, 0);
    expect(total).toBeCloseTo(100);
  });

  it("flags routes with a high error rate", () => {
    const flagged = getApiAnalytics("30D").routes.filter((route) => route.errorsFlagged);
    expect(flagged.map((route) => route.route)).toEqual(["/v1/tx/submit"]);
  });

  it("keeps p95 above p50 on a shared scale", () => {
    const api = getApiAnalytics("30D");
    expect(api.latencyP95.every((p95, i) => p95 > api.latencyP50[i])).toBe(true);
    expect(Math.max(...api.latencyP95)).toBeLessThan(api.latencyMax);
  });
});
