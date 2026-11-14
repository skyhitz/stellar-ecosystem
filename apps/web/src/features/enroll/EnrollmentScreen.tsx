"use client";

import { useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import card from "@/components/ui/card.module.css";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Field } from "@/components/ui/Field";
import field from "@/components/ui/field.module.css";
import layout from "@/components/ui/layout.module.css";
import { PageHeading } from "@/components/ui/PageHeading";
import text from "@/components/ui/text.module.css";
import { toneClass } from "@/components/ui/tone";
import { useCopy } from "@/components/ui/useCopy";
import {
  siteIdFor,
  validateEnrollment,
  type EnrollmentErrors,
  type EnrollmentField,
  type EnrollmentForm,
} from "@/data/enrollment";
import { OTEL_COLLECTOR_CONFIG, OTEL_FILE, OTEL_NOTE, TRACKER, trackerTag } from "@/data/setup";
import { cx } from "@/lib/format";
import { useAppDispatch, useAppState } from "@/state/app-state";
import styles from "./enroll.module.css";

const STEPS = ["Project", "Install", "Verify"];

export function EnrollmentScreen() {
  const { step, form, verified } = useAppState().enrollment;

  return (
    <section className={styles.enroll}>
      <PageHeading crumb="// ENROLLMENT" title="Enroll a project" />
      <ol className={styles.steps}>
        {STEPS.map((label, i) => {
          const number = i + 1;
          return (
            <li
              key={label}
              className={cx(styles.step, step >= number && styles.reached)}
              aria-current={step === number ? "step" : undefined}
            >
              {String(number).padStart(2, "0")} · {label}
            </li>
          );
        })}
      </ol>
      {step === 1 && <ProjectStep form={form} />}
      {step === 2 && <InstallStep form={form} />}
      {step === 3 && <VerifyStep form={form} verified={verified} />}
    </section>
  );
}

/** Step 1: who is enrolling and what they want to measure. */
function ProjectStep({ form }: { form: EnrollmentForm }) {
  const dispatch = useAppDispatch();
  const [errors, setErrors] = useState<EnrollmentErrors>({});

  function update(patch: Partial<EnrollmentForm>, clears: EnrollmentField) {
    dispatch({ type: "updateEnrollmentForm", patch });
    setErrors((current) => ({ ...current, [clears]: undefined }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const found = validateEnrollment(form);
    setErrors(found);
    if (Object.keys(found).length === 0) dispatch({ type: "setEnrollmentStep", step: 2 });
  }

  return (
    <form className={cx(card.card, styles.form)} noValidate onSubmit={submit}>
      <Field
        label="Project name"
        value={form.name}
        onChange={(event) => update({ name: event.target.value }, "name")}
        placeholder="Skyhitz"
        autoComplete="organization"
        error={errors.name ?? ""}
      />
      <Field
        label="Website domain"
        value={form.domain}
        onChange={(event) => update({ domain: event.target.value }, "domain")}
        placeholder="skyhitz.io"
        inputMode="url"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        error={errors.domain ?? ""}
      />
      <Field
        label="Contact email"
        type="email"
        value={form.email}
        onChange={(event) => update({ email: event.target.value }, "email")}
        placeholder="team@skyhitz.io"
        autoComplete="email"
        error={errors.email ?? ""}
      />

      <div className={styles.kinds}>
        <span className={text.eyebrow} id="enroll-kinds">
          What do you want to measure?
        </span>
        <div className={styles.kindOptions} role="group" aria-labelledby="enroll-kinds">
          <KindOption
            title="Website"
            hint="Frontend script"
            checked={form.web}
            onToggle={() => update({ web: !form.web }, "kind")}
          />
          <KindOption
            title="API"
            hint="OpenTelemetry dual export"
            checked={form.api}
            onToggle={() => update({ api: !form.api }, "kind")}
          />
        </div>
        <span className={field.error} role="alert">
          {errors.kind ?? ""}
        </span>
      </div>

      <p className={text.note}>
        Enrollment is open to any project built on Stellar. SCF operators may remove projects that are not part of the
        ecosystem.
      </p>
      <div>
        <Button type="submit">Continue →</Button>
      </div>
    </form>
  );
}

interface KindOptionProps {
  title: string;
  hint: string;
  checked: boolean;
  onToggle: () => void;
}

function KindOption({ title, hint, checked, onToggle }: KindOptionProps) {
  return (
    <button type="button" className={styles.kind} role="checkbox" aria-checked={checked} onClick={onToggle}>
      <span className={styles.kindTitle}>
        <span aria-hidden="true">{checked ? "[x]" : "[ ]"}</span> {title}
      </span>
      <span className={styles.kindHint}>{hint}</span>
    </button>
  );
}

/** Step 2: the snippet to install. A website gets the script tag; an API-only project gets the collector config. */
function InstallStep({ form }: { form: EnrollmentForm }) {
  const dispatch = useAppDispatch();
  const [copied, copy] = useCopy();

  const install = form.web
    ? {
        target: form.domain.trim(),
        snippet: trackerTag(siteIdFor(form.name)),
        note: `The script is pinned to ${TRACKER.version} and verified by its integrity hash. It will never change without you editing this tag.`,
      }
    : { target: OTEL_FILE, snippet: OTEL_COLLECTOR_CONFIG, note: OTEL_NOTE };

  return (
    <Card className={cx(layout.panel, layout.pad22, layout.gap14)}>
      <div className={styles.panelTitle}>Add this to {install.target}</div>
      <CodeBlock code={install.snippet} />
      <p className={text.note}>{install.note}</p>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={() => copy(install.snippet)}>
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button onClick={() => dispatch({ type: "setEnrollmentStep", step: 3 })}>I&apos;ve added it →</Button>
        <Button variant="text" onClick={() => dispatch({ type: "setEnrollmentStep", step: 1 })}>
          Back
        </Button>
      </div>
    </Card>
  );
}

/** Step 3: wait for the first event. There is no ingestion yet, so arrival is simulated. */
function VerifyStep({ form, verified }: { form: EnrollmentForm; verified: boolean }) {
  const dispatch = useAppDispatch();
  const domain = form.domain.trim();

  const waitingFor = form.web
    ? `Open ${domain} in a browser. This page updates when the first page view arrives.`
    : "Send a request to your API. This page updates when the first request arrives.";

  return (
    <Card className={cx(layout.panel, layout.pad22, layout.gap14)}>
      <div className={cx(styles.panelTitle, toneClass(verified ? "ok" : "warn"))} aria-live="polite">
        {verified ? "● First event received" : "○ Waiting for the first event…"}
      </div>
      <p className={styles.body}>
        {verified ? `Data from ${domain} is flowing. Your dashboard is private to your team.` : waitingFor}
      </p>
      <div className={styles.actions}>
        {verified ? (
          <ButtonLink href="/tenant/web">Open dashboard →</ButtonLink>
        ) : (
          <Button variant="ghost" onClick={() => dispatch({ type: "markEnrollmentVerified" })}>
            Simulate first event
          </Button>
        )}
      </div>
    </Card>
  );
}
