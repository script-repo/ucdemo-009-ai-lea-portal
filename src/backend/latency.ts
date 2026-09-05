/**
 * Realistic-feeling latency for the simulated backend.
 *
 * Real Nutanix Enterprise AI endpoints have noticeable latency
 * (50–800 ms for retrieval, 500ms–5s for LLM completions).
 * The simulated layer mimics these so the UI behaves the same in
 * both modes — streaming indicators, timeouts, race conditions.
 */

export type LatencyProfile =
  | "instant" // 5–25 ms (fixture lookups)
  | "fast" // 60–180 ms (vector / relational query)
  | "normal" // 220–550 ms (object storage, embedding)
  | "slow" // 700–1800 ms (LLM inference)
  | "very-slow"; // 1800–4000 ms (transcription, vision)

const PROFILES: Record<LatencyProfile, [number, number]> = {
  instant: [5, 25],
  fast: [60, 180],
  normal: [220, 550],
  slow: [700, 1800],
  "very-slow": [1800, 4000],
};

export async function simulateLatency(profile: LatencyProfile = "normal"): Promise<number> {
  const [lo, hi] = PROFILES[profile];
  const ms = Math.round(lo + Math.random() * (hi - lo));
  await new Promise((resolve) => setTimeout(resolve, ms));
  return ms;
}

/**
 * Stream a completed string out chunk-by-chunk to mimic SSE token
 * streaming from a real inference endpoint.
 */
export async function streamChunks(
  text: string,
  onChunk: (chunk: string) => void,
  opts: { chunkSize?: number; delayMs?: number } = {},
): Promise<void> {
  const chunkSize = opts.chunkSize ?? 18;
  const delayMs = opts.delayMs ?? 28;
  for (let i = 0; i < text.length; i += chunkSize) {
    onChunk(text.slice(i, i + chunkSize));
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}
