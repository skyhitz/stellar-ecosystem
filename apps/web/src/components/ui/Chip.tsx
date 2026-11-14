import type { ComponentPropsWithoutRef } from "react";
import { cx } from "@/lib/format";
import styles from "./chip.module.css";

interface ChipProps extends Omit<ComponentPropsWithoutRef<"button">, "aria-pressed"> {
  pressed: boolean;
}

export function Chip({ pressed, className, ...rest }: ChipProps) {
  return <button type="button" className={cx(styles.chip, className)} aria-pressed={pressed} {...rest} />;
}
