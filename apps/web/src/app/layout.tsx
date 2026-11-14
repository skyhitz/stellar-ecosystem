import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/shell/SiteFooter";
import { SiteHeader } from "@/components/shell/SiteHeader";
import { jetbrainsMono, unbounded } from "@/fonts";
import { DEFAULT_THEME, THEME_INIT_SCRIPT } from "@/lib/theme";
import { AppStateProvider } from "@/state/app-state";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Stellar Ecosystem Stats",
    template: "%s · Stellar Ecosystem Stats",
  },
  description:
    "Privacy-first web analytics and OpenTelemetry API metrics for every project in the Stellar ecosystem. One snippet, no cookies, no fees.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The inline script may change data-theme before React hydrates.
    <html lang="en" data-theme={DEFAULT_THEME} className={`${jetbrainsMono.variable} ${unbounded.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <AppStateProvider>
          <div className="frame">
            <div className="column">
              <SiteHeader />
              <main>{children}</main>
              <SiteFooter />
            </div>
          </div>
        </AppStateProvider>
      </body>
    </html>
  );
}
