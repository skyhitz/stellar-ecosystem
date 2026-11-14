"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Field } from "@/components/ui/Field";
import field from "@/components/ui/field.module.css";
import layout from "@/components/ui/layout.module.css";
import { PageHeading } from "@/components/ui/PageHeading";
import text from "@/components/ui/text.module.css";
import { toneClass } from "@/components/ui/tone";
import {
  COMPLIANCE,
  ERASURE_SCOPES,
  NEVER_STORED,
  STORED,
  erasureNeedsTarget,
  type ErasureScope,
} from "@/data/privacy";
import { cx } from "@/lib/format";
import { useAppDispatch, useAppState } from "@/state/app-state";
import styles from "./tenant.module.css";

export function PrivacyScreen() {
  return (
    <section className={layout.stack}>
      <PageHeading crumb="// SKYHITZ / PRIVACY" title="Privacy & erasure" />

      <div className={styles.facts}>
        <Card className={cx(layout.panel, layout.gap9)}>
          <div className={text.eyebrow}>What is stored</div>
          {STORED.map((item) => (
            <div key={item} className={styles.fact}>
              <span className={cx(styles.factMark, toneClass("ok"))} aria-hidden="true">+</span>
              <span>{item}</span>
            </div>
          ))}
        </Card>

        <Card className={cx(layout.panel, layout.gap9)}>
          <div className={text.eyebrow}>Never stored</div>
          {NEVER_STORED.map((item) => (
            <div key={item} className={styles.fact}>
              <span className={cx(styles.factMark, toneClass("bad"))} aria-hidden="true">×</span>
              <span>{item}</span>
            </div>
          ))}
        </Card>

        <Card className={cx(layout.panel, layout.gap9)}>
          <div className={cx(text.eyebrow, styles.complianceHead)}>
            <span>Compliance statement</span>
            <span className={toneClass("warn")}>Draft</span>
          </div>
          {COMPLIANCE.map((row) => (
            <div key={row.label} className={styles.complianceRow}>
              <span className={toneClass("mute")}>{row.label}</span>
              <span className={styles.complianceValue}>{row.value}</span>
            </div>
          ))}
        </Card>
      </div>

      <ErasureCard />
    </section>
  );
}

/** Lets a tenant ask for data they sent to be erased, and lists their requests. */
function ErasureCard() {
  const { erasures } = useAppState();
  const dispatch = useAppDispatch();
  const [scope, setScope] = useState<ErasureScope>(ERASURE_SCOPES[0].scope);
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");

  const placeholder = ERASURE_SCOPES.find((option) => option.scope === scope)?.placeholder;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (erasureNeedsTarget(scope) && !target.trim()) {
      setError("Enter a target for this request.");
      return;
    }
    dispatch({ type: "submitErasure", scope, target });
    setTarget("");
    setError("");
  }

  return (
    <Card className={cx(layout.panel, layout.pad18, layout.gap14)}>
      <div className={styles.erasureTitle}>Request erasure</div>
      <p className={styles.erasureIntro}>
        Session hashes use a salt that rotates every 24 hours and is then deleted, so past sessions cannot be linked to
        a person. Erasure applies to data you sent yourself, such as custom event properties.
      </p>

      <form className={styles.erasureForm} onSubmit={submit}>
        <div className={styles.scope}>
          <span className={text.eyebrow} id="erasure-scope">
            Scope
          </span>
          <div className={styles.scopeOptions} role="group" aria-labelledby="erasure-scope">
            {ERASURE_SCOPES.map((option) => (
              <Chip
                key={option.scope}
                className={styles.scopeOption}
                pressed={option.scope === scope}
                onClick={() => {
                  setScope(option.scope);
                  setError("");
                }}
              >
                {option.scope}
              </Chip>
            ))}
          </div>
        </div>
        <Field
          className={styles.target}
          label="Target"
          value={target}
          onChange={(event) => {
            setTarget(event.target.value);
            setError("");
          }}
          placeholder={placeholder}
        />
        <Button type="submit">Submit request</Button>
      </form>
      <span className={field.error} role="alert">
        {error}
      </span>

      <div className={styles.requestsScroll}>
        <div className={styles.requests} role="table" aria-label="Erasure requests">
          <div className={cx(text.eyebrow, styles.requestsHead)} role="row">
            <span role="columnheader">ID</span>
            <span role="columnheader">Scope</span>
            <span role="columnheader">Target</span>
            <span role="columnheader">Status</span>
          </div>
          {erasures.map((request) => (
            <div key={request.id} className={styles.requestsRow} role="row">
              <span role="cell" className={toneClass("mute")}>{request.id}</span>
              <span role="cell">{request.scope}</span>
              <span role="cell" className={styles.requestTarget}>{request.target}</span>
              <span role="cell" className={toneClass(request.status === "Completed" ? "ok" : "warn")}>
                {request.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
