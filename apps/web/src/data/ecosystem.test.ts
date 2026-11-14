import { describe, expect, it } from "vitest";
import {
  compareProjects,
  ecosystemTotals,
  liveProjects,
  selectProjects,
  toProjectRow,
  type TableQuery,
} from "./ecosystem";
import { PROJECTS } from "./projects";

const defaults: TableQuery = { query: "", category: "All", sortKey: "pageViews", sortDir: -1 };
const names = (query: Partial<TableQuery>) =>
  selectProjects(PROJECTS, { ...defaults, ...query }).map((project) => project.name);
const byId = (id: string) => PROJECTS.find((project) => project.id === id)!;

describe("liveProjects", () => {
  it("drops removed projects and keeps the order", () => {
    const live = liveProjects(PROJECTS, ["nebula", "quasar"]);
    expect(live).toHaveLength(6);
    expect(live.map((project) => project.id)).toEqual(["skyhitz", "orbit", "lend", "anchorly", "vault", "comet"]);
  });
});

describe("ecosystemTotals", () => {
  it("sums the 30-day figures", () => {
    expect(ecosystemTotals(PROJECTS)).toEqual({
      projects: 8,
      pageViews: 2_043_000,
      visitors: 482_400,
      apiRequests: 28_120_000,
    });
  });

  it("is zero for no projects", () => {
    expect(ecosystemTotals([])).toEqual({ projects: 0, pageViews: 0, visitors: 0, apiRequests: 0 });
  });
});

describe("selectProjects", () => {
  it("sorts by page views, highest first, by default", () => {
    expect(names({})).toEqual([
      "Nebula DEX",
      "Skyhitz",
      "StarVault",
      "Orbit Pay",
      "Lumen Lend",
      "Anchorly",
      "Comet SDK Docs",
      "Quasar ID",
    ]);
  });

  it("sorts names alphabetically", () => {
    expect(names({ sortKey: "name", sortDir: 1 })[0]).toBe("Anchorly");
    expect(names({ sortKey: "name", sortDir: -1 })[0]).toBe("StarVault");
  });

  it("keeps dataset order between projects that tie", () => {
    // StarVault and Comet SDK Docs both have no API traffic.
    expect(names({ sortKey: "apiRequests", sortDir: 1 }).slice(0, 2)).toEqual(["StarVault", "Comet SDK Docs"]);
  });

  it("filters by category", () => {
    expect(names({ category: "DeFi" })).toEqual(["Nebula DEX", "Lumen Lend"]);
  });

  it("searches names without regard to case", () => {
    expect(names({ query: "LU" })).toEqual(["Lumen Lend"]);
    expect(names({ query: "zzz" })).toEqual([]);
  });

  it("combines search and category", () => {
    expect(names({ query: "a", category: "Payments" })).toEqual(["Orbit Pay", "Anchorly"]);
  });

  it("does not reorder the dataset", () => {
    const before = PROJECTS.map((project) => project.id);
    selectProjects(PROJECTS, { ...defaults, sortKey: "name", sortDir: 1 });
    expect(PROJECTS.map((project) => project.id)).toEqual(before);
  });
});

describe("toProjectRow", () => {
  it("scales volumes with the range", () => {
    expect(toProjectRow(byId("skyhitz"), "30D")).toMatchObject({ pageViews: "412.0K", visitors: "96.4K", apiRequests: "5.20M" });
    expect(toProjectRow(byId("skyhitz"), "12M")).toMatchObject({ pageViews: "4.94M", visitors: "948.3K", apiRequests: "62.40M" });
  });

  it("leaves rates and durations unscaled", () => {
    const row = toProjectRow(byId("skyhitz"), "7D");
    expect(row).toMatchObject({ bounceRate: "38%", session: "3m 04s", botShare: "3.1%", latencyP95: "240 ms", errorRate: "0.6%" });
  });

  it("shows dashes for a project without API instrumentation", () => {
    expect(toProjectRow(byId("vault"), "30D")).toMatchObject({ apiRequests: "—", latencyP95: "—", errorRate: "—" });
  });

  it("flags a high bot share and a high error rate", () => {
    expect(toProjectRow(byId("vault"), "30D").botFlagged).toBe(true);
    expect(toProjectRow(byId("skyhitz"), "30D").botFlagged).toBe(false);
    expect(toProjectRow(byId("lend"), "30D").errorsFlagged).toBe(true);
    expect(toProjectRow(byId("nebula"), "30D").errorsFlagged).toBe(false);
  });
});

describe("compareProjects", () => {
  const picked = ["skyhitz", "nebula", "orbit"].map(byId);

  it("returns one series per project, all within the chart scale", () => {
    const comparison = compareProjects(picked, "30D");
    expect(comparison.series).toHaveLength(3);
    expect(comparison.series.every((series) => series.length === 30)).toBe(true);
    expect(Math.max(...comparison.series.flat())).toBeLessThan(comparison.chartMax);
  });

  it("measures each bar against the largest value", () => {
    const pageViews = compareProjects(picked, "30D").metrics[0];
    expect(pageViews.label).toBe("Page views");
    expect(pageViews.cells.map((cell) => cell.value)).toEqual(["412.0K", "688.0K", "254.0K"]);
    expect(pageViews.cells[1].share).toBe(1);
    expect(pageViews.cells[0].share).toBeCloseTo(412 / 688);
  });

  it("says so when a project has no API instrumentation", () => {
    const { metrics } = compareProjects([byId("vault"), byId("comet")], "30D");
    const cellsOf = (label: string) => metrics.find((metric) => metric.label === label)!.cells;
    expect(cellsOf("API requests").map((cell) => cell.value)).toEqual(["not instrumented", "not instrumented"]);
    expect(cellsOf("Latency p95").map((cell) => cell.share)).toEqual([0, 0]);
  });

  it("copes with nothing selected", () => {
    const comparison = compareProjects([], "30D");
    expect(comparison.series).toEqual([]);
    expect(comparison.metrics.every((metric) => metric.cells.length === 0)).toBe(true);
    expect(Number.isFinite(comparison.chartMax)).toBe(true);
  });
});
