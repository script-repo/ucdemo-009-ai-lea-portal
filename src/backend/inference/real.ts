/**
 * Real inference client — Nutanix Enterprise AI first, OpenRouter fallback.
 *
 * Chat completions go through `gateway.ts`, which reads operator-saved
 * keys from localStorage (see `/resources`). Other methods stay as
 * HTTP shims until those endpoints are wired the same way.
 */

import { getRealEndpoints } from "../config";
import { streamChunks } from "../latency";
import type {
  CompletionRequest,
  CompletionResult,
  EmbeddingRequest,
  EmbeddingResult,
  InferenceClient,
  ServiceResponse,
  TranscriptionRequest,
  TranscriptionResult,
  VisionRedactionRequest,
  VisionRedactionResult,
} from "../types";
import { chatCompletion } from "./gateway";
import { recordInferenceCall } from "./activeModel";

function notConfigured(method: string, url: string): never {
  throw new Error(
    `Real inference backend not configured for ${method} (would call ${url || "<unset>"}). ` +
      `Configure chat completions on the Resources page, or set VITE_AISP_INFERENCE_URL for other methods.`,
  );
}

async function timed<T>(fn: () => Promise<T>): Promise<{ data: T; latencyMs: number }> {
  const start = performance.now();
  const data = await fn();
  return { data, latencyMs: Math.round(performance.now() - start) };
}

export const realInference: InferenceClient = {
  async complete(req: CompletionRequest): Promise<ServiceResponse<CompletionResult>> {
    const { data, latencyMs } = await timed(async () => {
      const result = await chatCompletion(req);
      if (req.onChunk) {
        await streamChunks(result.text, req.onChunk, { chunkSize: 24, delayMs: 12 });
      }
      return result;
    });
    const { providerLabel, ...completion } = data;
    recordInferenceCall({ model: completion.model, providerLabel });
    return {
      data: completion,
      provenance: {
        mode: "real",
        service: "inference",
        source: `${providerLabel} / ${completion.model}`,
        latencyMs,
      },
    };
  },

  async embed(req: EmbeddingRequest): Promise<ServiceResponse<EmbeddingResult>> {
    const url = getRealEndpoints().inferenceBaseUrl + "/v1/embed";
    if (!getRealEndpoints().inferenceBaseUrl) notConfigured("embed", url);
    const { data, latencyMs } = await timed(async () => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: req.inputs }),
      });
      if (!res.ok) throw new Error(`Embed HTTP ${res.status}`);
      return (await res.json()) as EmbeddingResult;
    });
    return {
      data,
      provenance: { mode: "real", service: "inference", source: url, latencyMs },
    };
  },

  async transcribe(req: TranscriptionRequest): Promise<ServiceResponse<TranscriptionResult>> {
    const url = getRealEndpoints().inferenceBaseUrl + "/v1/transcribe";
    if (!getRealEndpoints().inferenceBaseUrl) notConfigured("transcribe", url);
    const { data, latencyMs } = await timed(async () => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioRef: req.audioRef, speakers: req.speakers, language: req.language }),
      });
      if (!res.ok) throw new Error(`Transcribe HTTP ${res.status}`);
      return (await res.json()) as TranscriptionResult;
    });
    return {
      data,
      provenance: { mode: "real", service: "inference", source: url, latencyMs },
    };
  },

  async redactVideo(req: VisionRedactionRequest): Promise<ServiceResponse<VisionRedactionResult>> {
    const url = getRealEndpoints().inferenceBaseUrl + "/v1/redact-video";
    if (!getRealEndpoints().inferenceBaseUrl) notConfigured("redactVideo", url);
    const { data, latencyMs } = await timed(async () => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceRef: req.sourceRef, categories: req.categories }),
      });
      if (!res.ok) throw new Error(`Redact HTTP ${res.status}`);
      return (await res.json()) as VisionRedactionResult;
    });
    return {
      data,
      provenance: { mode: "real", service: "inference", source: url, latencyMs },
    };
  },
};
