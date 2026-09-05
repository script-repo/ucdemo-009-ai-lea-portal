import type { ReactNode } from "react";

type WorkspaceProps = {
  children: ReactNode;
  narrow?: boolean;
};

/**
 * The scrollable main work area (spec §7).
 *
 * `narrow` caps the width at 960px so dense reading surfaces
 * (notebook narrative, AI response) stay readable on wide monitors.
 */
export function Workspace({ children, narrow }: WorkspaceProps) {
  return (
    <main className={`workspace${narrow ? " workspace--narrow" : ""}`}>
      {children}
    </main>
  );
}
