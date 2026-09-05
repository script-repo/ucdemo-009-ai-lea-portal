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
  Input,
  RedactionToken,
  Section,
  Select,
  StatusDot,
  StreamingIndicator,
  Workspace,
} from "@aisp/components";
import {
  type Call911,
  type CallCategory,
  CALLS_911_DATE_RANGE,
  type ProvenanceTag,
  TPS_DIVISIONS,
  useBackend,
} from "../../backend";
import { BackingServicesPanel } from "../../portal/BackingServicesPanel";
import { InferenceUsage, usageFromCompletion } from "../../portal/InferenceUsage";
import { MarkdownBody } from "../../portal/MarkdownBody";

const CATEGORIES: CallCategory[] = [
  "Domestic",
  "Mental health",
  "Property",
  "Suspicious person",
  "Traffic",
  "Medical",
  "Hang-up",
  "Other",
];

const HOURS = Array.from({ length: 24 }, (_, h) => h);
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * UC8 — 911 Transcript Insights (enhanced).
 *
 * Workflow:
 *   1. Analyst filters the de-identified call set by date / division /
 *      category / search.
 *   2. UI renders the call table, plus per-category, per-disposition,
 *      per-division, hour-of-day and day-of-week breakdowns, plus
 *      interpreter-language and MCIT co-response stats.
 *   3. Click any row to see an anonymized detail card.
 *   4. Optional AI summary generates a privacy-preserving narrative.
 */
export function Transcript911UseCase() {
  const backend = useBackend();

  const defaultStart = CALLS_911_DATE_RANGE.min.slice(0, 10);
  const defaultEnd = CALLS_911_DATE_RANGE.max.slice(0, 10);

  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [division, setDivision] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [calls, setCalls] = useState<Call911[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<{
    text: string;
    confidence: "high" | "medium" | "low";
    timestamp: Date;
    tokensUsed: number;
    promptTokens?: number;
    completionTokens?: number;
    tokensEstimated?: boolean;
  } | null>(null);

  const [audit, setAudit] = useState<AuditEntry[]>([
    {
      id: "0",
      timestamp: new Date(),
      actor: "Analyst R. Patel",
      action: `Opened 911 Transcript Insights — ${CALLS_911_DATE_RANGE.count} calls available`,
    },
  ]);

  function log(action: string, ai = false) {
    setAudit((prev) => [
      ...prev,
      {
        id: String(prev.length),
        timestamp: new Date(),
        actor: ai ? "AISP" : "Analyst R. Patel",
        action,
        ai,
      },
    ]);
  }
  function logProv(label: string, p: ProvenanceTag) {
    log(`${label} via ${p.mode}/${p.source} (${p.latencyMs}ms)`, true);
  }

  // Reload calls whenever a filter changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const where: Record<string, string | number | boolean> = {};
        if (division) where.division = Number(division);
        if (category) where.category = category;
        const res = await backend.relational.query<Call911>({
          table: "calls911",
          where,
          search: search || undefined,
          orderBy: ["timestamp:desc"],
          limit: 800,
        });
        if (cancelled) return;
        // Apply client-side date filter (the relational backend doesn't
        // know about ranges in this demo — keep the filter pure here).
        const filtered = res.data.rows.filter((c) => {
          const day = c.timestamp.slice(0, 10);
          return day >= start && day <= end;
        });
        setCalls(filtered);
        setTotal(filtered.length);
        logProv(
          `Loaded ${filtered.length} of ${res.data.total} calls (${start} → ${end})`,
          res.provenance,
        );
      } catch (e) {
        if (cancelled) return;
        log(`Load failed: ${(e as Error).message}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [division, category, search, start, end, backend.mode]);

  async function generateSummary() {
    setSummarizing(true);
    setSummary(null);
    log("Requested insight summary on visible call set");
    try {
      const r = await backend.inference.complete({
        useCaseId: "transcript-911",
        prompt: `Summarize trends in the visible 911 call set (${calls.length} calls, ${start} → ${end}). Preserve caller privacy.`,
      });
      setSummary({
        text: r.data.text,
        confidence: r.data.confidence,
        timestamp: new Date(),
        ...usageFromCompletion(r.data),
      });
      logProv(`Generated insight summary`, r.provenance);
    } catch (e) {
      log(`Summary failed: ${(e as Error).message}`);
    } finally {
      setSummarizing(false);
    }
  }

  // ── Aggregations over the visible call set ────────────────────────
  const byCategory = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of calls) m.set(c.category, (m.get(c.category) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [calls]);

  const byDisposition = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of calls) m.set(c.disposition, (m.get(c.disposition) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [calls]);

  const byDivision = useMemo(() => {
    const m = new Map<number, number>();
    for (const c of calls) m.set(c.division, (m.get(c.division) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [calls]);

  const byHour = useMemo(() => {
    const arr = new Array(24).fill(0) as number[];
    for (const c of calls) {
      const h = new Date(c.timestamp).getHours();
      arr[h] = (arr[h] ?? 0) + 1;
    }
    return arr;
  }, [calls]);

  const byDow = useMemo(() => {
    const arr = new Array(7).fill(0) as number[];
    for (const c of calls) {
      const d = new Date(c.timestamp).getDay();
      arr[d] = (arr[d] ?? 0) + 1;
    }
    return arr;
  }, [calls]);

  const byInterpreter = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of calls) {
      if (!c.hadInterpreter) continue;
      const lang = c.interpreterLanguage ?? "Unspecified";
      m.set(lang, (m.get(lang) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [calls]);

  const headlineStats = useMemo(() => {
    const dispatched = calls.filter(
      (c) => c.disposition === "Officer dispatched" || c.disposition === "Referred to mental-health team",
    );
    const interp = calls.filter((c) => c.hadInterpreter);
    const mcit = calls.filter((c) => c.mcitDispatched);
    const respTimes = dispatched
      .map((c) => c.responseTimeSec)
      .filter((x): x is number => typeof x === "number")
      .sort((a, b) => a - b);
    const median = respTimes.length
      ? respTimes.length % 2 === 0
        ? Math.round((respTimes[respTimes.length / 2 - 1]! + respTimes[respTimes.length / 2]!) / 2)
        : respTimes[Math.floor(respTimes.length / 2)]!
      : null;
    const mean = respTimes.length
      ? Math.round(respTimes.reduce((a, b) => a + b, 0) / respTimes.length)
      : null;
    return {
      total: calls.length,
      dispatched: dispatched.length,
      dispatchedPct: calls.length ? Math.round((dispatched.length / calls.length) * 100) : 0,
      interpreter: interp.length,
      interpreterPct: calls.length ? Math.round((interp.length / calls.length) * 100) : 0,
      mcit: mcit.length,
      median,
      mean,
    };
  }, [calls]);

  const selected = selectedId ? calls.find((c) => c.id === selectedId) ?? null : null;

  return (
    <Workspace>
      <DisclaimerBar />

      <Section
        title="Privacy notice"
        meta={<Badge variant="ok">PII stripped at intake</Badge>}
      >
        <p
          style={{
            margin: 0,
            fontSize: "var(--font-size-sm)",
            color: "var(--aisp-text-muted)",
          }}
        >
          All caller identifiers are hashed at intake. No raw audio, phone
          number, or address is exposed in this view. Excerpts are redacted
          by default; reveal events are audited.
        </p>
      </Section>

      <Section title="Filters" count={total}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 10,
          }}
        >
          <FilterField label="From">
            <Input
              type="date"
              value={start}
              min={defaultStart}
              max={end}
              onChange={(e) => {
                setStart(e.target.value);
                log(`Filter from=${e.target.value}`);
              }}
            />
          </FilterField>
          <FilterField label="To">
            <Input
              type="date"
              value={end}
              min={start}
              max={defaultEnd}
              onChange={(e) => {
                setEnd(e.target.value);
                log(`Filter to=${e.target.value}`);
              }}
            />
          </FilterField>
          <FilterField label="Division">
            <Select
              value={division}
              onChange={(e) => {
                setDivision(e.target.value);
                log(`Filter division=${e.target.value || "all"}`);
              }}
            >
              <option value="">All divisions</option>
              {TPS_DIVISIONS.map((d) => (
                <option key={d} value={d}>
                  Division {d}
                </option>
              ))}
            </Select>
          </FilterField>
          <FilterField label="Category">
            <Select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                log(`Filter category=${e.target.value || "all"}`);
              }}
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </FilterField>
          <FilterField label="Search">
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Free text…"
            />
          </FilterField>
          <FilterField label=" ">
            <Button
              variant="ai"
              onClick={generateSummary}
              disabled={summarizing || calls.length === 0}
              leadingIcon={<Icon name="sparkles" size={14} />}
            >
              {summarizing ? "Summarizing…" : "Generate insight summary"}
            </Button>
          </FilterField>
        </div>
      </Section>

      <Section title="Headline stats">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 10,
          }}
        >
          <Stat label="Total calls" value={String(headlineStats.total)} />
          <Stat
            label="Officer dispatched"
            value={`${headlineStats.dispatched} (${headlineStats.dispatchedPct}%)`}
          />
          <Stat
            label="Median response"
            value={headlineStats.median != null ? fmtSec(headlineStats.median) : "—"}
            helper={headlineStats.mean != null ? `Mean ${fmtSec(headlineStats.mean)}` : undefined}
          />
          <Stat
            label="Interpreter used"
            value={`${headlineStats.interpreter} (${headlineStats.interpreterPct}%)`}
          />
          <Stat
            label="MCIT co-response"
            value={String(headlineStats.mcit)}
            helper="Mobile Crisis Intervention Team"
          />
        </div>
      </Section>

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
            title="Calls"
            count={calls.length}
            meta={loading ? "loading…" : undefined}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                maxHeight: 380,
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 50px 110px 130px 60px 60px 1fr",
                  gap: 6,
                  fontSize: "var(--font-size-xs)",
                  color: "var(--aisp-text-muted)",
                  paddingBottom: 4,
                  borderBottom: "1px solid var(--aisp-border)",
                }}
              >
                <span>Time</span>
                <span>Div</span>
                <span>Category</span>
                <span>Disposition</span>
                <span>Resp.</span>
                <span>Intp.</span>
                <span>Excerpt</span>
              </div>
              {calls.slice(0, 200).map((c) => (
                <CallRow
                  key={c.id}
                  call={c}
                  selected={selectedId === c.id}
                  onSelect={() => {
                    setSelectedId(c.id);
                    log(`Opened call detail ${c.callerHash}`);
                  }}
                  onReveal={() => log(`Revealed excerpt for ${c.callerHash}`)}
                />
              ))}
              {calls.length > 200 && (
                <div
                  style={{
                    padding: 8,
                    fontSize: "var(--font-size-xs)",
                    color: "var(--aisp-text-muted)",
                  }}
                >
                  + {calls.length - 200} more calls match — narrow the filter
                  or use the breakdowns to drill in.
                </div>
              )}
              {!loading && calls.length === 0 && (
                <div
                  style={{
                    padding: 8,
                    color: "var(--aisp-text-muted)",
                    fontSize: "var(--font-size-sm)",
                  }}
                >
                  No calls match the current filters.
                </div>
              )}
            </div>
          </Section>

          {selected && (
            <Section
              title={`Detail — ${selected.callerHash}`}
              meta={<Badge variant="blue">read-only</Badge>}
              trailing={
                <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
                  Close
                </Button>
              }
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  fontSize: "var(--font-size-sm)",
                }}
              >
                <DetailRow label="Time" value={new Date(selected.timestamp).toLocaleString()} />
                <DetailRow label="Division" value={String(selected.division)} />
                <DetailRow label="Category" value={selected.category} />
                <DetailRow label="Disposition" value={selected.disposition} />
                <DetailRow
                  label="Duration"
                  value={`${Math.round(selected.durationSec / 60)}m ${selected.durationSec % 60}s`}
                />
                <DetailRow
                  label="Response time"
                  value={selected.responseTimeSec != null ? fmtSec(selected.responseTimeSec) : "—"}
                />
                <DetailRow
                  label="Interpreter"
                  value={
                    selected.hadInterpreter
                      ? selected.interpreterLanguage ?? "Yes (lang unspecified)"
                      : "No"
                  }
                />
                <DetailRow
                  label="MCIT co-response"
                  value={selected.mcitDispatched ? "Yes" : "—"}
                />
              </div>
              <div style={{ marginTop: 10, fontSize: "var(--font-size-sm)" }}>
                <strong>Excerpt: </strong>
                <RedactionToken
                  category="CONFIDENTIAL"
                  value={selected.excerpt}
                  revealable
                  onReveal={() => log(`Revealed excerpt for ${selected.callerHash} (detail panel)`)}
                />
              </div>
            </Section>
          )}

          {summarizing && (
            <Section title="Working">
              <StreamingIndicator label="Drafting insight summary" />
            </Section>
          )}

          {summary && (
            <>
              <HumanReviewBanner
                title="Analyst review required"
                body="Summary may inform an internal report. Verify the figures against the visible call set before posting."
                onAccept={() => {
                  log("Accepted summary — would post to internal report");
                  setSummary(null);
                }}
                onReject={() => {
                  log("Rejected summary");
                  setSummary(null);
                }}
                onEdit={() => log("Opened summary for editing")}
              />
              <AIResponseCard
                role="ai"
                model="AISP · 911 Insight Summary"
                confidence={summary.confidence}
                timestamp={summary.timestamp}
                footer={<InferenceUsage {...summary} />}
              >
                <MarkdownBody>{summary.text}</MarkdownBody>
              </AIResponseCard>
            </>
          )}
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <BackingServicesPanel
            services={[
              { kind: "relational", name: "calls911", detail: "de-identified at intake" },
              { kind: "llm", name: "llama-3.1-70b", detail: "privacy-preserving summary" },
            ]}
          />
          <Section title="Hour of day">
            <HourChart hours={byHour} />
          </Section>
          <Section title="Day of week">
            <DayChart days={byDow} />
          </Section>
          <Section title="By category" count={byCategory.length}>
            <BarChart rows={byCategory} max={Math.max(...byCategory.map((r) => r[1]), 1)} />
          </Section>
          <Section title="By disposition" count={byDisposition.length}>
            <BarChart rows={byDisposition} max={Math.max(...byDisposition.map((r) => r[1]), 1)} />
          </Section>
          <Section title="Top divisions" count={byDivision.length}>
            <BarChart
              rows={byDivision.map(([d, n]): [string, number] => [`Div ${d}`, n])}
              max={Math.max(...byDivision.map((r) => r[1]), 1)}
            />
          </Section>
          <Section title="Interpreter" count={byInterpreter.length}>
            {byInterpreter.length === 0 ? (
              <div
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--aisp-text-muted)",
                }}
              >
                No interpreter usage in the visible set.
              </div>
            ) : (
              <BarChart
                rows={byInterpreter}
                max={Math.max(...byInterpreter.map((r) => r[1]), 1)}
              />
            )}
          </Section>
          <Section title="Trust">
            <div style={{ fontSize: "var(--font-size-sm)" }}>
              <ConfidenceBadge level={summary?.confidence ?? "medium"} />
            </div>
          </Section>
          <AuditTrail entries={audit} />
        </aside>
      </div>
    </Workspace>
  );
}

function fmtSec(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label
        style={{
          fontSize: "var(--font-size-xs)",
          color: "var(--aisp-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div
      style={{
        padding: 10,
        border: "1px solid var(--aisp-border)",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          fontSize: "var(--font-size-xs)",
          color: "var(--aisp-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "var(--font-size-xl)", fontWeight: 600 }}>{value}</div>
      {helper && (
        <div
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--aisp-text-muted)",
          }}
        >
          {helper}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontSize: "var(--font-size-xs)",
          color: "var(--aisp-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>
      <div>{value}</div>
    </div>
  );
}

function CallRow({
  call,
  selected,
  onSelect,
  onReveal,
}: {
  call: Call911;
  selected: boolean;
  onSelect: () => void;
  onReveal: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      style={{
        display: "grid",
        gridTemplateColumns: "120px 50px 110px 130px 60px 60px 1fr",
        gap: 6,
        fontSize: "var(--font-size-sm)",
        padding: "4px 6px",
        borderBottom: "1px solid var(--aisp-border-soft)",
        cursor: "pointer",
        background: selected ? "var(--ai-citation-bg)" : "transparent",
      }}
    >
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--font-size-xs)" }}>
        {new Date(call.timestamp).toLocaleString()}
      </span>
      <span>{call.division}</span>
      <span>
        <StatusDot
          variant={
            call.category === "Domestic" || call.category === "Mental health"
              ? "warning"
              : call.category === "Hang-up"
                ? "muted"
                : "info"
          }
        />{" "}
        {call.category}
      </span>
      <span style={{ color: "var(--aisp-text-muted)" }}>{call.disposition}</span>
      <span>
        {call.responseTimeSec != null ? `${Math.round(call.responseTimeSec / 60)}m` : "—"}
      </span>
      <span>
        {call.hadInterpreter ? (
          <Badge variant="ai">{call.interpreterLanguage?.slice(0, 4) ?? "yes"}</Badge>
        ) : (
          "—"
        )}
      </span>
      <span onClick={(e) => e.stopPropagation()}>
        <RedactionToken
          category="CONFIDENTIAL"
          value={call.excerpt}
          revealable
          onReveal={onReveal}
        />
      </span>
    </div>
  );
}

function BarChart({ rows, max }: { rows: Array<[string, number]>; max: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {rows.map(([label, count]) => {
        const pct = (count / max) * 100;
        return (
          <div key={label} style={{ fontSize: "var(--font-size-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{label}</span>
              <span style={{ color: "var(--aisp-text-muted)" }}>{count}</span>
            </div>
            <div
              style={{
                height: 6,
                background: "var(--aisp-muted-bg)",
                border: "1px solid var(--aisp-border-soft)",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: "var(--ai-accent)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HourChart({ hours }: { hours: number[] }) {
  const max = Math.max(...hours, 1);
  const w = 280;
  const h = 90;
  const colW = w / 24;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h + 16}`} width="100%" aria-label="Hour-of-day distribution">
        {hours.map((count, i) => {
          const barH = (count / max) * h;
          return (
            <g key={i}>
              <rect
                x={i * colW + 1}
                y={h - barH}
                width={colW - 2}
                height={barH}
                fill="var(--ai-accent)"
              >
                <title>
                  {String(i).padStart(2, "0")}:00 — {count} call{count === 1 ? "" : "s"}
                </title>
              </rect>
              {i % 6 === 0 && (
                <text
                  x={i * colW + colW / 2}
                  y={h + 12}
                  textAnchor="middle"
                  style={{ font: "9px Arial", fill: "var(--aisp-text-muted)" }}
                >
                  {String(i).padStart(2, "0")}:00
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div
        style={{
          marginTop: 4,
          fontSize: "var(--font-size-xs)",
          color: "var(--aisp-text-muted)",
        }}
      >
        Peak hour: {peakHour(hours)}
      </div>
    </div>
  );
}

function DayChart({ days }: { days: number[] }) {
  const max = Math.max(...days, 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {days.map((count, i) => {
        const pct = (count / max) * 100;
        return (
          <div key={i} style={{ fontSize: "var(--font-size-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{DOW[i]}</span>
              <span style={{ color: "var(--aisp-text-muted)" }}>{count}</span>
            </div>
            <div
              style={{
                height: 6,
                background: "var(--aisp-muted-bg)",
                border: "1px solid var(--aisp-border-soft)",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: "var(--aisp-status-info)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function peakHour(hours: number[]) {
  let max = 0;
  let idx = 0;
  for (let i = 0; i < HOURS.length; i++) {
    if (hours[i]! > max) {
      max = hours[i]!;
      idx = i;
    }
  }
  return `${String(idx).padStart(2, "0")}:00 (${max} calls)`;
}

export default Transcript911UseCase;
