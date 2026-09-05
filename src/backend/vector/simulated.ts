/**
 * Simulated vector store.
 *
 * Three collections:
 *   - "evidence:TPS-26-417" : evidence corpus for the case file demo
 *   - "policy"              : TPS / Ontario / Criminal Code snippets
 *   - "interviews"          : multilingual interview segments
 *
 * "Similarity" here is a simple keyword overlap — enough to make the
 * UI behave plausibly. Real backends would use proper cosine search.
 */

import { simulateLatency } from "../latency";
import type {
  ServiceResponse,
  VectorClient,
  VectorMatch,
  VectorQueryRequest,
  VectorQueryResult,
} from "../types";
import { EVIDENCE_ITEMS } from "../fixtures/evidence";
import { POLICY_SNIPPETS } from "../fixtures/policies";
import { INTERVIEWS } from "../fixtures/interviews";

interface VirtualRecord {
  id: string;
  docId: string;
  meta: VectorMatch["meta"];
  /** Bag of keywords the simulated retriever scores against. */
  keywords: string[];
}

const COLLECTIONS: Record<string, VirtualRecord[]> = {
  "evidence:TPS-26-417": EVIDENCE_ITEMS.map((e) => ({
    id: `vec-${e.id}`,
    docId: e.id,
    meta: {
      title: e.title,
      snippet: e.description,
      type: e.type,
      capturedAt: e.capturedAt,
      location: e.location ?? "",
    },
    keywords: [
      ...e.tags,
      ...e.title.toLowerCase().split(/\W+/),
      ...e.description.toLowerCase().split(/\W+/),
    ].filter((k) => k.length > 2),
  })),
  policy: POLICY_SNIPPETS.map((p) => ({
    id: `vec-${p.id}`,
    docId: p.id,
    meta: {
      title: p.title,
      snippet: p.excerpt.slice(0, 200) + "…",
      reference: p.reference,
      source: p.source,
    },
    keywords: [
      ...p.tags,
      ...p.title.toLowerCase().split(/\W+/),
      ...p.excerpt.toLowerCase().split(/\W+/),
    ].filter((k) => k.length > 2),
  })),
  interviews: INTERVIEWS.flatMap((iv) =>
    iv.segments.map((seg, idx) => ({
      id: `vec-${iv.id}-${idx}`,
      docId: `${iv.id}#${idx}`,
      meta: {
        title: `${iv.id} — ${seg.speaker} @ ${(seg.startMs / 1000).toFixed(1)}s`,
        snippet: seg.translation ?? seg.text,
        speaker: seg.speaker,
        language: seg.language ?? iv.primaryLanguage,
      },
      keywords: ((seg.translation ?? seg.text) + " " + seg.speaker)
        .toLowerCase()
        .split(/\W+/)
        .filter((k) => k.length > 2),
    })),
  ),
};

function score(query: string, keywords: string[]): number {
  const qWords = new Set(query.toLowerCase().split(/\W+/).filter((w) => w.length > 2));
  if (qWords.size === 0) return 0;
  let hits = 0;
  for (const k of keywords) if (qWords.has(k)) hits++;
  return Math.min(1, hits / Math.max(qWords.size, 3));
}

export const simulatedVector: VectorClient = {
  async query(req: VectorQueryRequest): Promise<ServiceResponse<VectorQueryResult>> {
    const latency = await simulateLatency("fast");
    const records = COLLECTIONS[req.collection] ?? [];
    const queryStr = typeof req.query === "string" ? req.query : "";
    const topK = req.topK ?? 5;

    let scored = records.map((r) => ({
      id: r.id,
      docId: r.docId,
      meta: r.meta,
      score: score(queryStr, r.keywords),
    }));

    if (req.filter) {
      scored = scored.filter((s) =>
        Object.entries(req.filter ?? {}).every(([k, v]) => s.meta[k] === v),
      );
    }

    scored.sort((a, b) => b.score - a.score);
    const matches = scored.slice(0, topK);

    return {
      data: { matches, collection: req.collection },
      provenance: {
        mode: "simulated",
        service: "vector",
        source: `fixture: ${req.collection}`,
        latencyMs: latency,
      },
    };
  },

  async listCollections(): Promise<ServiceResponse<{ collections: string[] }>> {
    const latency = await simulateLatency("instant");
    return {
      data: { collections: Object.keys(COLLECTIONS) },
      provenance: { mode: "simulated", service: "vector", source: "fixture: meta", latencyMs: latency },
    };
  },
};
