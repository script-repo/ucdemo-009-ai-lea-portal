import { getRealEndpoints } from "../config";
import type {
  ServiceResponse,
  VectorClient,
  VectorQueryRequest,
  VectorQueryResult,
} from "../types";

function notConfigured(method: string, url: string): never {
  throw new Error(
    `Real vector backend not configured for ${method} (would call ${url || "<unset>"}). ` +
      `Set VITE_AISP_VECTOR_URL and implement the endpoint shim.`,
  );
}

async function timed<T>(fn: () => Promise<T>): Promise<{ data: T; latencyMs: number }> {
  const start = performance.now();
  const data = await fn();
  return { data, latencyMs: Math.round(performance.now() - start) };
}

export const realVector: VectorClient = {
  async query(req: VectorQueryRequest): Promise<ServiceResponse<VectorQueryResult>> {
    const url = getRealEndpoints().vectorBaseUrl + "/v1/query";
    if (!getRealEndpoints().vectorBaseUrl) notConfigured("query", url);
    const { data, latencyMs } = await timed(async () => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      if (!res.ok) throw new Error(`Vector HTTP ${res.status}`);
      return (await res.json()) as VectorQueryResult;
    });
    return {
      data,
      provenance: { mode: "real", service: "vector", source: url, latencyMs },
    };
  },

  async listCollections() {
    const url = getRealEndpoints().vectorBaseUrl + "/v1/collections";
    if (!getRealEndpoints().vectorBaseUrl) notConfigured("listCollections", url);
    const { data, latencyMs } = await timed(async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Vector HTTP ${res.status}`);
      return (await res.json()) as { collections: string[] };
    });
    return {
      data,
      provenance: { mode: "real", service: "vector", source: url, latencyMs },
    };
  },
};
