"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { copyText } from "@/lib/clipboard";

const CONFIRMATION_MS = 1500;

/**
 * Copies text and reports success for a moment, to drive a "Copied" label.
 * Returns `[copied, copy]`.
 */
export function useCopy(): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Runs when the screen is hidden or unmounted: a stale "Copied" should not be waiting on return.
  useLayoutEffect(
    () => () => {
      clearTimeout(timer.current);
      setCopied(false);
    },
    [],
  );

  const copy = useCallback((text: string) => {
    void copyText(text).then((ok) => {
      if (!ok) return;
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), CONFIRMATION_MS);
    });
  }, []);

  return [copied, copy];
}
