import { getRealEndpoints } from "../config";
import type { K8sWorkload, KubernetesClient } from "../types";

function notConfigured(method: string, url: string): never {
  throw new Error(
    `Real kubernetes backend not configured for ${method} (would call ${url || "<unset>"}). ` +
      `Set VITE_AISP_KUBERNETES_URL and implement the endpoint shim.`,
  );
}

async function timed<T>(fn: () => Promise<T>): Promise<{ data: T; latencyMs: number }> {
  const start = performance.now();
  const data = await fn();
  return { data, latencyMs: Math.round(performance.now() - start) };
}

export const realKubernetes: KubernetesClient = {
  async listWorkloads(namespace?: string) {
    const base = getRealEndpoints().kubernetesBaseUrl;
    const url = `${base}/v1/workloads${namespace ? `?ns=${encodeURIComponent(namespace)}` : ""}`;
    if (!base) notConfigured("listWorkloads", url);
    const { data, latencyMs } = await timed(async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Kubernetes HTTP ${res.status}`);
      return (await res.json()) as { workloads: K8sWorkload[] };
    });
    return { data, provenance: { mode: "real", service: "kubernetes", source: url, latencyMs } };
  },

  async listNamespaces() {
    const base = getRealEndpoints().kubernetesBaseUrl;
    const url = `${base}/v1/namespaces`;
    if (!base) notConfigured("listNamespaces", url);
    const { data, latencyMs } = await timed(async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Kubernetes HTTP ${res.status}`);
      return (await res.json()) as { namespaces: string[] };
    });
    return { data, provenance: { mode: "real", service: "kubernetes", source: url, latencyMs } };
  },
};
