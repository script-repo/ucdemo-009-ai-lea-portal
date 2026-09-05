import { Icon } from "@/icons";

export type AuditEntry = {
  id: string;
  timestamp: string | Date;
  actor: string;
  action: string;
  /** When the entry represents an AI action, set this to highlight it. */
  ai?: boolean;
};

type AuditTrailProps = {
  title?: string;
  entries: AuditEntry[];
};

/**
 * Compact audit log strip.
 *
 * Every state change — including AI generations, accepts, rejects,
 * reveals — should be appended here. The intent is that an officer (or
 * an auditor) can reconstruct exactly what happened, when, by whom,
 * and which actions were AI-driven.
 */
export function AuditTrail({ title = "Audit trail", entries }: AuditTrailProps) {
  return (
    <div className="audit-trail">
      <div className="audit-trail__header">
        <Icon name="clock" size={14} />
        <span>{title}</span>
      </div>
      <div className="audit-trail__list">
        {entries.length === 0 && (
          <div
            className="audit-trail__item"
            style={{
              fontFamily: "var(--font-ui)",
              color: "var(--aisp-text-muted)",
              gridTemplateColumns: "1fr",
            }}
          >
            No audit events yet.
          </div>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className="audit-trail__item">
            <span className="audit-trail__time">
              {typeof entry.timestamp === "string"
                ? entry.timestamp
                : entry.timestamp.toLocaleTimeString()}
            </span>
            <span className="audit-trail__actor">{entry.actor}</span>
            <span
              className={`audit-trail__action${
                entry.ai ? " audit-trail__action--ai" : ""
              }`}
            >
              {entry.action}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
