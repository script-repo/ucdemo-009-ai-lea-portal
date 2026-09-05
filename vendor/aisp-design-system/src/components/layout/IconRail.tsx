import type { ReactNode } from "react";
import { Icon, type IconName } from "@/icons";

export type IconRailItem = {
  id: string;
  icon: IconName;
  label: string;
  onClick?: () => void;
  href?: string;
  active?: boolean;
};

type IconRailProps = {
  items: IconRailItem[];
  footer?: ReactNode;
};

/**
 * Vertical blue icon rail (spec §4.2).
 *
 * - 42px wide
 * - White stroke icons
 * - Active item highlighted with the darker blue
 * - Each button MUST carry an aria-label (we use the `label` field)
 */
export function IconRail({ items, footer }: IconRailProps) {
  return (
    <nav className="icon-rail" aria-label="Primary navigation">
      {items.map((item) => {
        const className = `icon-rail__button${item.active ? " is-active" : ""}`;
        if (item.href) {
          return (
            <a
              key={item.id}
              className={className}
              href={item.href}
              aria-label={item.label}
              title={item.label}
            >
              <Icon name={item.icon} />
            </a>
          );
        }
        return (
          <button
            key={item.id}
            type="button"
            className={className}
            onClick={item.onClick}
            aria-label={item.label}
            title={item.label}
          >
            <Icon name={item.icon} />
          </button>
        );
      })}
      <div className="icon-rail__spacer" />
      {footer}
    </nav>
  );
}
