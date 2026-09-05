import { useState, type ReactNode } from "react";
import { Icon } from "@/icons";

type SectionProps = {
  title: ReactNode;
  count?: number;
  meta?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  flush?: boolean;
};

/**
 * Section / accordion pattern (spec §9).
 *
 * Header strip with light blue-grey background, body white.
 * Optional count rendered in parentheses, like "Active items (3)".
 */
export function Section({
  title,
  count,
  meta,
  trailing,
  children,
  collapsible = false,
  defaultOpen = true,
  flush = false,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isCollapsed = collapsible && !open;

  return (
    <section
      className={[
        "section",
        collapsible && "section--collapsible",
        isCollapsed && "section--collapsed",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header
        className="section__header"
        onClick={collapsible ? () => setOpen((v) => !v) : undefined}
      >
        {collapsible && (
          <Icon
            name={open ? "chevron-down" : "chevron-right"}
            size={14}
            style={{ color: "var(--aisp-text-muted)" }}
          />
        )}
        <span className="section__title">
          {title}
          {typeof count === "number" && (
            <span className="section__count"> ({count})</span>
          )}
        </span>
        {(meta || trailing) && (
          <span className="section__meta">
            {meta}
            {trailing}
          </span>
        )}
      </header>
      {!isCollapsed && (
        <div className={`section__body${flush ? " section__body--flush" : ""}`}>
          {children}
        </div>
      )}
    </section>
  );
}
