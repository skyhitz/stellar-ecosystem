"use client";

import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { KpiCard, KpiGrid } from "@/components/ui/Kpi";
import layout from "@/components/ui/layout.module.css";
import { RangeHeading } from "@/components/ui/RangeHeading";
import text from "@/components/ui/text.module.css";
import { toneClass } from "@/components/ui/tone";
import {
  COLUMNS,
  ecosystemTotals,
  liveProjects,
  selectProjects,
  toProjectRow,
  type CategoryFilter,
} from "@/data/ecosystem";
import { BOT_SHARE_FLAG, CATEGORIES, PROJECTS } from "@/data/projects";
import { scaleTotal, scaleVisitors } from "@/data/ranges";
import type { Kpi } from "@/data/types";
import { cx, formatCount } from "@/lib/format";
import { useAppDispatch, useAppState } from "@/state/app-state";
import styles from "./operator.module.css";

const CATEGORY_FILTERS: readonly CategoryFilter[] = ["All", ...CATEGORIES];

export function GlobalScreen() {
  const { range, table, picked, removed } = useAppState();
  const dispatch = useAppDispatch();

  const projects = liveProjects(PROJECTS, removed);
  const totals = ecosystemTotals(projects);
  const rows = selectProjects(projects, table).map((project) => toProjectRow(project, range));

  const kpis: Kpi[] = [
    { label: "Enrolled projects", value: String(totals.projects) },
    { label: "Page views", value: formatCount(scaleTotal(totals.pageViews, range)) },
    { label: "Unique visitors", value: formatCount(scaleVisitors(totals.visitors, range)) },
    { label: "API requests", value: formatCount(scaleTotal(totals.apiRequests, range)) },
  ];

  return (
    <>
      <RangeHeading crumb="// SCF OPERATOR / ALL PROJECTS" title="Ecosystem overview" />
      <section className={layout.stack}>
        <KpiGrid>
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} kpi={kpi} />
          ))}
        </KpiGrid>

        <div className={styles.controls}>
          <input
            className={styles.search}
            value={table.query}
            onChange={(event) => dispatch({ type: "setQuery", query: event.target.value })}
            placeholder="Search projects…"
            aria-label="Search projects"
          />
          <div className={styles.categories} role="group" aria-label="Category">
            {CATEGORY_FILTERS.map((category) => (
              <Chip
                key={category}
                className={styles.category}
                pressed={table.category === category}
                onClick={() => dispatch({ type: "setCategory", category })}
              >
                {category}
              </Chip>
            ))}
          </div>
          <ButtonLink href="/operator/compare" size="md">
            Compare ({picked.length}) →
          </ButtonLink>
        </div>

        <Card className={styles.tableCard}>
          <div className={styles.tableScroll}>
            <div role="table" aria-label="Enrolled projects">
              <div className={styles.head} role="row">
                <span role="columnheader">
                  <span className="sr-only">Compare</span>
                </span>
                {COLUMNS.map((column) => {
                  const active = table.sortKey === column.key;
                  const direction = table.sortDir === 1 ? "ascending" : "descending";
                  return (
                    <div
                      key={column.key}
                      className={styles.headCell}
                      role="columnheader"
                      aria-sort={active ? direction : undefined}
                    >
                      <button
                        type="button"
                        className={cx(
                          styles.sort,
                          column.key === "name" && styles.sortLeft,
                          active && styles.sortActive,
                        )}
                        onClick={() => dispatch({ type: "sortBy", key: column.key })}
                      >
                        {column.label}
                        {active && (table.sortDir === 1 ? " ↑" : " ↓")}
                      </button>
                    </div>
                  );
                })}
              </div>

              {rows.map((row) => {
                const compared = picked.includes(row.id);
                return (
                  <div key={row.id} className={styles.row} role="row">
                    <span className={styles.pickCell} role="cell">
                      <button
                        type="button"
                        className={styles.pick}
                        role="checkbox"
                        aria-checked={compared}
                        aria-label={`Compare ${row.name}`}
                        title="Add to comparison"
                        onClick={() => dispatch({ type: "togglePick", id: row.id })}
                      >
                        {compared ? "✓" : ""}
                      </button>
                    </span>
                    <span role="cell">
                      <span className={styles.projectName}>{row.name}</span>
                      <br />
                      <span className={styles.projectCategory}>{row.category}</span>
                    </span>
                    <span role="cell" className={styles.number}>{row.pageViews}</span>
                    <span role="cell" className={styles.number}>{row.visitors}</span>
                    <span role="cell" className={styles.number}>{row.bounceRate}</span>
                    <span role="cell" className={styles.number}>{row.session}</span>
                    <span role="cell" className={cx(styles.number, row.botFlagged && toneClass("bad"))}>
                      {row.botShare}
                    </span>
                    <span role="cell" className={styles.number}>{row.apiRequests}</span>
                    <span role="cell" className={styles.number}>{row.latencyP95}</span>
                    <span role="cell" className={cx(styles.number, row.errorsFlagged && toneClass("bad"))}>
                      {row.errorRate}
                    </span>
                  </div>
                );
              })}
            </div>
            {rows.length === 0 && <div className={styles.empty}>No projects match.</div>}
          </div>
        </Card>

        <div className={text.note}>
          Bot % is the share of events rejected by browser-execution checks and IP/fingerprint heuristics. Values above{" "}
          {BOT_SHARE_FLAG}% are flagged.
        </div>
      </section>
    </>
  );
}
