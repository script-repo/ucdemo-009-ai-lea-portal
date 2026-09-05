import type { ReactNode } from "react";
import { Icon, type IconName } from "@/icons";

export type QuickLinkProps = {
  icon: IconName;
  label: ReactNode;
  onClick?: () => void;
  href?: string;
};

/**
 * Single quick-link row (spec §15).
 *
 * Used inside <QuickLinks> on home page and dashboards. Icon | text | chevron.
 */
export function QuickLink({ icon, label, onClick, href }: QuickLinkProps) {
  const content = (
    <>
      <span className="quick-link-row__icon">
        <Icon name={icon} size={18} />
      </span>
      <span className="quick-link-row__text">{label}</span>
      <span className="quick-link-row__chevron">
        <Icon name="chevron-right" size={16} />
      </span>
    </>
  );

  if (href) {
    return (
      <a className="quick-link-row" href={href}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className="quick-link-row" onClick={onClick}>
      {content}
    </button>
  );
}

export function QuickLinks({ children }: { children: ReactNode }) {
  return <div className="quick-links">{children}</div>;
}
