import localFont from "next/font/local";

/*
 * Both fonts are self-hosted so the app never contacts a font CDN. Each file is
 * a variable font, declared only at the weights the design uses. A weight in
 * between then resolves to the nearest declared face, e.g. 600 renders as 700.
 */

/** JetBrains Mono: body text, labels and figures. */
export const jetbrainsMono = localFont({
  src: [
    { path: "./jetbrains-mono-latin-wght-normal.woff2", weight: "400", style: "normal" },
    { path: "./jetbrains-mono-latin-wght-normal.woff2", weight: "500", style: "normal" },
    { path: "./jetbrains-mono-latin-wght-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
  // Symbols the font lacks (■ ● ▲ →) should come from the system monospace
  // font, not from a metric-adjusted Arial.
  adjustFontFallback: false,
});

/** Unbounded: headings and hero figures. */
export const unbounded = localFont({
  src: [
    { path: "./unbounded-latin-wght-normal.woff2", weight: "500", style: "normal" },
    { path: "./unbounded-latin-wght-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});
