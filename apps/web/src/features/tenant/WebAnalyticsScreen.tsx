"use client";

import { Card } from "@/components/ui/Card";
import { Chart, Legend } from "@/components/ui/Chart";
import { KpiCard, KpiGrid } from "@/components/ui/Kpi";
import layout from "@/components/ui/layout.module.css";
import { RangeHeading } from "@/components/ui/RangeHeading";
import text from "@/components/ui/text.module.css";
import { axisLabels } from "@/data/ranges";
import { getWebAnalytics, type Breakdown } from "@/data/tenant-web";
import { cx, toPercent } from "@/lib/format";
import { useAppState } from "@/state/app-state";
import styles from "./tenant.module.css";

export function WebAnalyticsScreen() {
  const { range } = useAppState();
  const web = getWebAnalytics(range);

  return (
    <>
      <RangeHeading crumb="// SKYHITZ / SKYHITZ.IO" title="Web analytics" />
      <section className={layout.stack}>
        <KpiGrid>
          {web.kpis.map((kpi) => (
            <KpiCard key={kpi.label} kpi={kpi} />
          ))}
        </KpiGrid>

        <Card className={layout.panel}>
          <Legend items={["Page views", "Unique visitors"]} />
          <Chart
            label="Page views and unique visitors over time"
            size="md"
            max={web.chartMax}
            series={[
              { values: web.pageViews, filled: true },
              { values: web.visitors, thin: true },
            ]}
            axis={axisLabels(range)}
          />
        </Card>

        <div className={styles.breakdowns}>
          {web.breakdowns.map((breakdown) => (
            <BreakdownCard key={breakdown.title} breakdown={breakdown} />
          ))}
        </div>
      </section>
    </>
  );
}

function BreakdownCard({ breakdown }: { breakdown: Breakdown }) {
  return (
    <Card className={cx(layout.panel, layout.gap8)}>
      <div className={cx(text.eyebrow, layout.between)}>
        <span>{breakdown.title}</span>
        <span>{breakdown.unit}</span>
      </div>
      {breakdown.rows.map((row) => (
        <div key={row.name} className={styles.barRow}>
          <div className={styles.bar} style={{ width: toPercent(row.share) }} />
          <span className={styles.barName}>{row.name}</span>
          <span className={styles.barValue}>{row.value}</span>
        </div>
      ))}
    </Card>
  );
}
