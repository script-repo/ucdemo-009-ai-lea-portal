import { Icon } from "@/icons";

export type StatusVariant = "ok" | "warning" | "error" | "info" | "muted";

type StatusDotProps = {
  variant: StatusVariant;
  label?: string;
  showIcon?: boolean;
};

/**
 * Status indicator dot (spec §9 + §10 guided-entry rules).
 *
 * Use cases:
 *   ok      — section is complete
 *   warning — section requires attention / incomplete
 *   error   — section has invalid data
 *   info    — neutral status (e.g. AI-suggested, not yet reviewed)
 *   muted   — section is "not required" / skipped
 */
export function StatusDot({
  variant,
  label,
  showIcon = true,
}: StatusDotProps) {
  const iconName =
    variant === "ok"
      ? "check"
      : variant === "warning"
        ? "alert"
        : variant === "error"
          ? "alert"
          : variant === "info"
            ? "info"
            : null;

  return (
    <span
      className={`status-dot status-dot--${variant}`}
      role={label ? "img" : "presentation"}
      aria-label={label}
      title={label}
    >
      {showIcon && iconName && <Icon name={iconName} size={11} />}
    </span>
  );
}
