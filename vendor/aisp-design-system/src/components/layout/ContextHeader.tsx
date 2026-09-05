import type { ReactNode } from "react";
import { Icon, type IconName } from "@/icons";

type ContextHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: IconName;
  actions?: ReactNode;
};

/**
 * Dark charcoal context header at the top of the workspace (spec §6).
 *
 * This is the operational "where am I" indicator. Use it on every page —
 * its consistent presence is what makes the records portal feel native.
 *
 * Examples:
 *   <ContextHeader title="AISP" subtitle="AI Services Portal" />
 *   <ContextHeader
 *     title="#230000045 - Occurrence IR guided entry form"
 *     subtitle="Created 2026-05-11 by Officer Brand"
 *     icon="document"
 *   />
 */
export function ContextHeader({
  title,
  subtitle,
  icon,
  actions,
}: ContextHeaderProps) {
  return (
    <header className="context-header">
      {icon && (
        <span className="context-header__icon">
          <Icon name={icon} size={22} />
        </span>
      )}
      <div className="context-header__body">
        <div className="context-header__title">{title}</div>
        {subtitle && (
          <div className="context-header__subtitle">{subtitle}</div>
        )}
      </div>
      {actions && <div className="context-header__actions">{actions}</div>}
    </header>
  );
}
