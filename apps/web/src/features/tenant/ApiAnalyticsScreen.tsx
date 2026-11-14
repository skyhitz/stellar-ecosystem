"use client";

import { Card } from "@/components/ui/Card";
import { Chart, Legend } from "@/components/ui/Chart";
import { KpiCard, KpiGrid } from "@/components/ui/Kpi";
import layout from "@/components/ui/layout.module.css";
import { RangeHeading } from "@/components/ui/RangeHeading";
import text from "@/components/ui/text.module.css";
import { TONE_COLOR, toneClass } from "@/components/ui/tone";
import { axisLabels } from "@/data/ranges";
import { getApiAnalytics } from "@/data/tenant-api";
import { cx } from "@/lib/format";
import { useAppState } from "@/state/app-state";
import styles from "./tenant.module.css";

export function ApiAnalyticsScreen() {
  const { range } = useAppState();
  const api = getApiAnalytics(range);
  const axis = axisLabels(range);

  return (
    <>
      <RangeHeading crumb="// SKYHITZ / API.SKYHITZ.IO" title="API analytics" />
      <section className={layout.stack}>
        <KpiGrid>
          {api.kpis.map((kpi) => (
            <KpiCard key={kpi.label} kpi={kpi} />
          ))}
        </KpiGrid>

        <div className={styles.charts}>
          <Card className={layout.panel}>
            <div className={text.eyebrow}>Request volume</div>
            <Chart
              label="Request volume over time"
              size="sm"
              series={[{ values: api.requests, filled: true }]}
              axis={axis}
            />
          </Card>
          <Card className={layout.panel}>
            <Legend title="Latency" items={["p50", "p95"]} />
            <Chart
              label="Latency percentiles over time"
              size="sm"
              max={api.latencyMax}
              series={[{ values: api.latencyP50 }, { values: api.latencyP95 }]}
              axis={axis}
            />
          </Card>
        </div>

        <Card className={layout.panel}>
          <div className={text.eyebrow}>Status codes</div>
          <div className={styles.statusBar}>
            {api.statusClasses.map((status) => (
              <div
                key={status.label}
                className={styles.statusSegment}
                style={{ flex: status.percent, background: TONE_COLOR[status.tone] }}
              />
            ))}
          </div>
          <div className={styles.statusLegend}>
            {api.statusClasses.map((status) => (
              <span key={status.label}>
                <span className={toneClass(status.tone)} aria-hidden="true">■</span> {status.label}{" "}
                <span className={toneClass("mute")}>{status.percent}%</span>
              </span>
            ))}
          </div>
        </Card>

        <Card className={styles.tableCard}>
          <div className={styles.routes} role="table" aria-label="Traffic by normalized route">
            <div className={cx(text.eyebrow, styles.routesHead)} role="row">
              <span role="columnheader">Normalized route</span>
              <span role="columnheader" className={styles.number}>Requests</span>
              <span role="columnheader" className={styles.number}>Errors</span>
              <span role="columnheader" className={styles.number}>p50</span>
              <span role="columnheader" className={styles.number}>p95</span>
            </div>
            {api.routes.map((route) => (
              <div key={`${route.method} ${route.route}`} className={styles.routesRow} role="row">
                <span role="cell">
                  <span className={toneClass("mute")}>{route.method}</span> {route.route}
                </span>
                <span role="cell" className={styles.number}>{route.requests}</span>
                <span role="cell" className={cx(styles.number, route.errorsFlagged && toneClass("bad"))}>
                  {route.errorRate}
                </span>
                <span role="cell" className={styles.number}>{route.p50}</span>
                <span role="cell" className={styles.number}>{route.p95}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  );
}
