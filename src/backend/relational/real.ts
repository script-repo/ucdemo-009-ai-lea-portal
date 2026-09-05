import { getRealEndpoints } from "../config";
import type {
  RelationalClient,
  RelationalQueryRequest,
  RelationalQueryResult,
  ServiceResponse,
} from "../types";

function notConfigured(method: string, url: string): never {
  throw new Error(
    `Real relational backend not configured for ${method} (would call ${url || "<unset>"}). ` +
      `Set VITE_AISP_RELATIONAL_URL and implement the endpoint shim.`,
  );
}

async function timed<T>(fn: () => Promise<T>): Promise<{ data: T; latencyMs: number }> {
  const start = performance.now();
  const data = await fn();
  return { data, latencyMs: Math.round(performance.now() - start) };
}

export const realRelational: RelationalClient = {
  async query<T = Record<string, unknown>>(req: RelationalQueryRequest): Promise<ServiceResponse<RelationalQueryResult<T>>> {
    const url = getRealEndpoints().relationalBaseUrl + "/v1/query";
    if (!getRealEndpoints().relationalBaseUrl) notConfigured("query", url);
    const { data, latencyMs } = await timed(async () => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      if (!res.ok) throw new Error(`Relational HTTP ${res.status}`);
      return (await res.json()) as RelationalQueryResult<T>;
    });
    return {
      data,
      provenance: { mode: "real", service: "relational", source: url, latencyMs },
    };
  },

  async listTables() {
    const url = getRealEndpoints().relationalBaseUrl + "/v1/tables";
    if (!getRealEndpoints().relationalBaseUrl) notConfigured("listTables", url);
    const { data, latencyMs } = await timed(async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Relational HTTP ${res.status}`);
      return (await res.json()) as { tables: string[] };
    });
    return {
      data,
      provenance: { mode: "real", service: "relational", source: url, latencyMs },
    };
  },
};
