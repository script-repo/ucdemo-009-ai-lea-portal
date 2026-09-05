import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "dark"
  | "outline"
  | "ghost"
  | "ai"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

/**
 * Button (spec §10).
 *
 * Variants:
 *   - primary: institutional blue, the affirmative action
 *   - dark:    charcoal, dismissive / secondary
 *   - outline: bordered blue, low-emphasis alternative
 *   - ghost:   transparent, table-row actions
 *   - ai:      lavender — reserve for AI-generation triggers ONLY,
 *              so officers can visually distinguish "AI did this" from
 *              "the system did this". Never use as default primary.
 *   - danger:  red, destructive
 *
 * Buttons are square-cornered by spec rule. Do not soften them.
 */
export function Button({
  variant = "primary",
  size = "md",
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    "btn",
    `btn--${variant}`,
    size !== "md" && `btn--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={classes} {...rest}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}
