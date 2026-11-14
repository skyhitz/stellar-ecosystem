import { cx } from "@/lib/format";
import styles from "./segmented.module.css";

interface SegmentedProps<T extends string> {
  /** Accessible name for the group, e.g. "Time range". */
  label: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  size?: "md" | "lg";
}

/** Single-choice control: one option is always selected. */
export function Segmented<T extends string>({ label, options, value, onChange, size = "md" }: SegmentedProps<T>) {
  return (
    <div className={styles.group} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cx(styles.item, styles[size])}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
