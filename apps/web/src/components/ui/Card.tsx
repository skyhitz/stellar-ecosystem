import type { ComponentPropsWithoutRef } from "react";
import { cx } from "@/lib/format";
import styles from "./card.module.css";

export function Card({ className, ...rest }: ComponentPropsWithoutRef<"div">) {
  return <div className={cx(styles.card, className)} {...rest} />;
}
