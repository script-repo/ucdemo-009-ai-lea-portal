import type { ReactNode } from "react";
import { Icon } from "@/icons";

type AISuggestionProps = {
  children: ReactNode;
  onAccept?: () => void;
  onDismiss?: () => void;
  acceptLabel?: string;
  dismissLabel?: string;
};

/**
 * Inline AI suggestion (appears under or next to a form field).
 *
 * Use when the AI proposes a single small change ("did you mean…?"),
 * not when it generates a multi-paragraph artifact (use AIResponseCard
 * for that).
 *
 * Both the accept and dismiss actions should fire audit events.
 */
export function AISuggestion({
  children,
  onAccept,
  onDismiss,
  acceptLabel = "Use",
  dismissLabel = "Dismiss",
}: AISuggestionProps) {
  return (
    <div className="ai-suggestion" role="note">
      <span className="ai-suggestion__icon">
        <Icon name="sparkles" size={14} />
      </span>
      <div className="ai-suggestion__body">{children}</div>
      <div className="ai-suggestion__actions">
        {onAccept && (
          <button
            type="button"
            className="btn btn--ai btn--sm"
            onClick={onAccept}
          >
            {acceptLabel}
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={onDismiss}
          >
            {dismissLabel}
          </button>
        )}
      </div>
    </div>
  );
}
