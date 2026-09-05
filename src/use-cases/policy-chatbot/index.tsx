import { useMemo, useState } from "react";
import {
  AIPromptBar,
  AIResponseCard,
  AuditTrail,
  type AuditEntry,
  Badge,
  type Citation,
  CitationChip,
  CitationSources,
  DisclaimerBar,
  Icon,
  Section,
  StreamingIndicator,
  Workspace,
} from "@aisp/components";
import {
  POLICY_SNIPPETS,
  type PolicySnippet,
  type ProvenanceTag,
  useBackend,
  type VectorMatch,
} from "../../backend";
import { BackingServicesPanel } from "../../portal/BackingServicesPanel";
import { InferenceUsage, usageFromCompletion } from "../../portal/InferenceUsage";
import { MarkdownBody } from "../../portal/MarkdownBody";

type Turn =
  | { kind: "user"; text: string; timestamp: Date }
  | {
      kind: "ai";
      text: string;
      confidence: "high" | "medium" | "low";
      retrieved: VectorMatch[];
      citations: number[];
      timestamp: Date;
      tokensUsed: number;
      promptTokens?: number;
      completionTokens?: number;
      tokensEstimated?: boolean;
    };

/**
 * UC7 — Internal Policy / Legal Reference Chatbot.
 *
 * The simplest of the seven — pure RAG. Every AI turn cites a
 * snippet from `POLICY_SNIPPETS` and never writes to a record.
 */
export function PolicyChatbotUseCase() {
  const backend = useBackend();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [audit, setAudit] = useState<AuditEntry[]>([
    {
      id: "0",
      timestamp: new Date(),
      actor: "Cst. J. Brand",
      action: "Opened Policy & Legal Reference",
    },
  ]);

  function log(action: string, ai = false) {
    setAudit((prev) => [
      ...prev,
      {
        id: String(prev.length),
        timestamp: new Date(),
        actor: ai ? "AISP" : "Cst. J. Brand",
        action,
        ai,
      },
    ]);
  }
  function logProv(label: string, p: ProvenanceTag) {
    log(`${label} via ${p.mode}/${p.source} (${p.latencyMs}ms)`, true);
  }

  async function ask(prompt: string) {
    setTurns((prev) => [...prev, { kind: "user", text: prompt, timestamp: new Date() }]);
    setBusy(true);
    log(`Asked: "${prompt}"`);
    try {
      const r1 = await backend.vector.query({
        collection: "policy",
        query: prompt,
        topK: 4,
      });
      logProv(`Retrieved ${r1.data.matches.length} candidate snippets`, r1.provenance);

      const r2 = await backend.inference.complete({
        useCaseId: "policy-chatbot",
        prompt,
        context: r1.data.matches.map((m) => ({
          id: m.docId,
          title: String(m.meta.title),
          snippet: String(m.meta.snippet ?? ""),
          meta: String(m.meta.reference ?? ""),
        })),
      });
      logProv(`Generated answer`, r2.provenance);

      setTurns((prev) => [
        ...prev,
        {
          kind: "ai",
          text: r2.data.text,
          confidence: r2.data.confidence,
          retrieved: r1.data.matches,
          citations: r2.data.citations,
          timestamp: new Date(),
          ...usageFromCompletion(r2.data),
        },
      ]);
    } catch (e) {
      log(`Failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  const indexedTopics = useMemo(
    () =>
      Array.from(new Set(POLICY_SNIPPETS.flatMap((p) => p.tags))).slice(0, 16),
    [],
  );

  return (
    <Workspace>
      <DisclaimerBar />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: 14,
          alignItems: "start",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <Section title="Conversation">
            {turns.length === 0 && (
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--font-size-sm)",
                  color: "var(--aisp-text-muted)",
                }}
              >
                Ask a policy or legal question. Every answer cites the
                authoritative snippet it was drawn from. This surface is
                read-only — it never writes to a record.
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: turns.length ? 0 : 8 }}>
              {turns.map((t, i) => (
                <TurnCard key={i} turn={t} onCite={(idx) => log(`Opened source #${idx}`)} />
              ))}
              {busy && <StreamingIndicator label="Retrieving + grounding" />}
            </div>
          </Section>

          <Section title="Ask">
            <AIPromptBar
              placeholder="E.g. 'What are the legal thresholds for a warrantless search under exigent circumstances?'"
              onSubmit={ask}
              busy={busy}
              hint="Reference only. Not legal advice. Verify against the cited section."
            />
          </Section>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <BackingServicesPanel
            services={[
              { kind: "embedding", name: "bge-large-en-v1.5", detail: "policy chunking" },
              { kind: "vector", name: "policy-corpus", detail: "TPS · Charter · CCC · Ontario" },
              { kind: "llm", name: "llama-3.1-70b", detail: "answer + citation" },
              { kind: "object", name: "policy-docs/", detail: "PDF source-of-truth" },
            ]}
          />
          <Section title="Indexed corpus" count={POLICY_SNIPPETS.length}>
            <div
              style={{
                fontSize: "var(--font-size-sm)",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div>
                <Icon name="document" size={12} /> TPS Procedures
              </div>
              <div>
                <Icon name="document" size={12} /> Criminal Code of Canada
              </div>
              <div>
                <Icon name="document" size={12} /> Charter of Rights & Freedoms
              </div>
              <div>
                <Icon name="document" size={12} /> Ontario statutes
              </div>
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  gap: 4,
                  flexWrap: "wrap",
                }}
              >
                {indexedTopics.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            </div>
          </Section>
          <AuditTrail entries={audit} />
        </aside>
      </div>
    </Workspace>
  );
}

function TurnCard({
  turn,
  onCite,
}: {
  turn: Turn;
  onCite: (snippetIdx: number) => void;
}) {
  if (turn.kind === "user") {
    return (
      <AIResponseCard role="user" timestamp={turn.timestamp}>
        <p style={{ margin: 0 }}>{turn.text}</p>
      </AIResponseCard>
    );
  }

  // Build display citations: each AI citation is an index into POLICY_SNIPPETS.
  const seen = new Set<number>();
  const citations: Citation[] = [];
  for (const idx of turn.citations) {
    if (seen.has(idx)) continue;
    seen.add(idx);
    const snip: PolicySnippet | undefined = POLICY_SNIPPETS[idx];
    if (!snip) continue;
    citations.push({
      index: citations.length + 1,
      title: `${snip.source} · ${snip.reference}`,
      meta: snip.title,
      onOpen: () => onCite(idx),
    });
  }

  return (
    <>
      <AIResponseCard
        role="ai"
        model="AISP · Policy & Legal Reference"
        confidence={turn.confidence}
        timestamp={turn.timestamp}
        footer={<InferenceUsage {...turn} />}
      >
        <MarkdownBody>{turn.text}</MarkdownBody>
        {citations.length > 0 && (
          <p>
            {citations.slice(0, 3).map((c) => (
              <CitationChip key={c.index} citation={c} />
            ))}
          </p>
        )}
      </AIResponseCard>
      {citations.length > 0 && (
        <Section title="Sources" count={citations.length}>
          <CitationSources citations={citations} />
        </Section>
      )}
    </>
  );
}

export default PolicyChatbotUseCase;
