import { useState } from "react";
import {
  AIPromptBar,
  AIResponseCard,
  AuditTrail,
  type AuditEntry,
  DisclaimerBar,
  Section,
  Workspace,
} from "@aisp/components";

/**
 * TEMPLATE — copy this folder, rename it, register the use case in
 * src/portal/useCases.ts, and start replacing the placeholders.
 *
 * The contract this template enforces:
 *   1. Every page MUST begin with <DisclaimerBar/>.
 *   2. Every AI output MUST be rendered with <AIResponseCard/>.
 *   3. Every officer action SHOULD push an entry into the audit log.
 *
 * Anything else — layout, controls, side panels — is yours to design,
 * but compose from @aisp/components only. Never invent visual
 * primitives in a use case.
 */

export function TemplateUseCase() {
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [response, setResponse] = useState<string | null>(null);

  function log(action: string, ai = false) {
    setAudit((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        timestamp: new Date(),
        actor: ai ? "AISP" : "Officer J. Brand",
        action,
        ai,
      },
    ]);
  }

  function handlePrompt(prompt: string) {
    log(`Submitted prompt: ${prompt.slice(0, 40)}…`);
    window.setTimeout(() => {
      setResponse(`You asked: ${prompt}`);
      log("Generated response", true);
    }, 600);
  }

  return (
    <Workspace>
      <DisclaimerBar />

      <Section title="Prompt">
        <AIPromptBar onSubmit={handlePrompt} />
      </Section>

      {response && (
        <AIResponseCard role="ai" confidence="medium" timestamp={new Date()}>
          <p>{response}</p>
        </AIResponseCard>
      )}

      <AuditTrail entries={audit} />
    </Workspace>
  );
}

export default TemplateUseCase;
