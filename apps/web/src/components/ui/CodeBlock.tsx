import { cx } from "@/lib/format";
import styles from "./code.module.css";

/** A snippet to copy. Long lines wrap instead of scrolling. */
export function CodeBlock({ code, roomy }: { code: string; roomy?: boolean }) {
  return <pre className={cx(styles.code, roomy && styles.roomy)}>{code}</pre>;
}
