/**
 * Runtime inference client with a fixed provider order:
 *   1. Nutanix Enterprise AI (when enabled + key + model)
 *   2. OpenRouter (when enabled + key + model)
 *
 * Port of the Legal AI portal's working fallback — not its UI.
 * Candidates are built from localStorage settings. The first
 * successful OpenAI-compatible /chat/completions response wins.
 */

import type { CompletionRequest, CompletionResult } from "../types";
import {
  isProviderReady,
  loadInferenceSettings,
  resolveProviderUrl,
  type InferenceProviderId,
  type ProviderSettings,
} from "./settings";

export interface InferenceCandidate {
  id: InferenceProviderId;
  label: string;
  url: string;
  apiKey: string;
  model: string;
  extraHeaders: Record<string, string>;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export function buildCandidates(): InferenceCandidate[] {
  const settings = loadInferenceSettings();
  const candidates: InferenceCandidate[] = [];

  const nai = settings.providers.nai;
  if (isProviderReady(nai)) {
    candidates.push(toCandidate("nai", "Nutanix Enterprise AI", nai, {}));
  }

  const or = settings.providers.openrouter;
  if (isProviderReady(or)) {
    candidates.push(
      toCandidate("openrouter", "OpenRouter (fallback)", or, {
        "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://aisp.local",
        "X-Title": "AISP Portal",
      }),
    );
  }

  return candidates;
}

function toCandidate(
  id: InferenceProviderId,
  label: string,
  provider: ProviderSettings,
  extraHeaders: Record<string, string>,
): InferenceCandidate {
  return {
    id,
    label,
    url: resolveProviderUrl(provider.baseUrl, "/chat/completions"),
    apiKey: provider.apiKey.trim(),
    model: provider.model.trim(),
    extraHeaders,
  };
}

export function buildChatMessages(req: CompletionRequest): ChatMessage[] {
  const messages: ChatMessage[] = [];
  messages.push({
    role: "system",
    content:
      "Format with Markdown. Put each list item on its own line starting with '* '. Never put two bullets on the same line. Use '###' headings on their own lines. Use **bold** for occurrence numbers and field labels.",
  });
  if (req.system) {
    messages.push({ role: "system", content: req.system });
  }
  if (req.context && req.context.length > 0) {
    const grounded = req.context
      .map((p, i) => `[${i + 1}] ${p.title}\n${p.snippet}`)
      .join("\n\n");
    messages.push({
      role: "system",
      content: `Grounded source passages. Cite by number when you use them.\n\n${grounded}`,
    });
  }
  messages.push({ role: "user", content: req.prompt });
  return messages;
}

function resolveTokenUsage(
  usage:
    | {
        total_tokens?: number;
        prompt_tokens?: number;
        completion_tokens?: number;
      }
    | undefined,
  text: string,
): {
  tokensUsed: number;
  promptTokens?: number;
  completionTokens?: number;
  tokensEstimated: boolean;
} {
  const promptTokens = usage?.prompt_tokens;
  const completionTokens = usage?.completion_tokens;
  const reported =
    usage?.total_tokens ??
    (promptTokens != null && completionTokens != null ? promptTokens + completionTokens : undefined);
  return {
    tokensUsed: reported ?? Math.max(1, Math.round(text.length / 3.5)),
    promptTokens,
    completionTokens,
    tokensEstimated: reported == null,
  };
}

async function callOne(
  candidate: InferenceCandidate,
  messages: ChatMessage[],
  maxTokens: number,
  timeoutMs: number,
): Promise<{
  text: string;
  model: string;
  tokensUsed: number;
  promptTokens?: number;
  completionTokens?: number;
  tokensEstimated: boolean;
}> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${candidate.apiKey}`,
    ...candidate.extraHeaders,
  };

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(candidate.url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: candidate.model,
        messages,
        max_tokens: maxTokens,
        stream: false,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `${candidate.label} failed: HTTP ${res.status}${text ? ` — ${text.slice(0, 300)}` : ""}`,
      );
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string }; text?: string }>;
      model?: string;
      usage?: {
        total_tokens?: number;
        prompt_tokens?: number;
        completion_tokens?: number;
      };
    };
    const text =
      json.choices?.[0]?.message?.content ?? json.choices?.[0]?.text ?? "";
    if (!text) {
      throw new Error(`${candidate.label} returned an empty completion.`);
    }
    return {
      text,
      model: json.model || candidate.model,
      ...resolveTokenUsage(json.usage, text),
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(`${candidate.label} timed out after ${Math.round(timeoutMs / 1000)}s.`);
    }
    throw err;
  } finally {
    window.clearTimeout(timer);
  }
}

export async function chatCompletion(
  req: CompletionRequest,
): Promise<CompletionResult & { providerLabel: string }> {
  const candidates = buildCandidates();
  if (candidates.length === 0) {
    throw new Error(
      "No inference provider is configured. Open Resources, enable Nutanix Enterprise AI and/or OpenRouter, test the connection, pick a model, and save.",
    );
  }

  const messages = buildChatMessages(req);
  const maxTokens = req.maxTokens ?? 2048;
  const errors: Array<{ candidate: string; message: string }> = [];

  for (const candidate of candidates) {
    try {
      const result = await callOne(candidate, messages, maxTokens, 60_000);
      return {
        text: result.text,
        citations: req.context?.map((_, i) => i) ?? [],
        confidence: "medium",
        tokensUsed: result.tokensUsed,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        tokensEstimated: result.tokensEstimated,
        model: result.model,
        providerLabel: candidate.label,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn("[inference-gateway]", candidate.label, "failed:", message);
      errors.push({ candidate: candidate.label, message });
    }
  }

  const summary = errors.map((e) => `${e.candidate}: ${e.message}`).join(" | ");
  throw new Error(`All inference endpoints failed. ${summary}`);
}
