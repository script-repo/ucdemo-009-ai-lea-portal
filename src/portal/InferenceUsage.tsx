import { useBackend, type CompletionResult } from "../backend";
import "./InferenceUsage.css";

export type InferenceUsageState = {
  tokensUsed: number;
  promptTokens?: number;
  completionTokens?: number;
  tokensEstimated?: boolean;
};

export function usageFromCompletion(result: CompletionResult): InferenceUsageState {
  return {
    tokensUsed: result.tokensUsed,
    promptTokens: result.promptTokens,
    completionTokens: result.completionTokens,
    tokensEstimated: result.tokensEstimated,
  };
}

/**
 * Discrete token count for a single real inference call.
 * Hidden in simulated mode — fixtures are not billed usage.
 */
export function InferenceUsage({
  tokensUsed,
  promptTokens,
  completionTokens,
  tokensEstimated,
}: {
  tokensUsed?: number;
  promptTokens?: number;
  completionTokens?: number;
  tokensEstimated?: boolean;
}) {
  const backend = useBackend();
  if (backend.mode !== "real" || !tokensUsed || tokensUsed <= 0) return null;

  const parts: string[] = [];
  if (promptTokens != null) parts.push(`${promptTokens.toLocaleString()} prompt`);
  if (completionTokens != null) parts.push(`${completionTokens.toLocaleString()} completion`);
  const title = [
    tokensEstimated ? "Estimated — provider did not return usage" : "Total tokens for this completion",
    parts.length ? parts.join(" · ") : null,
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <span className="ai-inference-usage" title={title}>
      {tokensEstimated ? "~" : ""}
      {tokensUsed.toLocaleString()} tokens
    </span>
  );
}
