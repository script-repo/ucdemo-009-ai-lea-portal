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
  RedactionToken,
  Section,
  type Source,
  SourceSelector,
  StreamingIndicator,
  Workspace,
} from "@aisp/components";
import {
  EVIDENCE_CASE_ID,
  EVIDENCE_ITEMS,
  type EvidenceItem,
  type ProvenanceTag,
  useBackend,
  type VectorMatch,
} from "../../backend";
import { BackingServicesPanel } from "../../portal/BackingServicesPanel";
import { MarkdownBody } from "../../portal/MarkdownBody";

/**
 * UC2 — Agentic Evidence Intelligence ("Ask Your Case File").
 *
 * Workflow:
 *   1. Officer scopes which evidence items are in play.
 *   2. Officer asks a plain-English question.
 *   3. Vector retrieval surfaces relevant exhibits.
 *   4. LLM drafts a grounded answer with citations into those exhibits.
 *   5. Audit log captures every prompt, retrieval, and model call.
 */
export function EvidenceIntelUseCase() {
  const backend = useBackend();

  const allSources: Source[] = useMemo(
    () =>
      EVIDENCE_ITEMS.map((e) => ({
        id: e.id,
        label: e.title,
        icon:
          e.type === "photo"
            ? "document"
            : e.type === "witness-statement"
              ? "document"
              : e.type === "transaction-log"
                ? "list"
                : e.type === "body-cam"
                  ? "shield"
                  : "folder",
        description: `${e.type} · ${e.location ?? "—"} · captured ${new Date(e.capturedAt).toLocaleString()}`,
      })),
    [],
  );

  const [scopedIds, setScopedIds] = useState<string[]>(
    EVIDENCE_ITEMS.map((e) => e.id),
  );
  const [busy, setBusy] = useState(false);
  const [retrieved, setRetrieved] = useState<VectorMatch[] | null>(null);
  const [response, setResponse] = useState<{
    text: string;
    confidence: "high" | "medium" | "low";
    citations: number[];
    timestamp: Date;
  } | null>(null);
  const [highlightedItem, setHighlightedItem] = useState<string | null>(null);

  const [audit, setAudit] = useState<AuditEntry[]>([
    {
      id: "0",
      timestamp: new Date(),
      actor: "Det. K. Singh",
      action: `Opened case file ${EVIDENCE_CASE_ID}`,
    },
  ]);

  function log(action: string, ai = false) {
    setAudit((prev) => [
      ...prev,
      {
        id: String(prev.length),
        timestamp: new Date(),
        actor: ai ? "AISP" : "Det. K. Singh",
        action,
        ai,
      },
    ]);
  }
  function logProv(label: string, p: ProvenanceTag) {
    log(`${label} via ${p.mode}/${p.source} (${p.latencyMs}ms)`, true);
  }

  function toggleSource(id: string) {
    setScopedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
    log(`Toggled source ${id}`);
  }

  async function ask(prompt: string) {
    log(`Asked: "${prompt}"`);
    setBusy(true);
    setResponse(null);
    setRetrieved(null);
    try {
      const r1 = await backend.vector.query({
        collection: `evidence:${EVIDENCE_CASE_ID}`,
        query: prompt,
        topK: 5,
      });
      const matches = r1.data.matches.filter((m) => scopedIds.includes(m.docId));
      setRetrieved(matches);
      logProv(`Retrieved ${matches.length} candidate exhibits`, r1.provenance);

      const r2 = await backend.inference.complete({
        useCaseId: "evidence-intel",
        prompt,
        context: matches.map((m) => ({
          id: m.docId,
          title: String(m.meta.title ?? m.docId),
          snippet: String(m.meta.snippet ?? ""),
        })),
      });
      setResponse({
        text: r2.data.text,
        confidence: r2.data.confidence,
        citations: r2.data.citations,
        timestamp: new Date(),
      });
      logProv(`Generated grounded answer`, r2.provenance);
    } catch (e) {
      log(`Failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  // Build the citation list for display: each model citation index
  // points into EVIDENCE_ITEMS (1-based per the canned answers).
  const citations: Citation[] = useMemo(() => {
    if (!response) return [];
    const seen = new Set<number>();
    const list: Citation[] = [];
    for (const ev of response.citations) {
      if (seen.has(ev)) continue;
      seen.add(ev);
      const item: EvidenceItem | undefined = EVIDENCE_ITEMS[ev];
      if (!item) continue;
      list.push({
        index: list.length + 1,
        title: item.title,
        meta: `${item.type} · ${item.location ?? "—"} · ${new Date(item.capturedAt).toLocaleString()}`,
        onOpen: () => {
          setHighlightedItem(item.id);
          log(`Opened exhibit ${item.id}`);
        },
      });
    }
    return list;
  }, [response]);

  return (
    <Workspace>
      <DisclaimerBar />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 14,
          alignItems: "start",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <Section
            title={`Case file ${EVIDENCE_CASE_ID}`}
            meta={<Badge variant="blue">{EVIDENCE_ITEMS.length} exhibits</Badge>}
          >
            <AIPromptBar
              placeholder="Ask: 'Show me all footage of the suspect near Yonge & Dundas between 9 and 11 PM' …"
              onSubmit={ask}
              busy={busy}
            />
          </Section>

          {busy && (
            <Section title="Working">
              <StreamingIndicator label="Retrieving + grounding" />
            </Section>
          )}

          {retrieved && retrieved.length > 0 && (
            <Section title="Retrieved sources" count={retrieved.length}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {retrieved.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "60px 1fr 80px",
                      gap: 8,
                      fontSize: "var(--font-size-sm)",
                      padding: "4px 0",
                      borderBottom: "1px solid var(--aisp-border-soft)",
                      background:
                        highlightedItem === m.docId
                          ? "var(--ai-citation-bg)"
                          : "transparent",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "var(--font-size-xs)",
                        color: "var(--aisp-text-muted)",
                      }}
                    >
                      {(m.score * 100).toFixed(0)}%
                    </span>
                    <span>{String(m.meta.title)}</span>
                    <span
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--aisp-text-muted)",
                      }}
                    >
                      {String(m.meta.type ?? "")}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {response && (
            <>
              <AIResponseCard
                role="ai"
                model="AISP · Evidence Intel"
                confidence={response.confidence}
                timestamp={response.timestamp}
              >
                <MarkdownBody>{response.text}</MarkdownBody>
                {citations.length > 0 && (
                  <p>
                    {citations.slice(0, 3).map((c) => (
                      <CitationChip key={c.index} citation={c} />
                    ))}
                  </p>
                )}
                {response.confidence === "low" && (
                  <p
                    style={{
                      marginBottom: 0,
                      fontSize: "var(--font-size-xs)",
                      color: "var(--aisp-text-muted)",
                    }}
                  >
                    <Icon name="alert" size={12} /> No grounded match — try a more
                    specific entity, time, or place.
                  </p>
                )}
              </AIResponseCard>

              {citations.length > 0 && (
                <Section title="Sources" count={citations.length}>
                  <CitationSources citations={citations} />
                </Section>
              )}

              {highlightedItem && (
                <ChainOfCustody itemId={highlightedItem} />
              )}
            </>
          )}
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <BackingServicesPanel
            services={[
              { kind: "embedding", name: "bge-large-en-v1.5", detail: "exhibit chunking" },
              { kind: "vector", name: `case-files/${EVIDENCE_CASE_ID}`, detail: "per-case index" },
              { kind: "llm", name: "llama-3.1-70b", detail: "RAG synthesis" },
              { kind: "object", name: "case-files/", detail: "exhibits, chain-of-custody" },
            ]}
          />
          <SourceSelector
            sources={allSources}
            selectedIds={scopedIds}
            onToggle={toggleSource}
          />
          <Section title="Witnesses & victims" count={2}>
            <div
              style={{
                fontSize: "var(--font-size-sm)",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div>
                Witness:{" "}
                <RedactionToken
                  category="VICTIM"
                  value="Witness A — Mary Onyango"
                  revealable
                  onReveal={() => log("Revealed witness identity")}
                />
              </div>
              <div>
                Subject (subject of arrest, no protection): <Badge>Subject 1</Badge>
              </div>
            </div>
          </Section>
          <AuditTrail entries={audit} />
        </aside>
      </div>
    </Workspace>
  );
}

function ChainOfCustody({ itemId }: { itemId: string }) {
  const item = EVIDENCE_ITEMS.find((e) => e.id === itemId);
  if (!item) return null;
  return (
    <Section
      title={`Chain of custody — ${item.title}`}
      count={item.custody.length}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {item.custody.map((c, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "180px 180px 1fr",
              gap: 8,
              fontSize: "var(--font-size-sm)",
              padding: "4px 0",
              borderBottom: "1px solid var(--aisp-border-soft)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--font-size-xs)",
                color: "var(--aisp-text-muted)",
              }}
            >
              {new Date(c.at).toLocaleString()}
            </span>
            <span style={{ fontWeight: 600 }}>{c.actor}</span>
            <span>{c.action}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default EvidenceIntelUseCase;
