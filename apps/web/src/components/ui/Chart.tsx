import { Fragment } from "react";
import { CHART_HEIGHT, CHART_WIDTH, areaPath, linePath } from "@/lib/chart";
import { cx } from "@/lib/format";
import styles from "./chart.module.css";
import text from "./text.module.css";

const SERIES_CLASSES = [styles.c1, styles.c2, styles.c3];

/** Colour class of the nth series (0-based), shared by lines and legend swatches. */
export function seriesClass(index: number): string {
  return SERIES_CLASSES[index];
}

export interface ChartSeries {
  values: readonly number[];
  /** Shade the area under the line. */
  filled?: boolean;
  /** Draw a lighter line, for a secondary series. */
  thin?: boolean;
}

interface ChartProps {
  /** Describes the chart to assistive technology. */
  label: string;
  size: "sm" | "md" | "lg";
  /** Up to three series, coloured in order. */
  series: readonly ChartSeries[];
  /** Top of the vertical scale. Defaults to just above each series' own peak. */
  max?: number;
  /** Labels spread evenly under the plot. */
  axis: readonly string[];
}

/** A line chart with its x-axis labels. Renders two siblings so both sit in the parent's layout. */
export function Chart({ label, size, series, max, axis }: ChartProps) {
  return (
    <>
      <svg
        className={cx(styles.plot, styles[size])}
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={label}
      >
        {series.map((item, i) => (
          <Fragment key={i}>
            {item.filled && <path className={cx(styles.area, seriesClass(i))} d={areaPath(item.values, max)} />}
            <path
              className={cx(styles.line, item.thin && styles.thin, seriesClass(i))}
              d={linePath(item.values, max)}
            />
          </Fragment>
        ))}
      </svg>
      <div className={styles.axis}>
        {axis.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
    </>
  );
}

/** Names the series of a chart, with an optional leading title. */
export function Legend({ title, items }: { title?: string; items: readonly string[] }) {
  return (
    <div className={cx(text.eyebrow, styles.legend)}>
      {title && <span>{title}</span>}
      {items.map((item, i) => (
        <span key={item}>
          <span className={seriesClass(i)} aria-hidden="true">■</span> {item}
        </span>
      ))}
    </div>
  );
}
