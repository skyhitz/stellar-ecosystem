import { describe, expect, it } from "vitest";
import { cx, formatChange, formatCount, formatDuration, toPercent } from "./format";

describe("formatCount", () => {
  it("writes small numbers in full, with separators", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(4218.4)).toBe("4,218");
    expect(formatCount(9999)).toBe("9,999");
  });

  it("abbreviates from ten thousand up", () => {
    expect(formatCount(10_000)).toBe("10.0K");
    expect(formatCount(412_000)).toBe("412.0K");
    expect(formatCount(999_999)).toBe("1000.0K");
    expect(formatCount(1_000_000)).toBe("1.00M");
    expect(formatCount(28_120_000)).toBe("28.12M");
    expect(formatCount(2_500_000_000)).toBe("2.50B");
  });
});

describe("formatDuration", () => {
  it("pads seconds to two digits", () => {
    expect(formatDuration(184)).toBe("3m 04s");
    expect(formatDuration(58)).toBe("0m 58s");
    expect(formatDuration(240)).toBe("4m 00s");
  });
});

describe("toPercent", () => {
  it("rounds to four decimals and drops trailing zeros", () => {
    expect(toPercent(1)).toBe("100%");
    expect(toPercent(0.5)).toBe("50%");
    expect(toPercent(0.17 / 0.41)).toBe("41.4634%");
    expect(toPercent(0)).toBe("0%");
  });
});

describe("formatChange", () => {
  it("points the arrow in the direction of the change", () => {
    expect(formatChange(12.4)).toBe("▲ 12.4% vs previous");
    expect(formatChange(-1.8)).toBe("▼ 1.8% vs previous");
    expect(formatChange(0)).toBe("▲ 0.0% vs previous");
  });
});

describe("cx", () => {
  it("joins truthy class names", () => {
    expect(cx("a", false, undefined, "b", null, "")).toBe("a b");
  });
});
