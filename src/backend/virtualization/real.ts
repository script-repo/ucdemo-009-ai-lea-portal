import { getRealEndpoints } from "../config";
import type { VirtualMachine, VirtualizationClient } from "../types";

function notConfigured(method: string, url: string): never {
  throw new Error(
    `Real virtualization backend not configured for ${method} (would call ${url || "<unset>"}). ` +
      `Set VITE_AISP_VIRTUALIZATION_URL and implement the endpoint shim.`,
  );
}

async function timed<T>(fn: () => Promise<T>): Promise<{ data: T; latencyMs: number }> {
  const start = performance.now();
  const data = await fn();
  return { data, latencyMs: Math.round(performance.now() - start) };
}

export const realVirtualization: VirtualizationClient = {
  async list() {
    const url = getRealEndpoints().virtualizationBaseUrl + "/v1/vms";
    if (!getRealEndpoints().virtualizationBaseUrl) notConfigured("list", url);
    const { data, latencyMs } = await timed(async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Virtualization HTTP ${res.status}`);
      return (await res.json()) as { vms: VirtualMachine[] };
    });
    return { data, provenance: { mode: "real", service: "virtualization", source: url, latencyMs } };
  },

  async status(id: string) {
    const url = getRealEndpoints().virtualizationBaseUrl + `/v1/vms/${id}`;
    if (!getRealEndpoints().virtualizationBaseUrl) notConfigured("status", url);
    const { data, latencyMs } = await timed(async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Virtualization HTTP ${res.status}`);
      return (await res.json()) as VirtualMachine;
    });
    return { data, provenance: { mode: "real", service: "virtualization", source: url, latencyMs } };
  },
};
