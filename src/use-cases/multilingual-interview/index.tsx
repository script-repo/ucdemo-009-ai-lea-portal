import { useState } from "react";
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
  RedactionToken,
  Section,
  Select,
  StreamingIndicator,
  Workspace,
} from "@aisp/components";
import {
  INTERVIEWS,
  type ProvenanceTag,
  type TranscriptSegment,
  useBackend,
} from "../../backend";
import { BackingServicesPanel } from "../../portal/BackingServicesPanel";

/**
 * UC4 — Multilingual Interview Transcription & Translation.
 *
 * Workflow:
 *   1. Officer picks an interview clip (Mandarin / Tagalog).
 *   2. ASR returns segment-level source transcript + inline translation.
 *   3. UI renders bilingual conversation, side-by-side.
 *   4. LLM generates a structured English statement summary.
 *   5. Review banner gates the summary becoming a record.
 */
export function MultilingualInterviewUseCase() {
  const backend = useBackend();
  const [clipId, setClipId] = useState(INTERVIEWS[0]!.id);
  const clip = INTERVIEWS.find((c) => c.id === clipId) ?? INTERVIEWS[0]!;

  const [segments, setSegments] = useState<TranscriptSegment[] | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<{
    text: string;
    confidence: "high" | "medium" | "low";
    timestamp: Date;
  } | null>(null);

  const [audit, setAudit] = useState<AuditEntry[]>([
    {
      id: "0",
      timestamp: new Date(),
      actor: "Cst. P. Reyes",
      action: "Opened Multilingual Interview",
    },
  ]);

  function log(action: string, ai = false) {
    setAudit((prev) => [
      ...prev,
      {
        id: String(prev.length),
        timestamp: new Date(),
        actor: ai ? "AISP" : "Cst. P. Reyes",
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
    setSummary(null);
    log(`Requested transcription of ${clip.id} (${clip.primaryLanguage})`);
    try {
      const r = await backend.inference.transcribe({
        audioRef: clip.id,
        language: clip.primaryLanguage,
      });
      setSegments(r.data.segments);
      logProv(
        `Transcribed ${r.data.segments.length} segments (${r.data.detectedLanguages.join(", ")})`,
        r.provenance,
      );
    } catch (e) {
      log(`Transcription failed: ${(e as Error).message}`);
    } finally {
      setTranscribing(false);
    }
  }

  async function summarize() {
    if (!segments) return;
    setSummarizing(true);
    setSummary(null);
    log("Requested structured English summary");
    try {
      const r = await backend.inference.complete({
        useCaseId: "multilingual-interview",
        prompt: `Summarize interview ${clip.id} as an English structured witness statement.`,
        context: segments.map((s, i) => ({
          id: `seg-${i}`,
          title: `${s.speaker} @ ${(s.startMs / 1000).toFixed(1)}s`,
          snippet: s.translation ?? s.text,
        })),
      });
      setSummary({
        text: r.data.text,
        confidence: r.data.confidence,
        timestamp: new Date(),
      });
      logProv(`Generated summary (${r.data.text.length} chars)`, r.provenance);
    } catch (e) {
      log(`Summary failed: ${(e as Error).message}`);
    } finally {
      setSummarizing(false);
    }
  }

  function accept() {
    log("Accepted summary — would post to interview record");
    setSummary(null);
  }
  function reject() {
    log("Rejected summary");
    setSummary(null);
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
            title="Interview clip"
            trailing={
              <Button
                variant="ai"
                size="sm"
                onClick={transcribe}
                disabled={transcribing}
                leadingIcon={<Icon name="sparkles" size={14} />}
              >
                {transcribing ? "Transcribing…" : segments ? "Re-transcribe" : "Transcribe + translate"}
              </Button>
            }
          >
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Select
                value={clipId}
                onChange={(e) => {
                  setClipId(e.target.value);
                  setSegments(null);
                  setSummary(null);
                  log(`Selected clip ${e.target.value}`);
                }}
                style={{ flex: 1 }}
              >
                {INTERVIEWS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.intervieweeRole} — {c.primaryLanguage} — {(c.durationMs / 1000).toFixed(0)}s
                  </option>
                ))}
              </Select>
              <Badge variant="ai">{clip.primaryLanguage}</Badge>
            </div>
          </Section>

          {transcribing && (
            <Section title="Working">
              <StreamingIndicator label="Transcribing + translating" />
            </Section>
          )}

          {segments && !transcribing && (
            <Section
              title="Bilingual transcript"
              count={segments.length}
              trailing={
                <Button
                  variant="ai"
                  size="sm"
                  onClick={summarize}
                  disabled={summarizing}
                  leadingIcon={<Icon name="sparkles" size={14} />}
                >
                  {summarizing ? "Summarizing…" : "Generate English statement"}
                </Button>
              }
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  maxHeight: 360,
                  overflowY: "auto",
                  paddingRight: 4,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 100px 1fr 1fr",
                    gap: 8,
                    fontSize: "var(--font-size-xs)",
                    color: "var(--aisp-text-muted)",
                    paddingBottom: 4,
                    borderBottom: "1px solid var(--aisp-border)",
                  }}
                >
                  <span>Time</span>
                  <span>Speaker</span>
                  <span>Source</span>
                  <span>English</span>
                </div>
                {segments.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "60px 100px 1fr 1fr",
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
                    <span>
                      <span style={{ fontWeight: 600 }}>{s.speaker}</span>{" "}
                      <Badge>{s.language ?? clip.primaryLanguage}</Badge>
                    </span>
                    <span>{s.text}</span>
                    <span style={{ color: "var(--aisp-text-muted)" }}>
                      {s.translation ??
                        (s.language === "en-US" ? (
                          <em>(English original)</em>
                        ) : (
                          "—"
                        ))}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {summarizing && (
            <Section title="Working">
              <StreamingIndicator label="Drafting English statement" />
            </Section>
          )}

          {summary && (
            <>
              <HumanReviewBanner
                title="Officer review required"
                body="Verify the English statement against the bilingual transcript before posting to the interview record."
                onAccept={accept}
                onReject={reject}
                onEdit={() => log("Opened summary for editing")}
              />
              <AIResponseCard
                role="ai"
                model="AISP · Interview Summary"
                confidence={summary.confidence}
                timestamp={summary.timestamp}
                actions={
                  <Button
                    variant="ghost"
                    size="sm"
                    leadingIcon={<Icon name="copy" size={14} />}
                    onClick={() => log("Copied summary to clipboard")}
                  >
                    Copy
                  </Button>
                }
              >
                <p style={{ marginTop: 0 }}>{summary.text}</p>
                <p style={{ marginBottom: 0, fontSize: "var(--font-size-sm)" }}>
                  <strong>Interviewee role:</strong> {clip.intervieweeRole} —{" "}
                  {clip.intervieweeRole === "victim" ? (
                    <RedactionToken
                      category="VICTIM"
                      value="(name retained in source record)"
                      revealable
                      onReveal={() => log("Revealed victim identity")}
                    />
                  ) : (
                    <Badge>name on file</Badge>
                  )}
                </p>
              </AIResponseCard>
            </>
          )}
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <BackingServicesPanel
            services={[
              { kind: "asr", name: "whisper-large-v3", detail: "language-ID + diarization" },
              { kind: "translation", name: "nllb-200-3.3b", detail: "200-language model" },
              { kind: "llm", name: "llama-3.1-70b", detail: "English statement structuring" },
              { kind: "object", name: "interview-audio/", detail: "encrypted at rest" },
            ]}
          />
          <Section title="Detected languages" count={clip.detectedLanguages.length}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {clip.detectedLanguages.map((l) => (
                <Badge key={l} variant="ai">
                  {l}
                </Badge>
              ))}
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: "var(--font-size-xs)",
                color: "var(--aisp-text-muted)",
              }}
            >
              Translation model: NLLB-200, source-retained alongside English.
            </div>
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
                <input type="checkbox" defaultChecked /> Retain source-language
                transcript
              </label>
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="checkbox" defaultChecked /> Redact victim PII
              </label>
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="checkbox" /> Mark as sworn
              </label>
              <div
                style={{
                  marginTop: 6,
                  fontSize: "var(--font-size-xs)",
                  color: "var(--aisp-text-muted)",
                }}
              >
                Trust:{" "}
                <ConfidenceBadge level={summary?.confidence ?? "medium"} />
              </div>
            </div>
          </Section>
          <AuditTrail entries={audit} />
        </aside>
      </div>
    </Workspace>
  );
}

export default MultilingualInterviewUseCase;
