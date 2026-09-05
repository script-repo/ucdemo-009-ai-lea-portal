import { useState, type ReactNode } from "react";

export type RedactionCategory =
  | "PII"
  | "JUVENILE"
  | "VICTIM"
  | "CONFIDENTIAL"
  | "INFORMANT"
  | "MEDICAL";

type RedactionTokenProps = {
  /** What is being redacted. Shown in the redaction block. */
  category: RedactionCategory;
  /** The actual value, only revealed to authorized roles. */
  value?: ReactNode;
  /** If true, the reveal toggle is shown. */
  revealable?: boolean;
  /** Called when the user reveals the underlying value (audit hook). */
  onReveal?: () => void;
};

/**
 * Inline redaction block.
 *
 * AI surfaces in law-enforcement contexts may surface sensitive
 * information drawn from records (juvenile names, victim contact info,
 * medical history, informant IDs). When the AI emits such content the
 * UI MUST mask it by default. Only an authorized role + an explicit
 * "reveal" action — recorded in the audit trail — should ever expose
 * the raw value.
 *
 * Style note: the block is opaque charcoal, never red. Red is reserved
 * for errors in this design system.
 */
export function RedactionToken({
  category,
  value,
  revealable = false,
  onReveal,
}: RedactionTokenProps) {
  const [revealed, setRevealed] = useState(false);

  function handleClick() {
    if (!revealable) return;
    if (!revealed) onReveal?.();
    setRevealed((v) => !v);
  }

  if (revealed && value !== undefined) {
    return (
      <span
        className="redaction redaction--revealed"
        title={`Revealed: ${category}`}
        onClick={handleClick}
        role={revealable ? "button" : undefined}
        tabIndex={revealable ? 0 : undefined}
      >
        {value}
      </span>
    );
  }

  return (
    <span
      className="redaction"
      title={
        revealable
          ? `Redacted (${category}) — click to reveal`
          : `Redacted (${category})`
      }
      onClick={handleClick}
      role={revealable ? "button" : undefined}
      tabIndex={revealable ? 0 : undefined}
      aria-label={`Redacted ${category.toLowerCase()} information`}
    >
      [{category}]
    </span>
  );
}
