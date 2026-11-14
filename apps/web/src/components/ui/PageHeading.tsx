import type { ReactNode } from "react";
import styles from "./heading.module.css";
import text from "./text.module.css";

interface PageHeadingProps {
  /** The "// SECTION / PAGE" line. */
  crumb: string;
  title: string;
  /** Controls shown opposite the title, e.g. the time range. */
  children?: ReactNode;
}

export function PageHeading({ crumb, title, children }: PageHeadingProps) {
  const heading = (
    <div>
      <div className={text.crumb}>{crumb}</div>
      <h1 className={text.title}>{title}</h1>
    </div>
  );
  if (!children) return heading;
  return (
    <div className={styles.row}>
      {heading}
      {children}
    </div>
  );
}
