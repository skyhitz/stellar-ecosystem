import type { ComponentPropsWithoutRef } from "react";
import { cx } from "@/lib/format";
import styles from "./field.module.css";
import text from "./text.module.css";

interface FieldProps extends ComponentPropsWithoutRef<"input"> {
  label: string;
  /** Validation message. Pass an empty string to reserve the message slot; omit for no slot. */
  error?: string;
}

/** A labelled text input with an optional validation message underneath. */
export function Field({ label, error, className, ...input }: FieldProps) {
  return (
    <label className={cx(styles.field, className)}>
      <span className={text.eyebrow}>{label}</span>
      <input className={styles.input} aria-invalid={error ? true : undefined} {...input} />
      {error !== undefined && (
        <span className={styles.error} role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
