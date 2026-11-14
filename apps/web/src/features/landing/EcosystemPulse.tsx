"use client";

import text from "@/components/ui/text.module.css";
import { ecosystemTotals, liveProjects } from "@/data/ecosystem";
import { PROJECTS } from "@/data/projects";
import { cx, formatCount } from "@/lib/format";
import { useAppState } from "@/state/app-state";
import { Constellation } from "./Constellation";
import styles from "./landing.module.css";

/** Ecosystem-wide totals for the last 30 days, with the constellation of enrolled projects. */
export function EcosystemPulse() {
  const { removed } = useAppState();
  const projects = liveProjects(PROJECTS, removed);
  const totals = ecosystemTotals(projects);

  return (
    <div className={styles.ecosystem}>
      <div className={cx(text.eyebrow, styles.ecosystemHead)}>
        <span>Ecosystem page views · 30D</span>
        <span className={styles.live}>● live</span>
      </div>
      <div className={styles.total}>{formatCount(totals.pageViews)}</div>
      <Constellation projects={projects} />
      <div className={styles.stats}>
        <Stat label="Projects" value={totals.projects} />
        <Stat label="Visitors" value={formatCount(totals.visitors)} />
        <Stat label="API req" value={formatCount(totals.apiRequests)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
    </div>
  );
}
