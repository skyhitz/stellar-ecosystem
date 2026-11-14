import type { Route } from "next";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cx } from "@/lib/format";
import styles from "./button.module.css";

type Variant = "primary" | "ghost" | "outline" | "text";
type Size = "lg" | "md" | "sm";

interface Appearance {
  variant?: Variant;
  /** Applies to primary and ghost buttons. */
  size?: Size;
  /** Destructive action. Applies to outline buttons. */
  danger?: boolean;
}

function buttonClass({ variant = "primary", size = "lg", danger }: Appearance, className?: string) {
  const sized = variant === "primary" || variant === "ghost";
  return cx(styles.button, styles[variant], sized && styles[size], danger && styles.danger, className);
}

type ButtonProps = Appearance & ComponentPropsWithoutRef<"button">;

export function Button({ variant, size, danger, className, type = "button", ...rest }: ButtonProps) {
  return <button type={type} className={buttonClass({ variant, size, danger }, className)} {...rest} />;
}

type ButtonLinkProps = Appearance &
  Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & { href: Route };

/** A navigation link that looks like a button. */
export function ButtonLink({ variant, size, danger, className, ...rest }: ButtonLinkProps) {
  return <Link className={buttonClass({ variant, size, danger }, className)} {...rest} />;
}
