/**
 * Backend mode configuration.
 *
 * Determines whether every service call is served by the in-browser
 * `simulated` implementation or proxied to the real Nutanix-hosted
 * services. Persisted to `localStorage` so refreshes survive.
 *
 * Pivot to real infra:
 *   1. Save Nutanix Enterprise AI (and optional OpenRouter) settings
 *      on the Resources page. Keys stay in this browser.
 *   2. Flip the toggle in the portal's "Infrastructure" panel.
 *   3. Completions try Nutanix Enterprise AI first, then OpenRouter.
 *      Other services still read `VITE_AISP_*` URLs when configured.
 */

import type { BackendMode } from "./types";

const STORAGE_KEY = "aisp.backend.mode";
const DEFAULT_MODE: BackendMode = "simulated";

type Listener = (mode: BackendMode) => void;
const listeners = new Set<Listener>();

export function getBackendMode(): BackendMode {
  if (typeof window === "undefined") return DEFAULT_MODE;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "real" ? "real" : DEFAULT_MODE;
}

export function setBackendMode(mode: BackendMode): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, mode);
  for (const l of listeners) l(mode);
}

export function subscribeBackendMode(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Endpoint config for the real implementations. Only consulted when
 * `mode === "real"`. Reads at startup; set via Vite env vars or by
 * editing this file before deployment.
 */
export interface RealEndpoints {
  inferenceBaseUrl: string;
  vectorBaseUrl: string;
  relationalBaseUrl: string;
  objectStorageBaseUrl: string;
  virtualizationBaseUrl: string;
  kubernetesBaseUrl: string;
}

function envOr(key: string, fallback: string): string {
  // Vite exposes import.meta.env at build time. Fall back gracefully
  // if a key isn't set (the real client will surface the missing-config
  // error to the user when an actual call is attempted).
  const v = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.[key];
  return v ?? fallback;
}

export function getRealEndpoints(): RealEndpoints {
  return {
    inferenceBaseUrl: envOr("VITE_AISP_INFERENCE_URL", ""),
    vectorBaseUrl: envOr("VITE_AISP_VECTOR_URL", ""),
    relationalBaseUrl: envOr("VITE_AISP_RELATIONAL_URL", ""),
    objectStorageBaseUrl: envOr("VITE_AISP_OBJECT_STORAGE_URL", ""),
    virtualizationBaseUrl: envOr("VITE_AISP_VIRTUALIZATION_URL", ""),
    kubernetesBaseUrl: envOr("VITE_AISP_KUBERNETES_URL", ""),
  };
}
