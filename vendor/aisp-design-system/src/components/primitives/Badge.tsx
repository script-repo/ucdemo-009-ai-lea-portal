import type { ReactNode } from "react";

export type BadgeVariant =
  | "default"
  | "blue"
  | "ok"
  | "warning"
  | "error"
  | "ai";

type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
};

/**
 * Inline status / metadata badge.
 *
 * Always paired with a text label — badges are not used decoratively.
 * Use sparingly; the dense AISP UI relies on type + borders, not chips.
 */
export function Badge({ variant = "default", children }: BadgeProps) {
  const cls = variant === "default" ? "badge" : `badge badge--${variant}`;
  return <span className={cls}>{children}</span>;
}
