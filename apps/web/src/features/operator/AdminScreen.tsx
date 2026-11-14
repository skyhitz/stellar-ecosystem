"use client";

import { useLayoutEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import layout from "@/components/ui/layout.module.css";
import { PageHeading } from "@/components/ui/PageHeading";
import { Segmented } from "@/components/ui/Segmented";
import text from "@/components/ui/text.module.css";
import { toneClass } from "@/components/ui/tone";
import { createDemoKey, today, visiblePrefix } from "@/data/api-keys";
import { BOT_SHARE_FLAG, PROJECTS } from "@/data/projects";
import type { Project, Tone } from "@/data/types";
import { cx } from "@/lib/format";
import { useAppDispatch, useAppState } from "@/state/app-state";
import type { EnrollmentMode } from "@/state/reducer";
import styles from "./operator.module.css";

const MODES: ReadonlyArray<{ value: EnrollmentMode; label: string }> = [
  { value: "self", label: "Self-service" },
  { value: "approval", label: "Approval required" },
];

const MODE_NOTES: Record<EnrollmentMode, string> = {
  self: "Any project can enroll and start sending data immediately.",
  approval: "New projects wait for operator approval before ingestion starts.",
};

export function AdminScreen() {
  const { removed, enrollmentMode, apiKeys } = useAppState();
  const dispatch = useAppDispatch();
  /** The project whose removal is waiting for a second click. */
  const [confirming, setConfirming] = useState<string | null>(null);
  /** The full key, shown once right after it is generated. */
  const [newKey, setNewKey] = useState<string | null>(null);

  // Leaving the screen withdraws a pending confirmation and hides the one-time key.
  useLayoutEffect(
    () => () => {
      setConfirming(null);
      setNewKey(null);
    },
    [],
  );

  function generateKey() {
    const key = createDemoKey();
    setNewKey(key);
    dispatch({ type: "addApiKey", prefix: visiblePrefix(key), createdOn: today() });
  }

  return (
    <section className={layout.stack}>
      <PageHeading crumb="// SCF OPERATOR / ADMIN" title="Administration" />

      <Card className={styles.mode}>
        <div className={styles.modeText}>
          <div className={styles.sectionTitle}>Enrollment model</div>
          <div className={text.note}>{MODE_NOTES[enrollmentMode]}</div>
        </div>
        <Segmented
          label="Enrollment model"
          size="lg"
          options={MODES}
          value={enrollmentMode}
          onChange={(mode) => dispatch({ type: "setEnrollmentMode", mode })}
        />
      </Card>

      <div className={styles.adminColumns}>
        <Card className={styles.projects}>
          <div className={cx(text.eyebrow, styles.projectsTitle)}>Enrolled projects</div>
          {PROJECTS.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              removed={removed.includes(project.id)}
              confirming={confirming === project.id}
              onAskRemove={() => setConfirming(project.id)}
              onCancel={() => setConfirming(null)}
              onRemove={() => {
                dispatch({ type: "removeProject", id: project.id });
                setConfirming(null);
              }}
              onRestore={() => dispatch({ type: "restoreProject", id: project.id })}
            />
          ))}
        </Card>

        <Card className={layout.panel}>
          <div className={styles.keysHead}>
            <span className={text.eyebrow}>Metrics API keys</span>
            <Button size="sm" onClick={generateKey}>
              Generate key
            </Button>
          </div>
          {newKey && (
            <div className={styles.newKey} role="status">
              <span className={styles.newKeyHint}>Copy this key now. It will not be shown again.</span>
              <span className={styles.newKeyValue}>{newKey}</span>
            </div>
          )}
          {apiKeys.map((key) => (
            <div key={key.id} className={styles.keyRow}>
              <div>
                <div className={cx(styles.keyPrefix, !key.active && toneClass("mute"))}>{key.prefix}…</div>
                <div className={styles.keyMeta}>{key.meta}</div>
              </div>
              {key.active ? (
                <Button
                  variant="outline"
                  danger
                  aria-label={`Revoke key ${key.prefix}`}
                  onClick={() => dispatch({ type: "revokeApiKey", id: key.id })}
                >
                  Revoke
                </Button>
              ) : (
                <span className={styles.revoked}>Revoked</span>
              )}
            </div>
          ))}
          <p className={text.note}>
            Keys grant read-only access to aggregated metrics for downstream machine consumers.
          </p>
        </Card>
      </div>
    </section>
  );
}

interface ProjectRowProps {
  project: Project;
  removed: boolean;
  confirming: boolean;
  onAskRemove: () => void;
  onCancel: () => void;
  onRemove: () => void;
  onRestore: () => void;
}

function ProjectRow({ project, removed, confirming, onAskRemove, onCancel, onRemove, onRestore }: ProjectRowProps) {
  const flagged = project.botShare > BOT_SHARE_FLAG;
  const status: { text: string; tone: Tone } = removed
    ? { text: "Removed · ingestion stopped", tone: "mute" }
    : flagged
      ? { text: "Active · flagged: high bot share", tone: "warn" }
      : { text: "Active", tone: "ok" };

  return (
    <div className={styles.projectRow}>
      <div>
        <div className={cx(styles.adminName, removed && toneClass("mute"))}>{project.name}</div>
        <div className={cx(styles.adminStatus, toneClass(status.tone))}>{status.text}</div>
      </div>
      <div className={styles.rowActions}>
        {removed ? (
          <Button variant="outline" aria-label={`Restore ${project.name}`} onClick={onRestore}>
            Restore
          </Button>
        ) : confirming ? (
          <>
            <Button variant="outline" danger aria-label={`Confirm removal of ${project.name}`} onClick={onRemove}>
              Confirm removal
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </>
        ) : (
          <Button variant="outline" danger aria-label={`Remove ${project.name}`} onClick={onAskRemove}>
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
