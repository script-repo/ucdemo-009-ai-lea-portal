import { useMemo, useState } from "react";
import {
  AIPromptBar,
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
  Section,
  StatusDot,
  StreamingIndicator,
  Workspace,
} from "@aisp/components";
import {
  type CannedPlan,
  CANNED_PLANS,
  MCP_SERVERS,
  type MCPServer,
  type PlanStep,
  type ProvenanceTag,
  useBackend,
} from "../../backend";
import { BackingServicesPanel } from "../../portal/BackingServicesPanel";

/**
 * UC9 — Database Integration via MCP federation.
 *
 * Workflow:
 *   1. Officer types or picks a sample question.
 *   2. The "agent" emits a multi-step plan (decomposed across MCP servers).
 *   3. Each step is run sequentially against `backend.relational.query`,
 *      using the table the MCP gateway would proxy to upstream.
 *   4. The combined result rows are shown with per-row server provenance.
 *   5. A synthesis call summarises the cross-system answer for the
 *      officer, with citations indexing back to plan steps.
 */
export function DatabaseIntegrationUseCase() {
  const backend = useBackend();
  const [running, setRunning] = useState(false);
  const [plan, setPlan] = useState<CannedPlan | null>(null);
  const [stepStatus, setStepStatus] = useState<Record<number, StepStatus>>({});
  const [stepResults, setStepResults] = useState<Record<number, StepResult>>({});
  const [synthesis, setSynthesis] = useState<{
    text: string;
    confidence: "high" | "medium" | "low";
    timestamp: Date;
    citationSteps: number[];
  } | null>(null);

  const [audit, setAudit] = useState<AuditEntry[]>([
    {
      id: "0",
      timestamp: new Date(),
      actor: "Det. K. Singh",
      action: `Opened Database Integration — ${MCP_SERVERS.length} MCP servers federated`,
    },
  ]);

  function log(action: string, ai = false) {
    setAudit((prev) => [
      ...prev,
      {
        id: String(prev.length),
        timestamp: new Date(),
        actor: ai ? "AISP Agent" : "Det. K. Singh",
        action,
        ai,
      },
    ]);
  }
  function logProv(label: string, p: ProvenanceTag) {
    log(`${label} via ${p.mode}/${p.source} (${p.latencyMs}ms)`, true);
  }

  async function runPlan(prompt: string) {
    const matched = CANNED_PLANS.find((p) => p.match.test(prompt));
    if (!matched) {
      log(`No federated plan found for: "${prompt}"`);
      setPlan(null);
      setSynthesis({
        text: "I do not have a federated query plan for that question yet. Pick one of the sample questions below, or rephrase as a person, vehicle plate, or address lookup.",
        confidence: "low",
        timestamp: new Date(),
        citationSteps: [],
      });
      return;
    }
    setRunning(true);
    setPlan(matched);
    setStepStatus(Object.fromEntries(matched.steps.map((s) => [s.step, "pending"])));
    setStepResults({});
    setSynthesis(null);
    log(`Plan accepted (${matched.steps.length} steps across ${countServers(matched)} MCP servers)`, true);

    try {
      for (const step of matched.steps) {
        setStepStatus((prev) => ({ ...prev, [step.step]: "running" }));
        log(`step ${step.step} → ${step.serverId}.${step.tool}(${prettyParams(step.params)})`, true);
        const t0 = performance.now();
        const r = await backend.relational.query<Record<string, unknown>>({
          table: step.table,
          where: step.where,
        });
        const elapsed = Math.max(1, Math.round(performance.now() - t0));
        const server = MCP_SERVERS.find((s) => s.id === step.serverId);
        const totalLatency = elapsed + (server?.rttMs ?? 0);
        setStepResults((prev) => ({
          ...prev,
          [step.step]: {
            rows: r.data.rows,
            provenance: r.provenance,
            displayedLatencyMs: totalLatency,
          },
        }));
        setStepStatus((prev) => ({ ...prev, [step.step]: "done" }));
        logProv(
          `step ${step.step} ✓ ${step.serverId} (${r.data.rows.length} row${r.data.rows.length === 1 ? "" : "s"}, ${totalLatency}ms)`,
          r.provenance,
        );
      }

      const synth = await backend.inference.complete({
        useCaseId: "database-integration",
        prompt: matched.question,
      });
      setSynthesis({
        text: synth.data.text,
        confidence: synth.data.confidence,
        timestamp: new Date(),
        citationSteps: synth.data.citations,
      });
      logProv(`synthesis ready`, synth.provenance);
    } catch (e) {
      log(`Plan execution failed: ${(e as Error).message}`);
    } finally {
      setRunning(false);
    }
  }

  function accept() {
    log("Accepted federated answer — would attach to case file");
    setSynthesis(null);
    setPlan(null);
    setStepResults({});
    setStepStatus({});
  }
  function reject() {
    log("Rejected federated answer");
    setSynthesis(null);
  }

  const citations: Citation[] = useMemo(() => {
    if (!synthesis || !plan) return [];
    const list: Citation[] = [];
    for (const step of plan.steps) {
      const rows = stepResults[step.step]?.rows ?? [];
      const server = MCP_SERVERS.find((s) => s.id === step.serverId);
      list.push({
        index: step.step,
        title: `Step ${step.step} — ${server?.label ?? step.serverId}.${step.tool}`,
        meta: `${rows.length} row${rows.length === 1 ? "" : "s"} · ${stepResults[step.step]?.displayedLatencyMs ?? 0}ms · ${prettyParams(step.params)}`,
        onOpen: () => log(`Opened source step #${step.step}`),
      });
    }
    return list;
  }, [synthesis, plan, stepResults]);

  return (
    <Workspace>
      <DisclaimerBar />

      <Section
        title="What is being federated"
        meta={
          <span style={{ display: "flex", gap: 6 }}>
            <Badge variant="ai">MCP gateway</Badge>
            <Badge>{MCP_SERVERS.length} servers</Badge>
          </span>
        }
      >
        <p
          style={{
            margin: 0,
            fontSize: "var(--font-size-sm)",
            color: "var(--aisp-text-muted)",
          }}
        >
          Each connected database is fronted by an MCP server with a typed
          tool catalog. The AISP agent decomposes the officer's plain
          question into a multi-step plan, calls only the tools it needs,
          and synthesises a single grounded answer with per-step
          provenance. Nothing executes without a plan the officer can
          read first.
        </p>
      </Section>

      <Section title="Ask">
        <AIPromptBar
          placeholder="Ask: 'What do we know about Daniel Reyes?', 'Vehicle CFGB-481', '44 Charles St W'…"
          onSubmit={runPlan}
          busy={running}
        />
        <div
          style={{
            marginTop: 8,
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            fontSize: "var(--font-size-sm)",
          }}
        >
          <span style={{ color: "var(--aisp-text-muted)" }}>Sample:</span>
          {CANNED_PLANS.map((p) => (
            <Button
              key={p.label}
              variant="ghost"
              size="sm"
              onClick={() => runPlan(p.question)}
              disabled={running}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </Section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: 14,
          alignItems: "start",
        }}
      >
        <div style={{ minWidth: 0 }}>
          {plan && (
            <Section
              title="Agent plan"
              count={plan.steps.length}
              meta={
                running ? (
                  <Badge variant="warning">running</Badge>
                ) : (
                  <Badge variant="ok">complete</Badge>
                )
              }
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {plan.steps.map((step) => (
                  <PlanStepRow
                    key={step.step}
                    step={step}
                    status={stepStatus[step.step] ?? "pending"}
                    result={stepResults[step.step]}
                  />
                ))}
              </div>
            </Section>
          )}

          {plan &&
            plan.steps.map((step) => {
              const result = stepResults[step.step];
              if (!result) return null;
              return (
                <ResultsTable
                  key={`results-${step.step}`}
                  step={step}
                  result={result}
                />
              );
            })}

          {running && (
            <Section title="Working">
              <StreamingIndicator label="Synthesizing federated answer" />
            </Section>
          )}

          {synthesis && (
            <>
              <HumanReviewBanner
                title="Officer review required"
                body="Cross-system answers may include alerts that require immediate action (CPIC warrants, firearms prohibitions, bail conditions). Verify before acting."
                onAccept={accept}
                onReject={reject}
                onEdit={() => log("Opened synthesis for editing")}
              />
              <AIResponseCard
                role="ai"
                model="AISP · Federation Agent"
                confidence={synthesis.confidence}
                timestamp={synthesis.timestamp}
              >
                <p style={{ margin: 0 }}>
                  {synthesis.text}{" "}
                  {citations.slice(0, 5).map((c) => (
                    <CitationChip key={c.index} citation={c} />
                  ))}
                </p>
              </AIResponseCard>
              {citations.length > 0 && (
                <Section title="Steps cited" count={citations.length}>
                  <CitationSources citations={citations} />
                </Section>
              )}
            </>
          )}
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <BackingServicesPanel
            services={[
              { kind: "llm", name: "llama-3.1-70b", detail: "plan + synthesis" },
              { kind: "relational", name: "MCP gateway", detail: "tool dispatch" },
              { kind: "relational", name: "tps_persons / tps_occurrences", detail: "RMS upstream" },
              { kind: "relational", name: "mto_vehicles / mto_drivers", detail: "MTO upstream" },
              { kind: "relational", name: "cpic_subjects", detail: "CPIC upstream" },
              { kind: "relational", name: "court_proceedings", detail: "OCJ upstream" },
            ]}
          />
          <Section
            title="Connected MCP servers"
            count={MCP_SERVERS.length}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {MCP_SERVERS.map((s) => (
                <MCPServerRow key={s.id} server={s} />
              ))}
            </div>
          </Section>
          <Section title="Trust">
            <div style={{ fontSize: "var(--font-size-sm)" }}>
              <ConfidenceBadge level={synthesis?.confidence ?? "medium"} />
            </div>
          </Section>
          <AuditTrail entries={audit} />
        </aside>
      </div>
    </Workspace>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Helpers + sub-components
// ──────────────────────────────────────────────────────────────────────

type StepStatus = "pending" | "running" | "done" | "error";

interface StepResult {
  rows: Record<string, unknown>[];
  provenance: ProvenanceTag;
  displayedLatencyMs: number;
}

function prettyParams(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([k, v]) => `${k}="${v}"`)
    .join(", ");
}

function countServers(plan: CannedPlan): number {
  return new Set(plan.steps.map((s) => s.serverId)).size;
}

function PlanStepRow({
  step,
  status,
  result,
}: {
  step: PlanStep;
  status: StepStatus;
  result: StepResult | undefined;
}) {
  const server = MCP_SERVERS.find((s) => s.id === step.serverId);
  const dotVariant =
    status === "done" ? "ok" : status === "running" ? "info" : status === "error" ? "error" : "muted";
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "20px 30px 160px 1fr 80px",
        gap: 8,
        alignItems: "baseline",
        padding: "6px 8px",
        border: "1px solid var(--aisp-border-soft)",
        background: "#ffffff",
        fontSize: "var(--font-size-sm)",
      }}
    >
      <StatusDot variant={dotVariant} />
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--font-size-xs)" }}>#{step.step}</span>
      <span>
        <Badge variant="blue">{server?.label ?? step.serverId}</Badge>
      </span>
      <span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--font-size-xs)" }}>
          {step.tool}({prettyParams(step.params)})
        </span>
        <div
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--aisp-text-muted)",
          }}
        >
          {step.rationale}
        </div>
      </span>
      <span
        style={{
          fontSize: "var(--font-size-xs)",
          color: "var(--aisp-text-muted)",
          textAlign: "right",
        }}
      >
        {status === "running" && "running…"}
        {status === "done" && result && (
          <>
            {result.rows.length} row{result.rows.length === 1 ? "" : "s"}
            <br />
            {result.displayedLatencyMs}ms
          </>
        )}
        {status === "pending" && "queued"}
      </span>
    </div>
  );
}

function ResultsTable({ step, result }: { step: PlanStep; result: StepResult }) {
  const server = MCP_SERVERS.find((s) => s.id === step.serverId);
  const cols =
    step.show && step.show.length > 0
      ? step.show
      : Object.keys(result.rows[0] ?? {}).filter(
          (k) => k !== "serverId",
        );
  if (result.rows.length === 0) {
    return (
      <Section
        title={`Result — step ${step.step}`}
        meta={<Badge variant="warning">no rows</Badge>}
      >
        <div
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--aisp-text-muted)",
          }}
        >
          {server?.label ?? step.serverId}.{step.tool} returned no rows.
        </div>
      </Section>
    );
  }
  return (
    <Section
      title={`Result — step ${step.step}`}
      count={result.rows.length}
      meta={<Badge variant="blue">{server?.label ?? step.serverId}</Badge>}
    >
      <div
        style={{
          overflowX: "auto",
          borderTop: "1px solid var(--aisp-border-soft)",
        }}
      >
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            fontSize: "var(--font-size-sm)",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: "4px 6px",
                  fontSize: "var(--font-size-xs)",
                  color: "var(--aisp-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  borderBottom: "1px solid var(--aisp-border-soft)",
                  background: "var(--aisp-muted-bg)",
                }}
              >
                source
              </th>
              {cols.map((c) => (
                <th
                  key={c}
                  style={{
                    textAlign: "left",
                    padding: "4px 6px",
                    fontSize: "var(--font-size-xs)",
                    color: "var(--aisp-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    borderBottom: "1px solid var(--aisp-border-soft)",
                    background: "var(--aisp-muted-bg)",
                  }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.slice(0, 10).map((row, i) => (
              <tr key={i}>
                <td
                  style={{
                    padding: "4px 6px",
                    borderBottom: "1px solid var(--aisp-border-soft)",
                    verticalAlign: "top",
                  }}
                >
                  <Badge variant="blue">{server?.label ?? step.serverId}</Badge>
                </td>
                {cols.map((c) => (
                  <td
                    key={c}
                    style={{
                      padding: "4px 6px",
                      borderBottom: "1px solid var(--aisp-border-soft)",
                      verticalAlign: "top",
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--font-size-xs)",
                    }}
                  >
                    {fmtCell(row[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {result.rows.length > 10 && (
        <div
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--aisp-text-muted)",
            padding: "4px 8px",
          }}
        >
          + {result.rows.length - 10} more row(s) returned by {server?.label ?? step.serverId}.
        </div>
      )}
    </Section>
  );
}

function fmtCell(v: unknown): string {
  if (v == null) return "—";
  if (Array.isArray(v)) return v.length === 0 ? "[]" : v.map(fmtCell).join(", ");
  if (typeof v === "object") {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
}

function MCPServerRow({ server }: { server: MCPServer }) {
  const dot =
    server.status === "connected"
      ? "ok"
      : server.status === "auth-pending"
        ? "warning"
        : server.status === "degraded"
          ? "warning"
          : "error";
  return (
    <details
      style={{
        border: "1px solid var(--aisp-border-soft)",
        background: "#ffffff",
      }}
    >
      <summary
        style={{
          padding: "6px 8px",
          cursor: "pointer",
          display: "flex",
          gap: 6,
          alignItems: "center",
          fontSize: "var(--font-size-sm)",
        }}
      >
        <Icon name="folder" size={12} />
        <strong>{server.label}</strong>
        <span style={{ marginLeft: "auto" }} />
        <StatusDot variant={dot} />
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--aisp-text-muted)" }}>
          {server.rttMs}ms
        </span>
      </summary>
      <div
        style={{
          padding: "6px 12px 8px 22px",
          fontSize: "var(--font-size-xs)",
          color: "var(--aisp-text-muted)",
        }}
      >
        <div>
          <strong>upstream:</strong>{" "}
          <span style={{ fontFamily: "var(--font-mono)" }}>{server.upstream}</span>
        </div>
        <div>
          <strong>auth:</strong> {server.auth}
        </div>
        <div style={{ marginTop: 4 }}>
          <strong>tools ({server.tools.length}):</strong>
          <ul style={{ margin: "2px 0 0 16px", padding: 0 }}>
            {server.tools.map((t) => (
              <li key={t.name} style={{ marginBottom: 2 }}>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--aisp-text)" }}>
                  {t.name}
                </span>
                <span style={{ color: "var(--aisp-text-muted)" }}> {t.signature}</span>
                <div>{t.description}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  );
}

export default DatabaseIntegrationUseCase;
