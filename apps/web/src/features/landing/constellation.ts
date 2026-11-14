import type { Project } from "@/data/types";

/** The hero graphic is drawn in a 520×440 viewBox around this hub. */
export const VIEW_BOX = "0 0 520 440";
export const HUB = { x: 260, y: 215 } as const;

export interface ConstellationNode {
  id: string;
  name: string;
  pageViews: number;
  x: number;
  y: number;
  /** Dot radius, growing with the square root of page views. */
  r: number;
}

/**
 * Two decimals is finer than a pixel and keeps coordinates identical between
 * the server and every browser, whose trigonometry can differ in the last bit.
 */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Places projects evenly around the hub, alternating between three orbits. */
export function constellationNodes(projects: readonly Project[]): ConstellationNode[] {
  return projects.map((project, i) => {
    const angle = (i / projects.length) * Math.PI * 2 + 0.35;
    const orbit = 105 + (i % 3) * 36;
    return {
      id: project.id,
      name: project.name,
      pageViews: project.pageViews,
      x: round2(HUB.x + Math.cos(angle) * orbit * 1.25),
      y: round2(HUB.y + Math.sin(angle) * orbit * 0.95),
      r: round2(3 + Math.sqrt(project.pageViews) / 110),
    };
  });
}
