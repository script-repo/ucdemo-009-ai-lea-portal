import { Icon, type IconName } from "@/icons";

export type Source = {
  id: string;
  label: string;
  icon?: IconName;
  description?: string;
};

type SourceSelectorProps = {
  title?: string;
  sources: Source[];
  selectedIds: string[];
  onToggle: (id: string) => void;
};

/**
 * Lets the officer constrain WHICH records the AI is allowed to draw
 * from on a given turn. This is the single most important
 * accountability control in any RAG-based law-enforcement AI feature:
 * the officer always knows exactly what was in scope.
 */
export function SourceSelector({
  title = "Sources in scope",
  sources,
  selectedIds,
  onToggle,
}: SourceSelectorProps) {
  return (
    <div className="source-selector">
      <div className="source-selector__header">
        <Icon name="folder" size={14} />
        <span>{title}</span>
        <span style={{ marginLeft: "auto", color: "var(--aisp-text-muted)" }}>
          {selectedIds.length}/{sources.length} selected
        </span>
      </div>
      <div className="source-selector__list">
        {sources.map((s) => {
          const checked = selectedIds.includes(s.id);
          return (
            <label
              key={s.id}
              className="source-selector__item"
              style={{ cursor: "pointer" }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(s.id)}
              />
              <span>
                <span style={{ fontWeight: 600 }}>{s.label}</span>
                {s.description && (
                  <span
                    style={{
                      display: "block",
                      color: "var(--aisp-text-muted)",
                      fontSize: "var(--font-size-xs)",
                    }}
                  >
                    {s.description}
                  </span>
                )}
              </span>
              {s.icon && (
                <Icon
                  name={s.icon}
                  size={14}
                  style={{ color: "var(--aisp-text-muted)" }}
                />
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}
