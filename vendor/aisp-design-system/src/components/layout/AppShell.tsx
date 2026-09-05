import type { ReactNode } from "react";

type AppShellProps = {
  iconRail: ReactNode;
  sidePanel?: ReactNode;
  children: ReactNode;
};

/**
 * The three-zone application frame defined in spec §4.1:
 *   [icon rail] [side panel] [main]
 *
 * When `sidePanel` is omitted the grid collapses to two columns so
 * use cases that don't need a side panel still feel native.
 */
export function AppShell({ iconRail, sidePanel, children }: AppShellProps) {
  return (
    <div className={`aisp-app${sidePanel ? "" : " aisp-app--no-side-panel"}`}>
      {iconRail}
      {sidePanel}
      <div className="main">{children}</div>
    </div>
  );
}
