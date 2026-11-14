import { describe, expect, it } from "vitest";
import { PROJECTS } from "@/data/projects";
import { HUB, constellationNodes, round2 } from "./constellation";

describe("constellationNodes", () => {
  const nodes = constellationNodes(PROJECTS);

  it("places one node per project", () => {
    expect(nodes.map((node) => node.id)).toEqual(PROJECTS.map((project) => project.id));
  });

  it("keeps every node inside the 520×440 drawing, clear of the hub", () => {
    for (const node of nodes) {
      expect(node.x).toBeGreaterThan(0);
      expect(node.x).toBeLessThan(520);
      expect(node.y).toBeGreaterThan(0);
      expect(node.y).toBeLessThan(440);
      expect(Math.hypot(node.x - HUB.x, node.y - HUB.y)).toBeGreaterThan(90);
    }
  });

  it("draws busier projects larger", () => {
    const radius = (id: string) => nodes.find((node) => node.id === id)!.r;
    expect(radius("nebula")).toBeGreaterThan(radius("skyhitz"));
    expect(radius("skyhitz")).toBeGreaterThan(radius("quasar"));
  });

  it("rounds coordinates to two decimals", () => {
    for (const node of nodes) {
      expect(node.x).toBe(round2(node.x));
      expect(node.y).toBe(round2(node.y));
      expect(node.r).toBe(round2(node.r));
    }
  });

  it("re-spaces the remaining nodes when a project is removed", () => {
    const fewer = constellationNodes(PROJECTS.slice(1));
    expect(fewer).toHaveLength(7);
    expect(fewer[0].x).toBe(nodes[0].x);
    expect(fewer[1].x).not.toBe(nodes[2].x);
  });

  it("handles an empty ecosystem", () => {
    expect(constellationNodes([])).toEqual([]);
  });
});
