import { useState, type ReactNode } from "react";
import { Icon } from "@/icons";

type SidePanelProps = {
  title: string;
  onClose?: () => void;
  children: ReactNode;
  variant?: "default" | "ai";
};

/**
 * Left assistant / navigation panel (spec §4.3).
 * 260px wide, white background, accordion groups inside.
 *
 * Use `variant="ai"` for AI-driven use cases — applies the subtle
 * lavender background defined in the AI extension tokens.
 */
export function SidePanel({
  title,
  onClose,
  children,
  variant = "default",
}: SidePanelProps) {
  return (
    <aside className={variant === "ai" ? "ai-panel" : "side-panel"}>
      <div className="side-panel__header">
        <div className="side-panel__title">{title}</div>
        {onClose && (
          <button
            type="button"
            className="side-panel__close"
            onClick={onClose}
            aria-label="Close side panel"
          >
            <Icon name="x" size={16} />
          </button>
        )}
      </div>
      {children}
    </aside>
  );
}

type NavGroupProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function NavGroup({ title, children, defaultOpen = true }: NavGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`nav-group${open ? "" : " nav-group--collapsed"}`}>
      <button
        type="button"
        className="nav-group__header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="chevron">
          <Icon name="chevron-down" size={14} />
        </span>
      </button>
      {open && children}
    </div>
  );
}

export type NavItemProps = {
  label: string;
  active?: boolean;
  muted?: boolean;
  onClick?: () => void;
  href?: string;
  trailing?: ReactNode;
};

export function NavItem({
  label,
  active,
  muted,
  onClick,
  href,
  trailing,
}: NavItemProps) {
  const className = [
    "nav-item",
    active && "is-active",
    muted && "nav-item--muted",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span>{label}</span>
      {trailing && <span className="nav-item__status">{trailing}</span>}
    </>
  );

  if (href) {
    return (
      <a className={className} href={href}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  );
}
