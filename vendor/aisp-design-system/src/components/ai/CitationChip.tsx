import type { ReactNode } from "react";

export type Citation = {
  /** Sequential index displayed in the chip. */
  index: number;
  /** Human-readable title — e.g. "Officer note 230000045-7". */
  title: string;
  /** Source metadata — date, author, record number, etc. */
  meta?: ReactNode;
  /** Where the chip / source row should navigate. */
  href?: string;
  /** Click handler (preferred over `href` for in-app navigation). */
  onOpen?: () => void;
};

type CitationChipProps = {
  citation: Citation;
};

/**
 * Inline citation chip — small numbered badge anchored to an AI claim.
 *
 * EVERY substantive claim in an AI response that came from a record
 * MUST have a citation chip. Unsourced claims should be visually
 * marked (see ConfidenceBadge="low") or removed.
 */
export function CitationChip({ citation }: CitationChipProps) {
  const { index, title, href, onOpen } = citation;
  const Tag = href ? "a" : "button";
  const props =
    Tag === "a"
      ? { href }
      : { type: "button" as const, onClick: onOpen };

  return (
    <Tag
      className="citation-chip"
      title={title}
      aria-label={`Source ${index}: ${title}`}
      {...props}
    >
      {index}
    </Tag>
  );
}

type CitationSourcesProps = {
  citations: Citation[];
};

/** Renders the full "Sources" list (typically at the foot of a response). */
export function CitationSources({ citations }: CitationSourcesProps) {
  if (citations.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {citations.map((c) => (
        <SourceRow key={c.index} citation={c} />
      ))}
    </div>
  );
}

function SourceRow({ citation }: { citation: Citation }) {
  const { index, title, meta, href, onOpen } = citation;
  return (
    <div className="citation-source">
      <span className="citation-source__index">{index}</span>
      <div>
        <div className="citation-source__title">
          {href ? (
            <a href={href}>{title}</a>
          ) : onOpen ? (
            <button
              type="button"
              onClick={onOpen}
              style={{
                background: "none",
                border: 0,
                padding: 0,
                color: "var(--aisp-link)",
                cursor: "pointer",
                font: "inherit",
              }}
            >
              {title}
            </button>
          ) : (
            title
          )}
        </div>
        {meta && <div className="citation-source__meta">{meta}</div>}
      </div>
    </div>
  );
}
