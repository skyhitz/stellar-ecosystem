"use client";

import { ButtonLink } from "@/components/ui/Button";
import { useAppDispatch } from "@/state/app-state";

/** The landing call to action. Always opens enrollment at its first step. */
export function EnrollLink() {
  const dispatch = useAppDispatch();
  return (
    <ButtonLink href="/enroll" onClick={() => dispatch({ type: "restartEnrollment" })}>
      Enroll your project →
    </ButtonLink>
  );
}
