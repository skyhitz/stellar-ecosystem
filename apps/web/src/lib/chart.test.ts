import { describe, expect, it } from "vitest";
import { areaPath, linePath } from "./chart";

describe("linePath", () => {
  it("spreads points across the full width", () => {
    // max 100: 0 sits on the baseline (y 156), 100 at the top of the plot (y 10).
    expect(linePath([0, 50, 100], 100)).toBe("M0.0 156.0 L300.0 83.0 L600.0 10.0");
  });

  it("leaves headroom above the peak when no maximum is given", () => {
    // Scale top is 100 × 1.15, so the peak lands below y 10.
    expect(linePath([100, 100])).toBe("M0.0 29.0 L600.0 29.0");
  });

  it("treats a maximum of 0 as not given", () => {
    expect(linePath([100, 100], 0)).toBe(linePath([100, 100]));
  });
});

describe("areaPath", () => {
  it("closes the line along the bottom edge", () => {
    expect(areaPath([0, 100], 100)).toBe("M0.0 156.0 L600.0 10.0 L600 160 L0 160 Z");
  });
});
