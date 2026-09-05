/**
 * Simulated object store.
 *
 * Holds metadata only — no actual binary content. Returned URLs are
 * data: URLs encoding a placeholder so the UI can show "click to play"
 * without having to bundle media. Replace `real.ts` for actual S3/Nutanix
 * Object Storage / MinIO traffic.
 */

import { simulateLatency } from "../latency";
import type {
  GetObjectRequest,
  ListObjectsRequest,
  ObjectMeta,
  ObjectStorageClient,
  ServiceResponse,
} from "../types";

import { BODY_CAM_CLIPS } from "../fixtures/bodyCam";
import { EVIDENCE_ITEMS } from "../fixtures/evidence";
import { INTERVIEWS } from "../fixtures/interviews";

const PLACEHOLDER_HASH =
  "0000000000000000000000000000000000000000000000000000000000000000";

const OBJECTS: ObjectMeta[] = [
  ...BODY_CAM_CLIPS.map<ObjectMeta>((c) => ({
    key: c.storageKey.split("/").slice(1).join("/"),
    bucket: c.storageKey.split("/")[0]!,
    contentType: "video/mp4",
    sizeBytes: Math.round(c.durationMs * 240),
    createdAt: c.capturedAt,
    sha256: PLACEHOLDER_HASH,
    meta: {
      officer: c.officer,
      unit: c.unit,
      location: c.location,
      scenario: c.scenario,
    },
  })),
  ...EVIDENCE_ITEMS.map<ObjectMeta>((e) => ({
    key: e.storageKey.split("/").slice(1).join("/"),
    bucket: e.storageKey.split("/")[0]!,
    contentType:
      e.type === "photo"
        ? "image/jpeg"
        : e.type === "witness-statement"
          ? "application/pdf"
          : e.type === "transaction-log"
            ? "application/json"
            : "video/mp4",
    sizeBytes:
      e.durationMs != null ? Math.round(e.durationMs * 280) : 256_000,
    createdAt: e.capturedAt,
    sha256: PLACEHOLDER_HASH,
    meta: {
      caseId: e.caseId,
      type: e.type,
      title: e.title,
      ...(e.location ? { location: e.location } : {}),
    },
  })),
  ...INTERVIEWS.map<ObjectMeta>((iv) => ({
    key: iv.storageKey.split("/").slice(1).join("/"),
    bucket: iv.storageKey.split("/")[0]!,
    contentType: "audio/wav",
    sizeBytes: Math.round(iv.durationMs * 96),
    createdAt: iv.capturedAt,
    sha256: PLACEHOLDER_HASH,
    meta: {
      role: iv.intervieweeRole,
      primaryLanguage: iv.primaryLanguage,
    },
  })),
];

export const simulatedObjectStorage: ObjectStorageClient = {
  async list(req: ListObjectsRequest): Promise<ServiceResponse<{ objects: ObjectMeta[] }>> {
    const latency = await simulateLatency("fast");
    let rows = OBJECTS.filter((o) => o.bucket === req.bucket);
    if (req.prefix) rows = rows.filter((o) => o.key.startsWith(req.prefix!));
    if (req.limit) rows = rows.slice(0, req.limit);
    return {
      data: { objects: rows },
      provenance: {
        mode: "simulated",
        service: "objectStorage",
        source: `fixture: bucket/${req.bucket}`,
        latencyMs: latency,
      },
    };
  },

  async head(req: GetObjectRequest): Promise<ServiceResponse<ObjectMeta>> {
    const latency = await simulateLatency("instant");
    const obj = OBJECTS.find((o) => o.bucket === req.bucket && o.key === req.key);
    if (!obj) {
      throw new Error(`Object not found: ${req.bucket}/${req.key}`);
    }
    return {
      data: obj,
      provenance: {
        mode: "simulated",
        service: "objectStorage",
        source: `fixture: ${req.bucket}/${req.key}`,
        latencyMs: latency,
      },
    };
  },

  async presign(req: GetObjectRequest): Promise<ServiceResponse<{ url: string; expiresAt: string }>> {
    const latency = await simulateLatency("instant");
    // Placeholder: a data: URL with a short text payload. The UI should
    // not actually try to <video src=> this in simulated mode.
    const expiresAt = new Date(Date.now() + 5 * 60_000).toISOString();
    return {
      data: {
        url: `data:text/plain;base64,${btoa(`simulated://${req.bucket}/${req.key}`)}`,
        expiresAt,
      },
      provenance: {
        mode: "simulated",
        service: "objectStorage",
        source: `fixture: presign ${req.bucket}/${req.key}`,
        latencyMs: latency,
      },
    };
  },
};
