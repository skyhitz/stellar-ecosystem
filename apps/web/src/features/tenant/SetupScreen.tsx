"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { CodeBlock } from "@/components/ui/CodeBlock";
import layout from "@/components/ui/layout.module.css";
import { PageHeading } from "@/components/ui/PageHeading";
import text from "@/components/ui/text.module.css";
import { toneClass } from "@/components/ui/tone";
import { useCopy } from "@/components/ui/useCopy";
import { TENANT_PROJECT } from "@/data/projects";
import { NORMALIZATION_EXAMPLES, TRACKER, setupGuides } from "@/data/setup";
import { cx } from "@/lib/format";
import { useAppDispatch, useAppState } from "@/state/app-state";
import styles from "./tenant.module.css";

const GUIDES = setupGuides(TENANT_PROJECT.id);

export function SetupScreen() {
  const { setupTab } = useAppState();
  const dispatch = useAppDispatch();
  const [copied, copy] = useCopy();
  const guide = GUIDES.find((candidate) => candidate.id === setupTab) ?? GUIDES[0];

  return (
    <section className={layout.stack}>
      <PageHeading crumb="// SKYHITZ / SETUP" title="Instrumentation" />

      <div className={styles.tabs} role="group" aria-label="Platform">
        {GUIDES.map((candidate) => (
          <Chip
            key={candidate.id}
            className={styles.tab}
            pressed={candidate.id === guide.id}
            onClick={() => dispatch({ type: "setSetupTab", tab: candidate.id })}
          >
            {candidate.label}
          </Chip>
        ))}
      </div>

      <div className={styles.columns}>
        <Card className={cx(layout.panel, layout.gap12)}>
          <div className={styles.codeHead}>
            <span className={text.eyebrow}>{guide.file}</span>
            <Button variant="outline" onClick={() => copy(guide.code)}>
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <CodeBlock code={guide.code} roomy />
          <p className={cx(text.note, text.pretty)}>{guide.note}</p>
        </Card>

        <div className={layout.stack}>
          <Card className={layout.panel}>
            <div className={text.eyebrow}>Script version</div>
            <div className={styles.versionRow}>
              <span>
                {TRACKER.version} <span className={toneClass("ok")}>● pinned</span>
              </span>
              <span className={toneClass("mute")}>installed</span>
            </div>
            <div className={cx(styles.versionRow, styles.divided)}>
              <span>{TRACKER.nextVersion}</span>
              <a className={styles.changelog} href={TRACKER.changelogUrl}>
                changelog + new hash
              </a>
            </div>
            <p className={text.note}>
              Upgrades are manual. Replace the version and integrity hash in your tag when you are ready.
            </p>
          </Card>

          <Card className={cx(layout.panel, layout.gap8)}>
            <div className={text.eyebrow}>Path normalization (built-in rules)</div>
            {NORMALIZATION_EXAMPLES.map((example) => (
              <div key={example.raw} className={styles.rule}>
                <span className={styles.rawPath}>{example.raw}</span>
                <span className={toneClass("accent")}>→ {example.route}</span>
              </div>
            ))}
            <p className={text.note}>
              For finer control, set <span className={styles.attribute}>http.route</span> in your own middleware.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
