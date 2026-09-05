import { getRealEndpoints } from "../config";
import type {
  GetObjectRequest,
  ListObjectsRequest,
  ObjectMeta,
  ObjectStorageClient,
  ServiceResponse,
} from "../types";

function notConfigured(method: string, url: string): never {
  throw new Error(
    `Real object storage not configured for ${method} (would call ${url || "<unset>"}). ` +
      `Set VITE_AISP_OBJECT_STORAGE_URL and implement the endpoint shim.`,
  );
}

async function timed<T>(fn: () => Promise<T>): Promise<{ data: T; latencyMs: number }> {
  const start = performance.now();
  const data = await fn();
  return { data, latencyMs: Math.round(performance.now() - start) };
}

export const realObjectStorage: ObjectStorageClient = {
  async list(req: ListObjectsRequest): Promise<ServiceResponse<{ objects: ObjectMeta[] }>> {
    const base = getRealEndpoints().objectStorageBaseUrl;
    const url = `${base}/v1/buckets/${req.bucket}?prefix=${encodeURIComponent(req.prefix ?? "")}&limit=${req.limit ?? 50}`;
    if (!base) notConfigured("list", url);
    const { data, latencyMs } = await timed(async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`ObjectStorage HTTP ${res.status}`);
      return (await res.json()) as { objects: ObjectMeta[] };
    });
    return { data, provenance: { mode: "real", service: "objectStorage", source: url, latencyMs } };
  },

  async head(req: GetObjectRequest) {
    const base = getRealEndpoints().objectStorageBaseUrl;
    const url = `${base}/v1/buckets/${req.bucket}/${encodeURIComponent(req.key)}`;
    if (!base) notConfigured("head", url);
    const { data, latencyMs } = await timed(async () => {
      const res = await fetch(url, { method: "HEAD" });
      if (!res.ok) throw new Error(`ObjectStorage HTTP ${res.status}`);
      // Real backends return metadata in headers; simplified here.
      return {
        key: req.key,
        bucket: req.bucket,
        contentType: res.headers.get("content-type") ?? "application/octet-stream",
        sizeBytes: Number(res.headers.get("content-length") ?? 0),
        createdAt: res.headers.get("last-modified") ?? new Date().toISOString(),
        sha256: res.headers.get("x-amz-meta-sha256") ?? "",
      } as ObjectMeta;
    });
    return { data, provenance: { mode: "real", service: "objectStorage", source: url, latencyMs } };
  },

  async presign(req: GetObjectRequest) {
    const base = getRealEndpoints().objectStorageBaseUrl;
    const url = `${base}/v1/presign?bucket=${req.bucket}&key=${encodeURIComponent(req.key)}`;
    if (!base) notConfigured("presign", url);
    const { data, latencyMs } = await timed(async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`ObjectStorage HTTP ${res.status}`);
      return (await res.json()) as { url: string; expiresAt: string };
    });
    return { data, provenance: { mode: "real", service: "objectStorage", source: url, latencyMs } };
  },
};
