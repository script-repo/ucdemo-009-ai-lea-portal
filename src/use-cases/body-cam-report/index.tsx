import { useMemo, useState } from "react";
import {
  AIResponseCard,
  AuditTrail,
  type AuditEntry,
  Badge,
  Button,
  type Citation,
  CitationChip,
  CitationSources,
  ConfidenceBadge,
  DisclaimerBar,
  HumanReviewBanner,
  Icon,
  RedactionToken,
  Section,
  Select,
  StreamingIndicator,
  Workspace,
} from "@aisp/components";
import {
  BODY_CAM_CLIPS,
  type ProvenanceTag,
  type TranscriptSegment,
  useBackend,
} from "../../backend";
import { BackingServicesPanel } from "../../portal/BackingServicesPanel";
import { MarkdownBody } from "../../portal/MarkdownBody";

/**
 * UC1 — AI-Powered Report Writing from Body-Camera Audio.
 *
 * Workflow:
 *   1. Officer picks a body-cam clip.
 *   2. ASR transcribes to segments.
 *   3. LLM drafts a structured occurrence report grounded in segments.
 *   4. Officer reviews, accepts/rejects, with full audit trail.
 */
export function BodyCamReportUseCase() {
  const backend = useBackend();
  const [clipId, setClipId] = useState(BODY_CAM_CLIPS[0]!.id);
  const clip = BODY_CAM_CLIPS.find((c) => c.id === clipId) ?? BODY_CAM_CLIPS[0]!;

  const [segments, setSegments] = useState<TranscriptSegment[] | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [draftBusy, setDraftBusy] = useState(false);
  const [draft, setDraft] = useState<{
    text: string;
    confidence: "high" | "medium" | "low";
    timestamp: Date;
    citationIdxs: number[];
  } | null>(null);

  const [audit, setAudit] = useState<AuditEntry[]>([
    {
      id: "0",
      timestamp: new Date(),
      actor: "Officer J. Brand",
      action: "Opened Body-Cam Report Drafting",
    },
  ]);

  function log(action: string, ai = false) {
    setAudit((prev) => [
      ...prev,
      {
        id: String(prev.length),
        timestamp: new Date(),
        actor: ai ? "AISP" : "Officer J. Brand",
        action,
        ai,
      },
    ]);
  }

  function logProv(label: string, p: ProvenanceTag) {
    log(`${label} via ${p.mode}/${p.source} (${p.latencyMs}ms)`, true);
  }

  async function transcribe() {
    setTranscribing(true);
    setSegments(null);
    setDraft(null);
    log(`Requested transcription of ${clip.id}`);
    try {
      const res = await backend.inference.transcribe({ audioRef: clip.id });
      setSegments(res.data.segments);
      logProv(`Transcribed ${res.data.segments.length} segments`, res.provenance);
    } catch (e) {
      log(`Transcription failed: ${(e as Error).message}`);
    } finally {
      setTranscribing(false);
    }
  }

  async function generateDraft() {
    if (!segments) return;
    setDraftBusy(true);
    setDraft(null);
    log(`Requested draft for ${clip.draftReport.occurrenceType}`);
    try {
      const res = await backend.inference.complete({
        useCaseId: "body-cam-report",
        prompt: `Draft a structured occurrence report for ${clip.id}.`,
        context: segments.map((s, i) => ({
          id: `seg-${i}`,
          title: `${s.speaker} @ ${(s.startMs / 1000).toFixed(1)}s`,
          snippet: s.text,
        })),
      });
      setDraft({
        text: res.data.text,
        confidence: res.data.confidence,
        timestamp: new Date(),
        citationIdxs: res.data.citations,
      });
      logProv(`Generated narrative (${res.data.text.length} chars)`, res.provenance);
    } catch (e) {
      log(`Draft generation failed: ${(e as Error).message}`);
    } finally {
      setDraftBusy(false);
    }
  }

  const citations: Citation[] = useMemo(() => {
    if (!segments || !draft) return [];
    const seen = new Set<number>();
    const list: Citation[] = [];
    for (const segIdx of draft.citationIdxs) {
      if (seen.has(segIdx)) continue;
      seen.add(segIdx);
      const seg = segments[segIdx];
      if (!seg) continue;
      list.push({
        index: list.length + 1,
        title: `${seg.speaker} @ ${(seg.startMs / 1000).toFixed(1)}s`,
        meta: seg.text.length > 100 ? `${seg.text.slice(0, 100)}…` : seg.text,
        onOpen: () => log(`Opened source segment #${segIdx}`),
      });
    }
    return list;
  }, [segments, draft]);

  function accept() {
    log("Accepted draft — would post to occurrence record");
    setDraft(null);
  }
  function reject() {
    log("Rejected draft");
    setDraft(null);
  }

  return (
    <Workspace>
      <DisclaimerBar />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: 14,
          alignItems: "start",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <Section
            title="Source clip"
            trailing={
              <Button
                variant="ai"
                size="sm"
                onClick={transcribe}
                disabled={transcribing}
                leadingIcon={<Icon name="sparkles" size={14} />}
              >
                {transcribing ? "Transcribing…" : segments ? "Re-transcribe" : "Transcribe"}
              </Button>
            }
          >
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Select
                value={clipId}
                onChange={(e) => {
                  setClipId(e.target.value);
                  setSegments(null);
                  setDraft(null);
                  log(`Selected clip ${e.target.value}`);
                }}
                style={{ flex: 1 }}
              >
                {BODY_CAM_CLIPS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.scenario} — {c.location} — {(c.durationMs / 1000).toFixed(0)}s
                  </option>
                ))}
              </Select>
              <Badge>{clip.officer}</Badge>
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: "var(--font-size-sm)",
                color: "var(--aisp-text-muted)",
              }}
            >
              Captured {new Date(clip.capturedAt).toLocaleString()} · {clip.unit}
            </div>
          </Section>

          {transcribing && (
            <Section title="Working">
              <StreamingIndicator label="Transcribing audio" />
            </Section>
          )}

          {segments && !transcribing && (
            <Section title="Transcript" count={segments.length}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  maxHeight: 320,
                  overflowY: "auto",
                  paddingRight: 4,
                }}
              >
                {segments.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "70px 100px 1fr",
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
                      {(s.startMs / 1000).toFixed(1)}s
                    </span>
                    <span style={{ fontWeight: 600 }}>{s.speaker}</span>
                    <span>{s.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10 }}>
                <Button
                  variant="ai"
                  onClick={generateDraft}
                  disabled={draftBusy}
                  leadingIcon={<Icon name="sparkles" size={14} />}
                >
                  {draftBusy ? "Drafting…" : "Generate report"}
                </Button>
              </div>
            </Section>
          )}

          {draftBusy && (
            <Section title="Working">
              <StreamingIndicator label="Drafting report" />
            </Section>
          )}

          {draft && (
            <>
              <HumanReviewBanner
                title="Officer review required"
                body={`Draft is for: ${clip.draftReport.occurrenceType}. Verify against the transcript before posting.`}
                onAccept={accept}
                onReject={reject}
                onEdit={() => log("Opened draft for editing")}
              />
              <AIResponseCard
                role="ai"
                model="AISP · Body-Cam Report Draft"
                confidence={draft.confidence}
                timestamp={draft.timestamp}
                actions={
                  <Button
                    variant="ghost"
                    size="sm"
                    leadingIcon={<Icon name="copy" size={14} />}
                    onClick={() => log("Copied draft to clipboard")}
                  >
                    Copy
                  </Button>
                }
              >
                <p style={{ marginTop: 0 }}>
                  <strong>{clip.draftReport.occurrenceType}</strong>
                </p>
                <MarkdownBody>{draft.text}</MarkdownBody>
                {citations.length > 0 && (
                  <p>
                    {citations.slice(0, 3).map((c) => (
                      <CitationChip key={c.index} citation={c} />
                    ))}
                  </p>
                )}
                <p style={{ marginBottom: 0 }}>
                  <strong>Parties: </strong>
                  {clip.draftReport.parties.map((p, i) => (
                    <span key={i}>
                      {p.role}:{" "}
                      {p.redactionCategory && p.name ? (
                        <RedactionToken
                          category={p.redactionCategory}
                          value={p.name}
                          revealable
                          onReveal={() =>
                            log(`Revealed ${p.redactionCategory} identity`)
                          }
                        />
                      ) : (
                        p.name ?? "—"
                      )}
                      {i < clip.draftReport.parties.length - 1 ? "; " : ""}
                    </span>
                  ))}
                </p>
              </AIResponseCard>

              {citations.length > 0 && (
                <Section title="Sources" count={citations.length}>
                  <CitationSources citations={citations} />
                </Section>
              )}
            </>
          )}
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <BackingServicesPanel
            services={[
              { kind: "asr", name: "whisper-large-v3", detail: "16kHz, multi-speaker diarization" },
              { kind: "llm", name: "llama-3.1-70b", detail: "structured-report prompt" },
              { kind: "object", name: "bodycam/", detail: "WORM, 7-year retention" },
            ]}
          />
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
                <input type="checkbox" defaultChecked /> Third-person voice
              </label>
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="checkbox" defaultChecked /> Redact victim PII
              </label>
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="checkbox" /> Include speculative leads
              </label>
              <div
                style={{
                  marginTop: 6,
                  fontSize: "var(--font-size-xs)",
                  color: "var(--aisp-text-muted)",
                }}
              >
                Trust: <ConfidenceBadge level={draft?.confidence ?? "medium"} />
              </div>
            </div>
          </Section>
          <AuditTrail entries={audit} />
        </aside>
      </div>
    </Workspace>
  );
}

export default BodyCamReportUseCase;
