import type { ReactNode } from "react";
import { Icon, type IconName } from "@/icons";

export type RecordRowProps = {
  role?: string;
  title: ReactNode;
  meta?: ReactNode;
  summary?: ReactNode;
  actions?: ReactNode;
  iconName?: IconName;
  iconNode?: ReactNode;
  onOpen?: () => void;
};

/**
 * One row in the active-items / search-results list (spec §11).
 *
 * Layout:
 *   [icon circle] [body: role, title, meta, summary, actions] [chevron]
 */
export function RecordRow({
  role,
  title,
  meta,
  summary,
  actions,
  iconName = "document",
  iconNode,
  onOpen,
}: RecordRowProps) {
  return (
    <article className="record-row">
      <div className="record-row__icon">
        <span className="record-icon-circle">
          {iconNode ?? <Icon name={iconName} size={18} />}
        </span>
      </div>
      <div className="record-row__body">
        {role && <div className="record-row__role">[{role}]</div>}
        <div className="record-row__title">{title}</div>
        {meta && <div className="record-row__meta">{meta}</div>}
        {summary && <div className="record-row__summary">{summary}</div>}
        {actions && <div className="record-row__actions">{actions}</div>}
      </div>
      <div className="record-row__chevron">
        <button
          type="button"
          className="record-chevron-circle"
          onClick={onOpen}
          aria-label="Open record"
        >
          <Icon name="chevron-right" size={18} />
        </button>
      </div>
    </article>
  );
}

type RecordListProps = {
  title: ReactNode;
  count?: number;
  sortLabel?: string;
  children: ReactNode;
};

export function RecordList({
  title,
  count,
  sortLabel,
  children,
}: RecordListProps) {
  return (
    <>
      <div className="list-header">
        <div className="list-header__title">
          {title}
          {typeof count === "number" && (
            <span className="section__count"> ({count})</span>
          )}
        </div>
        {sortLabel && (
          <div className="list-header__sort">Sorted by: {sortLabel}</div>
        )}
      </div>
      <div className="record-list">{children}</div>
    </>
  );
}
