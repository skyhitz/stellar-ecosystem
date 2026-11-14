/**
 * Charts are drawn in a fixed viewBox and stretched to their container
 * (`preserveAspectRatio="none"`), so paths only need to be computed once.
 */
export const CHART_WIDTH = 600;
export const CHART_HEIGHT = 160;

/** y of a zero value, and the vertical span covered by 0..max. */
const BASELINE_Y = 156;
const PLOT_SPAN = 146;
/** Space left above the highest point when no explicit maximum is given. */
const HEADROOM = 1.15;

/** SVG path for a line through `values`, spread evenly across the chart width. */
export function linePath(values: readonly number[], max?: number): string {
  const top = max || Math.max(...values) * HEADROOM;
  const lastIndex = values.length - 1;
  return values
    .map((value, i) => {
      const x = (i / lastIndex) * CHART_WIDTH;
      const y = BASELINE_Y - (value / top) * PLOT_SPAN;
      return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

/** The same line, closed along the bottom edge so it can be filled. */
export function areaPath(values: readonly number[], max?: number): string {
  return `${linePath(values, max)} L${CHART_WIDTH} ${CHART_HEIGHT} L0 ${CHART_HEIGHT} Z`;
}
