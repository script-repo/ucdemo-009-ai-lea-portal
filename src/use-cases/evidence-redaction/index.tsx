import { useMemo, useState } from "react";
import {
  AuditTrail,
  type AuditEntry,
  Badge,
  Button,
  ConfidenceBadge,
  DisclaimerBar,
  HumanReviewBanner,
  Icon,
  Section,
  Select,
  StatusDot,
  StreamingIndicator,
  Workspace,
} from "@aisp/components";
import {
  BODY_CAM_CLIPS,
  type ProvenanceTag,
  useBackend,
  type VisionRedactionCategory,
  type VisionRedactionDetection,
} from "../../backend";
import type { BodyCamClip } from "../../backend/fixtures/bodyCam";
import { BackingServicesPanel } from "../../portal/BackingServicesPanel";
import bodyCamFrameTrafficUrl from "./bodycam-frame.png";
import bodyCamFrameDomesticUrl from "./bodycam-frame-domestic.png";

/**
 * Map from clip scenario to the still frame used as the redaction
 * preview poster. Falls back to the traffic-stop frame for any
 * scenario without an explicit asset.
 */
const FRAME_BY_SCENARIO: Record<BodyCamClip["scenario"], string> = {
  "traffic-stop": bodyCamFrameTrafficUrl,
  domestic: bodyCamFrameDomesticUrl,
  trespass: bodyCamFrameTrafficUrl,
};

/**
 * UC3 / UC5 — Automated Digital Evidence Redaction.
 *
 * Workflow:
 *   1. Reviewer picks a source clip and a set of categories to redact.
 *   2. Vision pipeline returns a frame-by-frame detection track.
 *   3. UI plays back the track on a synthetic SVG frame, showing
 *      redaction boxes at the current scrub position.
 *   4. Reviewer applies, rejects, or edits — chain of custody updated.
 */
export function EvidenceRedactionUseCase() {
  const backend = useBackend();
  const [clipId, setClipId] = useState(BODY_CAM_CLIPS[0]!.id);
  const clip = BODY_CAM_CLIPS.find((c) => c.id === clipId) ?? BODY_CAM_CLIPS[0]!;

  const [cats, setCats] = useState<Record<VisionRedactionCategory, boolean>>({
    FACE: true,
    LICENSE_PLATE: true,
    TATTOO: false,
    SCREEN_TEXT: false,
    DOCUMENT_TEXT: false,
  });

  const [busy, setBusy] = useState(false);
  const [detections, setDetections] = useState<VisionRedactionDetection[] | null>(null);
  const [outputRef, setOutputRef] = useState<string | null>(null);
  const [scrubMs, setScrubMs] = useState(0);
  const [decided, setDecided] = useState(false);

  const [audit, setAudit] = useState<AuditEntry[]>([
    {
      id: "0",
      timestamp: new Date(),
      actor: "Sgt. M. Chen (FOI)",
      action: "Opened Evidence Redaction",
    },
  ]);

  function log(action: string, ai = false) {
    setAudit((prev) => [
      ...prev,
      {
        id: String(prev.length),
        timestamp: new Date(),
        actor: ai ? "AISP" : "Sgt. M. Chen (FOI)",
        action,
        ai,
      },
    ]);
  }
  function logProv(label: string, p: ProvenanceTag) {
    log(`${label} via ${p.mode}/${p.source} (${p.latencyMs}ms)`, true);
  }

  function toggleCat(cat: VisionRedactionCategory) {
    setCats((prev) => ({ ...prev, [cat]: !prev[cat] }));
    log(`Toggled category ${cat} ${cats[cat] ? "off" : "on"}`);
  }

  async function run() {
    const selected = (Object.keys(cats) as VisionRedactionCategory[]).filter((c) => cats[c]);
    if (selected.length === 0) {
      log("No categories selected — nothing to do");
      return;
    }
    setBusy(true);
    setDetections(null);
    setOutputRef(null);
    setDecided(false);
    log(`Requested redaction (${selected.join(", ")}) on ${clip.id}`);
    try {
      const r = await backend.inference.redactVideo({
        sourceRef: clip.storageKey,
        categories: selected,
      });
      setDetections(r.data.detections);
      setOutputRef(r.data.outputRef);
      setScrubMs(0);
      logProv(
        `Detected ${r.data.detections.length} redaction regions across ${(r.data.durationMs / 1000).toFixed(0)}s`,
        r.provenance,
      );
    } catch (e) {
      log(`Redaction failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  // Active detections at the current scrub time (within ±1s window).
  const active = useMemo(() => {
    if (!detections) return [];
    return detections.filter((d) => Math.abs(d.frameMs - scrubMs) <= 1000);
  }, [detections, scrubMs]);

  const totalMs = 60_000;

  function applyRedaction() {
    log(`Applied redaction → ${outputRef}; chain of custody updated`);
    setDecided(true);
  }
  function rejectRedaction() {
    log("Rejected redaction proposal");
    setDecided(true);
  }

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
            title="Source clip"
            trailing={
              <Button
                variant="ai"
                size="sm"
                onClick={run}
                disabled={busy}
                leadingIcon={<Icon name="sparkles" size={14} />}
              >
                {busy ? "Detecting…" : "Run redaction"}
              </Button>
            }
          >
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Select
                value={clipId}
                onChange={(e) => {
                  setClipId(e.target.value);
                  setDetections(null);
                  setOutputRef(null);
                  setDecided(false);
                  log(`Selected clip ${e.target.value}`);
                }}
                style={{ flex: 1 }}
              >
                {BODY_CAM_CLIPS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.scenario} — {(c.durationMs / 1000).toFixed(0)}s
                  </option>
                ))}
              </Select>
              <Badge>{clip.officer}</Badge>
            </div>
          </Section>

          <Section title="Categories">
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {(Object.keys(cats) as VisionRedactionCategory[]).map((cat) => (
                <label
                  key={cat}
                  style={{
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                    fontSize: "var(--font-size-sm)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={cats[cat]}
                    onChange={() => toggleCat(cat)}
                  />
                  {cat.replace("_", " ")}
                </label>
              ))}
            </div>
          </Section>

          {busy && (
            <Section title="Working">
              <StreamingIndicator label="Detecting redaction regions" />
            </Section>
          )}

          {detections && (
            <Section
              title="Preview"
              meta={
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--font-size-xs)",
                    color: "var(--aisp-text-muted)",
                  }}
                >
                  {(scrubMs / 1000).toFixed(1)}s / {(totalMs / 1000).toFixed(0)}s
                </span>
              }
            >
              <RedactionFrame detections={active} frameUrl={FRAME_BY_SCENARIO[clip.scenario]} />
              <input
                type="range"
                min={0}
                max={totalMs}
                step={100}
                value={scrubMs}
                onChange={(e) => setScrubMs(Number(e.target.value))}
                style={{ width: "100%", marginTop: 8 }}
                aria-label="Scrub timeline"
              />
              <div
                style={{
                  marginTop: 8,
                  fontSize: "var(--font-size-xs)",
                  color: "var(--aisp-text-muted)",
                }}
              >
                {active.length} active redaction{active.length === 1 ? "" : "s"}{" "}
                at this frame.
              </div>
            </Section>
          )}

          {detections && !decided && (
            <HumanReviewBanner
              title="Reviewer approval required"
              body={`Approving will commit ${detections.length} redactions and update the chain of custody. The original clip remains immutable.`}
              acceptLabel="Apply redaction"
              rejectLabel="Reject"
              editLabel="Edit boxes"
              onAccept={applyRedaction}
              onReject={rejectRedaction}
              onEdit={() => log("Opened redaction editor")}
            />
          )}

          {outputRef && (
            <Section title="Output">
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--font-size-xs)",
                  color: "var(--aisp-text-muted)",
                }}
              >
                {outputRef}
              </div>
            </Section>
          )}
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <BackingServicesPanel
            services={[
              { kind: "vision", name: "ms-detr-redact-v2", detail: "faces, plates, screens" },
              { kind: "asr", name: "whisper-large-v3", detail: "audio PII pass" },
              { kind: "object", name: "bodycam/ → redacted/", detail: "side-car output bucket" },
              { kind: "relational", name: "disclosure_log", detail: "FOIA chain-of-custody" },
            ]}
          />
          {detections && (
            <Section title="Detections" count={detections.length}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  maxHeight: 220,
                  overflowY: "auto",
                }}
              >
                {detections.slice(0, 30).map((d, i) => (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "12px 60px 90px 1fr",
                      gap: 6,
                      alignItems: "center",
                      fontSize: "var(--font-size-xs)",
                      padding: "2px 0",
                      borderBottom: "1px solid var(--aisp-border-soft)",
                    }}
                  >
                    <StatusDot
                      variant={
                        d.confidence === "high"
                          ? "ok"
                          : d.confidence === "medium"
                            ? "warning"
                            : "error"
                      }
                    />
                    <span style={{ fontFamily: "var(--font-mono)" }}>
                      {(d.frameMs / 1000).toFixed(1)}s
                    </span>
                    <span>{d.category}</span>
                    <ConfidenceBadge level={d.confidence} />
                  </div>
                ))}
                {detections.length > 30 && (
                  <div
                    style={{
                      padding: 4,
                      color: "var(--aisp-text-muted)",
                      fontSize: "var(--font-size-xs)",
                    }}
                  >
                    + {detections.length - 30} more.
                  </div>
                )}
              </div>
            </Section>
          )}

          <Section title="Chain of custody">
            <div
              style={{
                fontSize: "var(--font-size-sm)",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div>
                <strong>Source:</strong>{" "}
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--font-size-xs)",
                  }}
                >
                  {clip.storageKey}
                </span>
              </div>
              <div>
                <strong>Original SHA-256:</strong>{" "}
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--font-size-xs)",
                  }}
                >
                  0000…0000
                </span>
              </div>
              {outputRef && (
                <div>
                  <strong>Redacted output:</strong>{" "}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--font-size-xs)",
                    }}
                  >
                    {outputRef}
                  </span>
                </div>
              )}
              <div
                style={{
                  marginTop: 6,
                  fontSize: "var(--font-size-xs)",
                  color: "var(--aisp-text-muted)",
                }}
              >
                Per TPS Procedure 04-13 the redaction audit log is retained
                for 7 years.
              </div>
            </div>
          </Section>

          <AuditTrail entries={audit} />
        </aside>
      </div>
    </Workspace>
  );
}

/**
 * Body-cam still frame the detection track is overlaid onto.
 *
 * The PNG is imported (Vite hashes + bundles it) and rendered inside
 * an SVG so the bbox overlay layer can use the same normalized 0..1
 * coordinates against any underlying media. When the use case pivots
 * from this still to a real `<video>`, the overlay code stays put —
 * just the underlying element changes.
 */
function RedactionFrame({
  detections,
  frameUrl,
}: {
  detections: VisionRedactionDetection[];
  frameUrl: string;
}) {
  const w = 1024;
  const h = 768;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      style={{
        background: "#000000",
        border: "1px solid var(--aisp-border)",
        display: "block",
      }}
      aria-label="Body-cam redaction preview frame"
      preserveAspectRatio="xMidYMid meet"
    >
      <image
        href={frameUrl}
        x={0}
        y={0}
        width={w}
        height={h}
        preserveAspectRatio="xMidYMid slice"
      />

      {detections.map((d, i) => (
        <g key={i}>
          <rect
            x={d.bbox.x * w}
            y={d.bbox.y * h}
            width={d.bbox.w * w}
            height={d.bbox.h * h}
            fill="var(--ai-redaction-bg)"
            opacity={0.92}
          />
          <text
            x={d.bbox.x * w + 6}
            y={d.bbox.y * h + 18}
            style={{
              font: "14px Consolas",
              fill: "var(--ai-redaction-text)",
            }}
          >
            {d.category}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default EvidenceRedactionUseCase;
