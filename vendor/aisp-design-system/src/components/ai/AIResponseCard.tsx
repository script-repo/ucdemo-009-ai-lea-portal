import type { ReactNode } from "react";
import { Icon } from "@/icons";
import { ConfidenceBadge } from "./ConfidenceBadge";
import type { ConfidenceLevel } from "@/tokens";

type AIResponseCardProps = {
  /** "user" responses are rendered as plain quoted blocks. */
  role: "user" | "ai" | "system";
  children: ReactNode;
  model?: string;
  confidence?: ConfidenceLevel;
  timestamp?: string | Date;
  footer?: ReactNode;
  actions?: ReactNode;
  /** Show the small "AI" / "You" header tag. Default true for AI. */
  showHeader?: boolean;
};

/**
 * One turn in an AI conversation.
 *
 * The header carries the model name + confidence so officers can see
 * "who is talking" and "how much should I trust this" at a glance.
 */
export function AIResponseCard({
  role,
  children,
  model,
  confidence,
  timestamp,
  footer,
  actions,
  showHeader,
}: AIResponseCardProps) {
  const isUser = role === "user";
  const headerVisible = showHeader ?? !isUser;

  return (
    <article
      className={`ai-response${isUser ? " ai-response--user" : ""}`}
      data-role={role}
    >
      {headerVisible && (
        <header className="ai-response__header">
          <Icon name={isUser ? "user" : "sparkles"} size={14} />
          <span>{isUser ? "You" : (model ?? "AISP")}</span>
          {confidence && (
            <>
              <span className="ai-response__header-spacer" />
              <ConfidenceBadge level={confidence} />
            </>
          )}
        </header>
      )}
      <div className="ai-response__body">{children}</div>
      {(footer || actions || timestamp) && (
        <footer className="ai-response__footer">
          {footer}
          <span className="ai-response__footer-spacer" />
          {timestamp && (
            <span>
              {typeof timestamp === "string"
                ? timestamp
                : timestamp.toLocaleString()}
            </span>
          )}
          {actions && <span className="ai-response__actions">{actions}</span>}
        </footer>
      )}
    </article>
  );
}
