"use client";

import { Card } from "@/components/ui/Card";
import { Chart, seriesClass } from "@/components/ui/Chart";
import layout from "@/components/ui/layout.module.css";
import { RangeHeading } from "@/components/ui/RangeHeading";
import text from "@/components/ui/text.module.css";
import { compareProjects, liveProjects } from "@/data/ecosystem";
import { PROJECTS } from "@/data/projects";
import { axisLabels } from "@/data/ranges";
import type { Project } from "@/data/types";
import { cx, toPercent } from "@/lib/format";
import { useAppDispatch, useAppState } from "@/state/app-state";
import styles from "./operator.module.css";

export function CompareScreen() {
  const { range, picked, removed } = useAppState();
  const dispatch = useAppDispatch();

  const projects = liveProjects(PROJECTS, removed);
  // Selection order decides each project's colour, in the chart and in every bar.
  const compared = picked
    .map((id) => projects.find((project) => project.id === id))
    .filter((project): project is Project => project !== undefined);
  const comparison = compareProjects(compared, range);

  return (
    <>
      <RangeHeading crumb="// SCF OPERATOR / COMPARE" title="Side by side" />
      <section className={layout.stack}>
        <div className={styles.pickChips} role="group" aria-label="Projects to compare">
          {projects.map((project) => {
            const position = compared.indexOf(project);
            return (
              <button
                key={project.id}
                type="button"
                className={styles.pickChip}
                aria-pressed={position >= 0}
                onClick={() => dispatch({ type: "togglePick", id: project.id })}
              >
                <span className={position >= 0 ? seriesClass(position) : styles.noSwatch} aria-hidden="true">■</span>{" "}
                {project.name}
              </button>
            );
          })}
        </div>
        <div className={text.note}>Select up to three projects.</div>

        <Card className={layout.panel}>
          <div className={text.eyebrow}>Page views</div>
          <Chart
            label={`Page views over time for ${compared.map((project) => project.name).join(", ") || "no projects"}`}
            size="lg"
            max={comparison.chartMax}
            series={comparison.series.map((values) => ({ values }))}
            axis={axisLabels(range)}
          />
        </Card>

        <div className={styles.metrics}>
          {comparison.metrics.map((metric) => (
            <Card key={metric.label} className={layout.panel}>
              <div className={text.eyebrow}>{metric.label}</div>
              {metric.cells.map((cell, i) => (
                <div key={cell.id} className={styles.metricCell}>
                  <div className={styles.metricHead}>
                    <span>{cell.name}</span>
                    <span className={styles.metricValue}>{cell.value}</span>
                  </div>
                  <div className={styles.track}>
                    <div className={cx(styles.fill, seriesClass(i))} style={{ width: toPercent(cell.share) }} />
                  </div>
                </div>
              ))}
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
