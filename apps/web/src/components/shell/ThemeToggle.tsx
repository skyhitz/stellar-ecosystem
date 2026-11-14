"use client";

import { useLayoutEffect } from "react";
import { applyTheme, readStoredTheme, saveTheme } from "@/lib/theme";
import styles from "./SiteHeader.module.css";

export function ThemeToggle() {
  // In development, Strict Mode remounts and resets <html> to the attributes
  // React rendered, dropping the theme the inline script applied. Put it back.
  useLayoutEffect(() => {
    const stored = readStoredTheme();
    if (stored) applyTheme(stored);
  }, []);

  function toggle() {
    const current = document.documentElement.getAttribute("data-theme");
    saveTheme(current === "light" ? "dark" : "light");
  }

  return (
    <button type="button" className={styles.theme} onClick={toggle}>
      <span className={styles.toLight}>
        <span className="sr-only">Switch to </span>Light<span className="sr-only"> theme</span>
      </span>
      <span className={styles.toDark}>
        <span className="sr-only">Switch to </span>Dark<span className="sr-only"> theme</span>
      </span>
    </button>
  );
}
