/**
 * Client-side inference endpoint settings.
 *
 * Stores Nutanix Enterprise AI and OpenRouter configuration in
 * localStorage only. Keys never leave the browser except as a
 * transient Authorization header on a request the operator starts.
 * Working pattern from the Legal AI portal; this file is the
 * TypeScript port used by the AISP Resources page and gateway.
 */

export type InferenceProviderId = "nai" | "openrouter";

export interface ProviderSettings {
  enabled: boolean;
  baseUrl: string;
  apiKey: string;
  model: string;
  models: string[];
  lastTestOk: boolean | null;
  lastTestedAt: string | null;
}

export interface InferenceSettings {
  version: 1;
  providers: Record<InferenceProviderId, ProviderSettings>;
}

export const INFERENCE_SETTINGS_KEY = "aisp.inference.settings.v1";

export const PROVIDER_META: Record<
  InferenceProviderId,
  {
    id: InferenceProviderId;
    label: string;
    priority: number;
    priorityLabel: string;
    defaultBaseUrl: string;
    hint: string;
  }
> = {
  nai: {
    id: "nai",
    label: "Nutanix Enterprise AI",
    priority: 1,
    priorityLabel: "Primary",
    defaultBaseUrl: "https://nai.hpoc.nutanix.com:443/api/v1",
    hint: "OpenAI-compatible endpoint. Tried first whenever it is enabled with a key and model.",
  },
  openrouter: {
    id: "openrouter",
    label: "OpenRouter",
    priority: 2,
    priorityLabel: "Fallback",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    hint: "Used only if Nutanix Enterprise AI fails or is not configured. Create a key at openrouter.ai/keys.",
  },
};

type Listener = (settings: InferenceSettings) => void;
const listeners = new Set<Listener>();

function defaultProvider(id: InferenceProviderId): ProviderSettings {
  return {
    enabled: false,
    baseUrl: PROVIDER_META[id].defaultBaseUrl,
    apiKey: "",
    model: "",
    models: [],
    lastTestOk: null,
    lastTestedAt: null,
  };
}

export function defaultInferenceSettings(): InferenceSettings {
  return {
    version: 1,
    providers: {
      nai: defaultProvider("nai"),
      openrouter: defaultProvider("openrouter"),
    },
  };
}

export function normalizeBaseUrl(url: string): string {
  return (url || "").trim().replace(/\/+$/, "");
}

/**
 * Browser calls to NAI / OpenRouter go through a same-origin proxy
 * (`/api/nai`, `/api/openrouter`) so the lab portal is not blocked by
 * CORS. Custom base URLs are left as-is.
 */
export function resolveProviderUrl(baseUrl: string, path: string): string {
  const normalized = normalizeBaseUrl(baseUrl);
  const suffix = path.startsWith("/") ? path : `/${path}`;
  let host = "";
  try {
    host = new URL(normalized).hostname;
  } catch {
    host = "";
  }
  if (host === "nai.hpoc.nutanix.com") return `/api/nai${suffix}`;
  if (host === "openrouter.ai" || host === "www.openrouter.ai") {
    return `/api/openrouter${suffix}`;
  }
  return `${normalized}${suffix}`;
}

export function loadInferenceSettings(): InferenceSettings {
  const base = defaultInferenceSettings();
  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(INFERENCE_SETTINGS_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<InferenceSettings>;
    if (parsed?.providers) {
      base.providers.nai = { ...base.providers.nai, ...parsed.providers.nai };
      base.providers.openrouter = {
        ...base.providers.openrouter,
        ...parsed.providers.openrouter,
      };
    }
    return base;
  } catch {
    return base;
  }
}

export function saveInferenceSettings(settings: InferenceSettings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INFERENCE_SETTINGS_KEY, JSON.stringify(settings));
  for (const listener of listeners) listener(settings);
}

export function clearInferenceSettings(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(INFERENCE_SETTINGS_KEY);
  const next = defaultInferenceSettings();
  for (const listener of listeners) listener(next);
}

export function subscribeInferenceSettings(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isProviderReady(p: ProviderSettings): boolean {
  return Boolean(p.enabled && p.apiKey.trim() && p.model.trim());
}

export function configuredProviders(): InferenceProviderId[] {
  const settings = loadInferenceSettings();
  return (Object.keys(settings.providers) as InferenceProviderId[]).filter((id) =>
    isProviderReady(settings.providers[id]),
  );
}

export async function testProvider(
  baseUrl: string,
  apiKey: string,
): Promise<{ ok: true; models: string[] } | { ok: false; error: string }> {
  const url = resolveProviderUrl(baseUrl, "/models");
  const headers: Record<string, string> = { Accept: "application/json" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch(url, { method: "GET", headers, signal: controller.signal });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}${text ? `: ${text.slice(0, 300)}` : ""}`);
    }
    const json: unknown = await res.json();
    const rawList: unknown[] = Array.isArray(json)
      ? json
      : json && typeof json === "object" && Array.isArray((json as { data?: unknown }).data)
        ? (json as { data: unknown[] }).data
        : [];
    const ids = rawList
      .map((m) => {
        if (typeof m === "string") return m;
        if (m && typeof m === "object") {
          const rec = m as { id?: unknown; name?: unknown; model?: unknown };
          const value = rec.id ?? rec.name ?? rec.model;
          return typeof value === "string" ? value : null;
        }
        return null;
      })
      .filter((id): id is string => Boolean(id));
    ids.sort();
    return { ok: true, models: ids };
  } catch (err) {
    const message =
      err instanceof DOMException && err.name === "AbortError"
        ? "Request timed out after 15s."
        : err instanceof Error
          ? err.message
          : String(err);
    return { ok: false, error: message };
  } finally {
    window.clearTimeout(timer);
  }
}
