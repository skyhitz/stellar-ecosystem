import type { ReactNode } from "react";
import type { Kpi } from "@/data/types";
import { cx, formatChange } from "@/lib/format";
import { Card } from "./Card";
import styles from "./kpi.module.css";
import text from "./text.module.css";
import { toneClass } from "./tone";

export function KpiGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const { change } = kpi;
  // A rise is good news for traffic and bad news for errors or latency.
  const improved = change ? change.percent >= 0 === change.goodWhenUp : false;
  return (
    <Card className={styles.kpi}>
      <div className={text.eyebrow}>{kpi.label}</div>
      <div className={styles.value}>{kpi.value}</div>
      {change && (
        <div className={cx(styles.change, toneClass(improved ? "ok" : "bad"))}>{formatChange(change.percent)}</div>
      )}
    </Card>
  );
}
