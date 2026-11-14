import type { Tone } from "@/data/types";
import styles from "./tone.module.css";

/** Text colour class for a tone. */
export function toneClass(tone: Tone): string {
  return styles[tone];
}

/** The colour token behind a tone, for backgrounds and SVG fills. */
export const TONE_COLOR: Record<Tone, string> = {
  ok: "var(--ok)",
  warn: "var(--warn)",
  bad: "var(--bad)",
  accent: "var(--acc)",
  mute: "var(--mute)",
};
