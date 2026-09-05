/**
 * Live inference-model identity for the UI.
 *
 * Backing-services panels read this so LLM rows show the model that
 * will run (configured) or the model that just ran (last call), not a
 * hardcoded llama-3.1-70b label.
 */

import { getBackendMode, subscribeBackendMode } from "../config";
import {
  isProviderReady,
  loadInferenceSettings,
  subscribeInferenceSettings,
} from "./settings";

export const SIMULATED_LLM_MODEL = "sim/llama-3.1-70b-instruct";

export interface ActiveInferenceModel {
  model: string;
  providerLabel: string;
  source: "last-call" | "configured" | "simulated";
}

type Listener = (info: ActiveInferenceModel) => void;
const listeners = new Set<Listener>();

let lastCall: {
  mode: ReturnType<typeof getBackendMode>;
  model: string;
  providerLabel: string;
} | null = null;

function notify(): void {
  const info = getActiveInferenceModel();
  for (const listener of listeners) listener(info);
}

export function recordInferenceCall(info: {
  model: string;
  providerLabel: string;
}): void {
  lastCall = {
    mode: getBackendMode(),
    model: info.model,
    providerLabel: info.providerLabel,
  };
  notify();
}

export function getActiveInferenceModel(): ActiveInferenceModel {
  const mode = getBackendMode();
  if (lastCall && lastCall.mode === mode) {
    return {
      model: lastCall.model,
      providerLabel: lastCall.providerLabel,
      source: "last-call",
    };
  }
  if (mode !== "real") {
    return {
      model: SIMULATED_LLM_MODEL,
      providerLabel: "Simulated",
      source: "simulated",
    };
  }
  const settings = loadInferenceSettings();
  if (isProviderReady(settings.providers.nai)) {
    return {
      model: settings.providers.nai.model,
      providerLabel: "Nutanix Enterprise AI",
      source: "configured",
    };
  }
  if (isProviderReady(settings.providers.openrouter)) {
    return {
      model: settings.providers.openrouter.model,
      providerLabel: "OpenRouter (fallback)",
      source: "configured",
    };
  }
  return {
    model: "not configured",
    providerLabel: "Set on Resources",
    source: "configured",
  };
}

export function subscribeActiveInferenceModel(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

if (typeof window !== "undefined") {
  subscribeBackendMode(() => {
    lastCall = null;
    notify();
  });
  subscribeInferenceSettings(() => {
    lastCall = null;
    notify();
  });
}
