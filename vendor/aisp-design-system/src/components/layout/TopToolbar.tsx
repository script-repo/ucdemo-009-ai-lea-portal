import type { ReactNode } from "react";
import { Icon, type IconName } from "@/icons";

export type ToolbarAction = {
  id: string;
  icon: IconName;
  label: string;
  onClick?: () => void;
};

type TopToolbarProps = {
  leftActions?: ToolbarAction[];
  rightActions?: ToolbarAction[];
  user?: { name: string; role?: string };
  children?: ReactNode;
};

/**
 * Light top toolbar across the main area (spec §5).
 *
 * Hosts back/forward, action icons, user pill, overflow menu.
 * Sits ABOVE the dark context header.
 */
export function TopToolbar({
  leftActions = [],
  rightActions = [],
  user,
  children,
}: TopToolbarProps) {
  return (
    <div className="top-toolbar">
      <div className="top-toolbar__left">
        {leftActions.map((action) => (
          <ToolbarButton key={action.id} action={action} />
        ))}
        {children}
      </div>
      <div className="top-toolbar__right">
        {user && (
          <div className="toolbar-user">
            <div>{user.name}</div>
            {user.role && <div style={{ opacity: 0.65 }}>{user.role}</div>}
          </div>
        )}
        {rightActions.map((action) => (
          <ToolbarButton key={action.id} action={action} />
        ))}
      </div>
    </div>
  );
}

function ToolbarButton({ action }: { action: ToolbarAction }) {
  return (
    <button
      type="button"
      className="toolbar-button"
      onClick={action.onClick}
      aria-label={action.label}
      title={action.label}
    >
      <Icon name={action.icon} />
    </button>
  );
}
