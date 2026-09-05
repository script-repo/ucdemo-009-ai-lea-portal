/**
 * Simulated inference client.
 *
 * Routes by `useCaseId` to canned content from the fixtures. Adds
 * realistic latency and supports streaming via `onChunk`. The shape
 * of the responses mirrors what a real Nutanix Enterprise AI endpoint
 * would return, so flipping to `real.ts` does not require UI changes.
 */

import { simulateLatency, streamChunks } from "../latency";
import { recordInferenceCall } from "./activeModel";
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

import { BODY_CAM_CLIPS, findBodyCamClip } from "../fixtures/bodyCam";
import {
  CANNED_EVIDENCE_ANSWERS,
  EVIDENCE_ITEMS,
} from "../fixtures/evidence";
import { POLICY_ANSWERS, POLICY_SNIPPETS } from "../fixtures/policies";
import { INTERVIEWS } from "../fixtures/interviews";
import { LINK_ANALYSIS_ANSWERS } from "../fixtures/network";
import { HANDOVER_NARRATIVE } from "../fixtures/shiftHandover";
import { CANNED_PLANS } from "../fixtures/mcpFederation";

const MODEL_NAME = "sim/llama-3.1-70b-instruct";
const ASR_MODEL = "sim/whisper-large-v3";
const EMBED_MODEL = "sim/bge-m3";
const VISION_MODEL = "sim/sam2 + yolo-redact";

function tag(source: string, latencyMs: number) {
  return {
    mode: "simulated" as const,
    service: "inference" as const,
    source,
    latencyMs,
  };
}

function pickAnswer(
  prompt: string,
  useCaseId: string | undefined,
): { text: string; citations: number[]; confidence: CompletionResult["confidence"]; source: string } {
  switch (useCaseId) {
    case "body-cam-report": {
      const clip =
        BODY_CAM_CLIPS.find((c) => prompt.includes(c.id)) ?? BODY_CAM_CLIPS[0]!;
      return {
        text: clip.draftReport.narrative,
        citations: clip.draftReport.paragraphCitations.flat(),
        confidence: "medium",
        source: `fixture: ${clip.id}/draft-report`,
      };
    }
    case "multilingual-interview": {
      const iv =
        INTERVIEWS.find((i) => prompt.includes(i.id)) ?? INTERVIEWS[0]!;
      return {
        text: iv.englishSummary.text,
        citations: iv.englishSummary.citations.flat(),
        confidence: "high",
        source: `fixture: ${iv.id}/summary`,
      };
    }
    case "transcript-911": {
      return {
        text:
          "Across the visible call set the dominant categories are Domestic and Mental health, together accounting for roughly a third of all dispatches. Median response time on dispatched calls is approximately 8 minutes, with the slowest responses on Property calls (median ~18 minutes) — this is consistent with triage policy and is not, in this period, a service-level outlier. Mental-health calls are increasingly co-responded by the Mobile Crisis Intervention Team rather than direct uniformed dispatch, in line with the 2026 service direction. Interpreter usage is concentrated in Mandarin, Tagalog and Spanish on this set, which mirrors the divisional language profile for 14 / 32 / 51. No personal identifiers appear in this view; caller hashes are intake-derived and one-way.",
        citations: [],
        confidence: "medium",
        source: "fixture: 911/insight-summary",
      };
    }
    case "shift-handover": {
      return {
        text: HANDOVER_NARRATIVE.text,
        citations: HANDOVER_NARRATIVE.paragraphCitations.flat(),
        confidence: HANDOVER_NARRATIVE.confidence,
        source: "fixture: handover/narrative",
      };
    }
    case "evidence-intel": {
      const hit = CANNED_EVIDENCE_ANSWERS.find((a) => a.match.test(prompt));
      if (hit) {
        return {
          text: hit.answer.text,
          citations: hit.answer.citations,
          confidence: hit.answer.confidence,
          source: "fixture: evidence/canned",
        };
      }
      return {
        text:
          "I don't have a high-confidence answer grounded in the indexed evidence. Try rephrasing in terms of an entity (subject, witness), a time window, or a location.",
        citations: [],
        confidence: "low",
        source: "fixture: evidence/fallback",
      };
    }
    case "policy-chatbot": {
      const hit = POLICY_ANSWERS.find((a) => a.match.test(prompt));
      if (hit) {
        return {
          text: hit.answer.text,
          citations: hit.answer.citations,
          confidence: hit.answer.confidence,
          source: "fixture: policies/canned",
        };
      }
      return {
        text:
          "I couldn't find an authoritative passage matching your question. Try referencing a specific section (e.g. 'Criminal Code s. 495') or topic (e.g. 'use of force', 'body cam', 'mental health').",
        citations: [],
        confidence: "low",
        source: "fixture: policies/fallback",
      };
    }
    case "link-analysis": {
      const hit = LINK_ANALYSIS_ANSWERS.find((a) => a.match.test(prompt));
      if (hit) {
        return {
          text: hit.answer.text,
          citations: hit.answer.edgeCitations,
          confidence: hit.answer.confidence,
          source: "fixture: network/canned",
        };
      }
      return {
        text:
          "No matching pattern in the link-analysis fixture. Try asking about co-defendants, phone records, vehicles, or witnesses/informants.",
        citations: [],
        confidence: "low",
        source: "fixture: network/fallback",
      };
    }
    case "database-integration": {
      const hit = CANNED_PLANS.find((p) => p.match.test(prompt));
      if (hit) {
        return {
          text: hit.synthesis,
          citations: hit.steps.map((s) => s.step),
          confidence: hit.confidence,
          source: `fixture: federation/${hit.label}`,
        };
      }
      return {
        text:
          "I do not have a federated query plan for that question yet. Pick one of the sample questions, or rephrase as a person, vehicle plate, or address lookup.",
        citations: [],
        confidence: "low",
        source: "fixture: federation/fallback",
      };
    }
    case "document-redaction": {
      return {
        text:
          "All detected entities have been categorized using the design-system redaction taxonomy (PII / VICTIM / JUVENILE / CONFIDENTIAL / INFORMANT / MEDICAL). Recommended redactions follow the disclosure-class rule for the document type. Officer review is required before the redacted version becomes part of the disclosure record.",
        citations: [],
        confidence: "high",
        source: "fixture: documents/recommendation",
      };
    }
    default:
      return {
        text: `Generic completion for prompt: "${prompt.slice(0, 80)}${prompt.length > 80 ? "…" : ""}". Use cases that wire useCaseId get domain-specific fixtures.`,
        citations: [],
        confidence: "medium",
        source: "fixture: generic",
      };
  }
}

export const simulatedInference: InferenceClient = {
  async complete(req: CompletionRequest): Promise<ServiceResponse<CompletionResult>> {
    const latency = await simulateLatency("slow");
    const { text, citations, confidence, source } = pickAnswer(req.prompt, req.useCaseId);

    if (req.onChunk) {
      await streamChunks(text, req.onChunk);
    }

    recordInferenceCall({ model: MODEL_NAME, providerLabel: "Simulated" });

    return {
      data: {
        text,
        citations,
        confidence,
        tokensUsed: Math.round(text.length / 3.5),
        model: MODEL_NAME,
      },
      provenance: tag(source, latency),
    };
  },

  async embed(req: EmbeddingRequest): Promise<ServiceResponse<EmbeddingResult>> {
    const latency = await simulateLatency("fast");
    const dim = 32;
    const vectors = req.inputs.map((input) => deterministicEmbedding(input, dim));
    return {
      data: { vectors, model: EMBED_MODEL, dim },
      provenance: tag("fixture: deterministic", latency),
    };
  },

  async transcribe(req: TranscriptionRequest): Promise<ServiceResponse<TranscriptionResult>> {
    const latency = await simulateLatency("very-slow");
    const bcClip = findBodyCamClip(req.audioRef) ??
      Object.values({ b: null }).reduce<ReturnType<typeof findBodyCamClip>>((acc) => acc, undefined);
    const ivClip = INTERVIEWS.find((i) => i.id === req.audioRef || i.storageKey === req.audioRef);
    if (bcClip) {
      return {
        data: {
          segments: bcClip.segments,
          durationMs: bcClip.durationMs,
          detectedLanguages: ["en-US"],
          model: ASR_MODEL,
        },
        provenance: tag(`fixture: ${bcClip.id}`, latency),
      };
    }
    if (ivClip) {
      return {
        data: {
          segments: ivClip.segments,
          durationMs: ivClip.durationMs,
          detectedLanguages: ivClip.detectedLanguages,
          model: ASR_MODEL,
        },
        provenance: tag(`fixture: ${ivClip.id}`, latency),
      };
    }
    return {
      data: {
        segments: [
          {
            startMs: 0,
            endMs: 4000,
            speaker: "Unknown",
            text: "[no transcript fixture matched the supplied audioRef]",
            confidence: "low",
          },
        ],
        durationMs: 4000,
        detectedLanguages: ["en-US"],
        model: ASR_MODEL,
      },
      provenance: tag("fixture: fallback", latency),
    };
  },

  async redactVideo(req: VisionRedactionRequest): Promise<ServiceResponse<VisionRedactionResult>> {
    const latency = await simulateLatency("very-slow");
    // Generate a deterministic-but-believable detection track.
    const detections = generateRedactionTrack(req);
    return {
      data: {
        detections,
        outputRef: `${req.sourceRef}.redacted.mp4`,
        durationMs: 60_000,
        model: VISION_MODEL,
      },
      provenance: tag(`fixture: vision/${req.sourceRef}`, latency),
    };
  },
};

function deterministicEmbedding(s: string, dim: number): number[] {
  // Hash each character into the bucket — enough to be order-sensitive
  // and produce different vectors for different strings without
  // shipping a real embedder. Not for production retrieval.
  const v = new Array<number>(dim).fill(0);
  for (let i = 0; i < s.length; i++) {
    v[i % dim]! += s.charCodeAt(i) / 255;
  }
  // L2 normalize.
  const norm = Math.sqrt(v.reduce((a, b) => a + b * b, 0)) || 1;
  return v.map((x) => x / norm);
}

function generateRedactionTrack(req: VisionRedactionRequest) {
  const track: VisionRedactionResult["detections"] = [];
  const totalFrames = 30; // 1 detection per ~2 seconds for a 1-min clip
  for (let f = 0; f < totalFrames; f++) {
    const frameMs = f * 2000;
    for (const cat of req.categories) {
      // Category-specific deterministic placement.
      const baseX = 0.18 + ((cat.length + f) % 7) / 25;
      const baseY = 0.22 + ((f * 13) % 100) / 800;
      track.push({
        frameMs,
        category: cat,
        bbox: {
          x: baseX,
          y: baseY,
          w: cat === "FACE" ? 0.12 : cat === "LICENSE_PLATE" ? 0.14 : 0.18,
          h: cat === "FACE" ? 0.16 : 0.06,
        },
        confidence: f % 7 === 0 ? "medium" : "high",
      });
    }
  }
  return track;
}

// Re-export fixtures so use-case components can grab citation metadata.
export { EVIDENCE_ITEMS, POLICY_SNIPPETS };
