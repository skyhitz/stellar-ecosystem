"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import segmented from "@/components/ui/segmented.module.css";
import { cx } from "@/lib/format";
import { ROLES, TABS, roleForPath } from "@/lib/routes";
import styles from "./SiteHeader.module.css";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  const pathname = usePathname();
  const role = roleForPath(pathname);

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        ./stellar-ecosystem-stats
      </Link>

      <nav className={styles.tabs} aria-label="Sections">
        {TABS[role].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={styles.tab}
            aria-current={pathname === tab.href ? "page" : undefined}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className={styles.controls}>
        {/* Stands in for sign-in: each role opens the area that role would see. */}
        <nav className={segmented.group} aria-label="View as">
          {ROLES.map((item) => (
            <Link
              key={item.role}
              href={item.href}
              className={cx(segmented.item, segmented.sm)}
              aria-current={item.role === role ? "true" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
