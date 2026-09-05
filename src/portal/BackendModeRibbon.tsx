import { useEffect, useState } from "react";
import { Badge, Icon } from "@aisp/components";
import {
  type BackendMode,
  getBackendMode,
  subscribeBackendMode,
} from "../backend";

/**
 * Persistent backend-mode ribbon.
 *
 * Sits below the disclaimer in the portal so officers can see, at a
 * glance, whether the data on screen came from real infrastructure or
 * the simulated layer. Pure composition — uses Badge + Icon from the
 * design system.
 */
export function BackendModeRibbon() {
  const [mode, setMode] = useState<BackendMode>(() => getBackendMode());
  useEffect(() => subscribeBackendMode(setMode), []);

  if (mode === "real") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 10px",
        background: "rgba(46, 125, 50, 0.07)",
        borderBottom: "1px solid var(--aisp-border-soft)",
          fontSize: "var(--font-size-xs)",
          color: "var(--aisp-text-muted)",
        }}
      >
        <Icon name="shield" size={12} />
        <span>
          Backend: <Badge variant="ok">Real</Badge> — completions use
          Nutanix Enterprise AI, then OpenRouter. Configure keys on{" "}
          <strong>Resources</strong>.
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        background: "rgba(176, 116, 0, 0.08)",
        borderBottom: "1px solid var(--aisp-border-soft)",
        fontSize: "var(--font-size-xs)",
        color: "var(--aisp-text-muted)",
      }}
    >
      <Icon name="info" size={12} />
      <span>
        Backend: <Badge variant="warning">Simulated</Badge> — every response
        is served from in-browser fixtures. Switch to real in{" "}
        <strong>Infrastructure</strong>.
      </span>
    </div>
  );
}
