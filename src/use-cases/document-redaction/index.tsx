import { useEffect, useMemo, useState } from "react";
import {
  AIResponseCard,
  AuditTrail,
  type AuditEntry,
  Badge,
  Button,
  ConfidenceBadge,
  DisclaimerBar,
  HumanReviewBanner,
  Icon,
  type RedactionCategory,
  Section,
  Select,
  StatusDot,
  StreamingIndicator,
  Workspace,
} from "@aisp/components";
import {
  type DocEntity,
  type DocSegment,
  type ProvenanceTag,
  type RedactionDocument,
  REDACTION_DOCUMENTS,
  useBackend,
} from "../../backend";
import { BackingServicesPanel } from "../../portal/BackingServicesPanel";
import { MarkdownBody } from "../../portal/MarkdownBody";

type ViewMode = "highlights" | "redacted";
type Decision = "accept" | "reject";

const CATEGORY_COLOR: Record<RedactionCategory, { fg: string; bg: string; border: string }> = {
  PII: { fg: "#5d4400", bg: "#fff3cd", border: "#e0c878" },
  VICTIM: { fg: "#7a1f3a", bg: "#fde2e9", border: "#e7a8b9" },
  JUVENILE: { fg: "#3a4a7a", bg: "#dde7fb", border: "#a9bce5" },
  CONFIDENTIAL: { fg: "#3a3a3a", bg: "#e8e8ee", border: "#bbbbc8" },
  INFORMANT: { fg: "#5b1a8a", bg: "#ece2f7", border: "#c5add6" },
  MEDICAL: { fg: "#0c5e58", bg: "#d8efeb", border: "#9bccc4" },
};

/**
 * UC10 — Document Redaction.
 *
 * Workflow:
 *   1. Officer picks a document (witness statement, FOIA reply, etc.).
 *   2. AI runs NER + classification, returning candidate detections.
 *   3. Officer reviews each detection in the side panel — accept,
 *      reject, or open the inline span. Recommended actions are
 *      pre-applied per the disclosure-class rule for the doc type.
 *   4. Officer toggles between "Highlights" and "Redacted" views to
 *      preview the final disclosure copy.
 *   5. HumanReviewBanner gates the redacted version becoming part of
 *      the disclosure record. Every action is audited.
 */
export function DocumentRedactionUseCase() {
  const backend = useBackend();
  const [docId, setDocId] = useState(REDACTION_DOCUMENTS[0]!.id);
  const doc = REDACTION_DOCUMENTS.find((d) => d.id === docId) ?? REDACTION_DOCUMENTS[0]!;

  const [detecting, setDetecting] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [activeEntityId, setActiveEntityId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("highlights");
  const [recommendation, setRecommendation] = useState<{
    text: string;
    confidence: "high" | "medium" | "low";
  } | null>(null);

  const [audit, setAudit] = useState<AuditEntry[]>([
    {
      id: "0",
      timestamp: new Date(),
      actor: "Disclosure Officer M. Greene",
      action: `Opened Document Redaction — ${REDACTION_DOCUMENTS.length} documents available`,
    },
  ]);

  // Reset detection state whenever the document changes.
  useEffect(() => {
    setDecisions({});
    setActiveEntityId(null);
    setHasRun(false);
    setRecommendation(null);
    setView("highlights");
  }, [docId]);

  function log(action: string, ai = false) {
    setAudit((prev) => [
      ...prev,
      {
        id: String(prev.length),
        timestamp: new Date(),
        actor: ai ? "AISP" : "Disclosure Officer M. Greene",
        action,
        ai,
      },
    ]);
  }
  function logProv(label: string, p: ProvenanceTag) {
    log(`${label} via ${p.mode}/${p.source} (${p.latencyMs}ms)`, true);
  }

  async function runDetection() {
    setDetecting(true);
    setRecommendation(null);
    log(`Requested NER + classification on ${doc.id}`);
    try {
      // The detections are pre-computed in the fixture (deterministic);
      // we still call the inference endpoint to surface a recommendation
      // string and to exercise the backend abstraction.
      const r = await backend.inference.complete({
        useCaseId: "document-redaction",
        prompt: `Detect and classify sensitive entities in document ${doc.id}.`,
        context: doc.entities.map((e) => ({
          id: e.id,
          title: `${e.category}/${e.subtype}`,
          snippet: e.text,
        })),
      });
      // Pre-apply the recommended decisions so the officer starts from a
      // sensible default (the human reviewer toggles individual rows).
      const initial: Record<string, Decision> = {};
      for (const e of doc.entities) {
        initial[e.id] = e.recommended ? "accept" : "reject";
      }
      setDecisions(initial);
      setHasRun(true);
      setRecommendation({ text: r.data.text, confidence: r.data.confidence });
      logProv(
        `Detected ${doc.entities.length} candidate entities, ${doc.entities.filter((e) => e.recommended).length} recommended for redaction`,
        r.provenance,
      );
    } catch (e) {
      log(`Detection failed: ${(e as Error).message}`);
    } finally {
      setDetecting(false);
    }
  }

  function setDecision(entityId: string, d: Decision) {
    setDecisions((prev) => ({ ...prev, [entityId]: d }));
    const e = doc.entities.find((x) => x.id === entityId);
    log(`${d === "accept" ? "Accepted" : "Rejected"} ${e?.category}/${e?.subtype} ("${truncate(e?.text ?? "", 32)}")`);
  }

  function applyAllRecommended() {
    const next: Record<string, Decision> = {};
    for (const e of doc.entities) next[e.id] = e.recommended ? "accept" : "reject";
    setDecisions(next);
    log("Applied recommended redactions to all detections");
  }
  function rejectAll() {
    const next: Record<string, Decision> = {};
    for (const e of doc.entities) next[e.id] = "reject";
    setDecisions(next);
    log("Rejected all detections");
  }
  function acceptAll() {
    const next: Record<string, Decision> = {};
    for (const e of doc.entities) next[e.id] = "accept";
    setDecisions(next);
    log("Accepted all detections");
  }

  function exportRedacted() {
    log("Exported redacted version — would write to disclosure record (chain-of-custody updated)");
  }

  const stats = useMemo(() => {
    const byCat = new Map<RedactionCategory, { total: number; accepted: number }>();
    let acceptedTotal = 0;
    for (const e of doc.entities) {
      const slot = byCat.get(e.category) ?? { total: 0, accepted: 0 };
      slot.total += 1;
      if (decisions[e.id] === "accept") {
        slot.accepted += 1;
        acceptedTotal += 1;
      }
      byCat.set(e.category, slot);
    }
    return {
      total: doc.entities.length,
      accepted: acceptedTotal,
      byCat: [...byCat.entries()].sort((a, b) => b[1].total - a[1].total),
    };
  }, [doc, decisions]);

  return (
    <Workspace>
      <DisclaimerBar />

      <Section
        title="Document"
        trailing={
          <div style={{ display: "flex", gap: 6 }}>
            <Button
              variant="ai"
              size="sm"
              onClick={runDetection}
              disabled={detecting}
              leadingIcon={<Icon name="sparkles" size={14} />}
            >
              {detecting ? "Detecting…" : hasRun ? "Re-run detection" : "Run detection"}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Select
            value={docId}
            onChange={(e) => {
              setDocId(e.target.value);
              log(`Selected document ${e.target.value}`);
            }}
            style={{ flex: 1 }}
          >
            {REDACTION_DOCUMENTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} — {d.type}
              </option>
            ))}
          </Select>
          <Badge variant="blue">{doc.type}</Badge>
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: "var(--font-size-sm)",
            color: "var(--aisp-text-muted)",
          }}
        >
          {doc.author} · {doc.date}
          {doc.occurrenceRef ? ` · Occ ${doc.occurrenceRef}` : ""}
          {doc.pages ? ` · ${doc.pages} pages` : ""}
        </div>
      </Section>

      {detecting && (
        <Section title="Working">
          <StreamingIndicator label="Running NER + classification" />
        </Section>
      )}

      {hasRun && (
        <>
          <Section
            title="Stats"
            meta={
              <span style={{ display: "flex", gap: 6 }}>
                <Badge variant="ai">{stats.total} detections</Badge>
                <Badge variant="ok">{stats.accepted} accepted</Badge>
                <Badge variant="warning">{stats.total - stats.accepted} rejected</Badge>
              </span>
            }
            trailing={
              <div style={{ display: "flex", gap: 4 }}>
                <Button variant="ghost" size="sm" onClick={applyAllRecommended}>
                  Apply recommended
                </Button>
                <Button variant="ghost" size="sm" onClick={acceptAll}>
                  Accept all
                </Button>
                <Button variant="ghost" size="sm" onClick={rejectAll}>
                  Reject all
                </Button>
              </div>
            }
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 6,
              }}
            >
              {stats.byCat.map(([cat, s]) => (
                <CategoryStat key={cat} category={cat} total={s.total} accepted={s.accepted} />
              ))}
            </div>
          </Section>

          {recommendation && (
            <AIResponseCard
              role="ai"
              model="AISP · Document Redaction"
              confidence={recommendation.confidence}
              timestamp={new Date()}
            >
              <MarkdownBody>{recommendation.text}</MarkdownBody>
            </AIResponseCard>
          )}
        </>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: 14,
          alignItems: "start",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <Section
            title={view === "highlights" ? "Original (highlighted)" : "Redacted preview"}
            meta={
              <div style={{ display: "flex", gap: 4 }}>
                <Button
                  variant={view === "highlights" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setView("highlights")}
                >
                  Highlights
                </Button>
                <Button
                  variant={view === "redacted" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setView("redacted")}
                >
                  Redacted
                </Button>
              </div>
            }
          >
            <DocumentBody
              doc={doc}
              decisions={decisions}
              view={view}
              activeEntityId={activeEntityId}
              hasRun={hasRun}
              onClickEntity={(id) => {
                setActiveEntityId(id);
                log(`Inspected entity ${id}`);
              }}
            />
          </Section>

          {hasRun && (
            <>
              <HumanReviewBanner
                title="Disclosure Officer review required"
                body="The redacted version below will be attached to the disclosure record once approved. Verify each accepted detection."
                onAccept={() => {
                  exportRedacted();
                }}
                onReject={() => log("Rejected disclosure copy")}
                onEdit={() => log("Opened redaction set for editing")}
                acceptLabel="Approve & export"
              />
            </>
          )}
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <BackingServicesPanel
            services={[
              { kind: "vision", name: "presidio-analyzer + gliner", detail: "NER + structured classifier" },
              { kind: "llm", name: "llama-3.1-70b", detail: "category disambiguation" },
              { kind: "object", name: "documents/", detail: "source-of-truth bucket" },
              { kind: "relational", name: "disclosure_log", detail: "FOIA chain-of-custody" },
            ]}
          />
          <Section title="Detections" count={doc.entities.length}>
            {!hasRun ? (
              <div
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--aisp-text-muted)",
                }}
              >
                Run detection to populate the candidate list.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  maxHeight: 480,
                  overflowY: "auto",
                }}
              >
                {doc.entities.map((ent) => (
                  <DetectionRow
                    key={ent.id}
                    entity={ent}
                    decision={decisions[ent.id] ?? "reject"}
                    active={activeEntityId === ent.id}
                    onSelect={() => setActiveEntityId(ent.id)}
                    onAccept={() => setDecision(ent.id, "accept")}
                    onReject={() => setDecision(ent.id, "reject")}
                  />
                ))}
              </div>
            )}
          </Section>
          <Section title="Output options">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontSize: "var(--font-size-sm)",
              }}
            >
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="checkbox" defaultChecked /> Replace with [CATEGORY] tags
              </label>
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="checkbox" defaultChecked /> Append redaction summary
              </label>
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="checkbox" /> Preserve span widths (PDF parity)
              </label>
              <div
                style={{
                  marginTop: 6,
                  fontSize: "var(--font-size-xs)",
                  color: "var(--aisp-text-muted)",
                }}
              >
                Trust:{" "}
                <ConfidenceBadge level={recommendation?.confidence ?? "high"} />
              </div>
            </div>
          </Section>
          <AuditTrail entries={audit} />
        </aside>
      </div>
    </Workspace>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────

function DocumentBody({
  doc,
  decisions,
  view,
  activeEntityId,
  hasRun,
  onClickEntity,
}: {
  doc: RedactionDocument;
  decisions: Record<string, Decision>;
  view: ViewMode;
  activeEntityId: string | null;
  hasRun: boolean;
  onClickEntity: (id: string) => void;
}) {
  const entityById = useMemo(
    () => new Map(doc.entities.map((e) => [e.id, e])),
    [doc],
  );
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid var(--aisp-border-soft)",
        padding: 16,
        fontSize: "var(--font-size-sm)",
        lineHeight: 1.55,
        whiteSpace: "pre-wrap",
        fontFamily: "var(--font-serif, Georgia, serif)",
      }}
    >
      {doc.segments.map((seg, i) => renderSegment(seg, i, entityById, decisions, view, activeEntityId, hasRun, onClickEntity))}
    </div>
  );
}

function renderSegment(
  seg: DocSegment,
  i: number,
  entityById: Map<string, DocEntity>,
  decisions: Record<string, Decision>,
  view: ViewMode,
  activeEntityId: string | null,
  hasRun: boolean,
  onClickEntity: (id: string) => void,
) {
  if (seg.kind === "text") return <span key={i}>{seg.text}</span>;
  const ent = entityById.get(seg.entityId);
  if (!ent) return null;
  const decision = decisions[ent.id] ?? "reject";
  const palette = CATEGORY_COLOR[ent.category];
  const isActive = activeEntityId === ent.id;

  // Before detection has run, render inline as plain text.
  if (!hasRun) return <span key={i}>{ent.text}</span>;

  if (view === "redacted") {
    if (decision === "accept") {
      return (
        <span
          key={i}
          onClick={() => onClickEntity(ent.id)}
          style={{
            background: "#222",
            color: "#fff",
            padding: "0 6px",
            margin: "0 1px",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--font-size-xs)",
            cursor: "pointer",
            borderRadius: 2,
          }}
          title={`${ent.category}/${ent.subtype} — click to inspect`}
        >
          [{ent.category}]
        </span>
      );
    }
    // Rejected → text appears as-is in the redacted output.
    return (
      <span
        key={i}
        onClick={() => onClickEntity(ent.id)}
        style={{
          textDecoration: "underline dotted #999",
          textUnderlineOffset: 3,
          cursor: "pointer",
        }}
        title={`Rejected detection — ${ent.category}/${ent.subtype}`}
      >
        {ent.text}
      </span>
    );
  }

  // highlights view
  return (
    <span
      key={i}
      onClick={() => onClickEntity(ent.id)}
      style={{
        background: palette.bg,
        color: palette.fg,
        border: `1px solid ${palette.border}`,
        outline: isActive ? "2px solid var(--ai-accent)" : undefined,
        outlineOffset: 1,
        padding: "0 4px",
        margin: "0 1px",
        cursor: "pointer",
        opacity: decision === "accept" ? 1 : 0.45,
      }}
      title={`${ent.category}/${ent.subtype} — ${decision === "accept" ? "will redact" : "will keep"}`}
    >
      {ent.text}
    </span>
  );
}

function DetectionRow({
  entity,
  decision,
  active,
  onSelect,
  onAccept,
  onReject,
}: {
  entity: DocEntity;
  decision: Decision;
  active: boolean;
  onSelect: () => void;
  onAccept: () => void;
  onReject: () => void;
}) {
  const palette = CATEGORY_COLOR[entity.category];
  return (
    <div
      onClick={onSelect}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 4,
        padding: "6px 8px",
        border: "1px solid var(--aisp-border-soft)",
        background: active ? "var(--ai-citation-bg)" : "#ffffff",
        cursor: "pointer",
      }}
    >
      <div>
        <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
          <span
            style={{
              background: palette.bg,
              color: palette.fg,
              border: `1px solid ${palette.border}`,
              padding: "0 4px",
              fontSize: "var(--font-size-xs)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {entity.category}
          </span>
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--aisp-text-muted)",
            }}
          >
            {entity.subtype}
          </span>
          <StatusDot
            variant={
              entity.confidence === "high"
                ? "ok"
                : entity.confidence === "medium"
                  ? "warning"
                  : "muted"
            }
            label={`${entity.confidence} confidence`}
          />
          {entity.recommended && (
            <Badge variant="ai">recommended</Badge>
          )}
        </div>
        <div
          style={{
            marginTop: 2,
            fontFamily: "var(--font-mono)",
            fontSize: "var(--font-size-xs)",
          }}
        >
          {truncate(entity.text, 60)}
        </div>
        {entity.note && (
          <div
            style={{
              marginTop: 2,
              fontSize: "var(--font-size-xs)",
              color: "var(--aisp-text-muted)",
            }}
          >
            {entity.note}
          </div>
        )}
      </div>
      <div
        style={{ display: "flex", flexDirection: "column", gap: 2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant={decision === "accept" ? "primary" : "outline"}
          size="sm"
          onClick={onAccept}
        >
          Redact
        </Button>
        <Button
          variant={decision === "reject" ? "dark" : "outline"}
          size="sm"
          onClick={onReject}
        >
          Keep
        </Button>
      </div>
    </div>
  );
}

function CategoryStat({
  category,
  total,
  accepted,
}: {
  category: RedactionCategory;
  total: number;
  accepted: number;
}) {
  const palette = CATEGORY_COLOR[category];
  return (
    <div
      style={{
        padding: 6,
        border: `1px solid ${palette.border}`,
        background: palette.bg,
        color: palette.fg,
      }}
    >
      <div
        style={{
          fontSize: "var(--font-size-xs)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {category}
      </div>
      <div style={{ fontSize: "var(--font-size-lg)", fontWeight: 600 }}>
        {accepted} <span style={{ fontWeight: 400, opacity: 0.7 }}>/ {total}</span>
      </div>
    </div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

export default DocumentRedactionUseCase;
