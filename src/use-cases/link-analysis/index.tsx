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
  Section,
  Select,
  StatusDot,
  StreamingIndicator,
  Workspace,
} from "@aisp/components";
import {
  type EntityKind,
  INVESTIGATIVE_GRAPH,
  type NetworkEdge,
  type NetworkNode,
  type ProvenanceTag,
  useBackend,
} from "../../backend";
import { LINK_ANALYSIS_ANSWERS } from "../../backend/fixtures/network";
import { BackingServicesPanel } from "../../portal/BackingServicesPanel";
import { InferenceUsage, usageFromCompletion } from "../../portal/InferenceUsage";
import { MarkdownBody } from "../../portal/MarkdownBody";

const KIND_LABEL: Record<EntityKind, string> = {
  person: "Person",
  vehicle: "Vehicle",
  address: "Address",
  account: "Account",
  phone: "Phone",
  case: "Case",
};

/**
 * UC6 — Investigative Link Analysis (enhanced).
 *
 * Capabilities:
 *   - Plain-English Q&A over the case network with edge citations.
 *   - Click any node → entity detail panel + filter to its neighbours.
 *   - Hover any edge → tooltip with full provenance + confidence.
 *   - Multi-toggle filter by entity kind.
 *   - "Find path between" two selected entities (BFS over the graph).
 *   - Hover-to-highlight neighbours on the graph itself.
 */
export function LinkAnalysisUseCase() {
  const backend = useBackend();
  const { nodes, edges } = INVESTIGATIVE_GRAPH;

  const [busy, setBusy] = useState(false);
  const [response, setResponse] = useState<{
    text: string;
    confidence: "high" | "medium" | "low";
    edgeIdxs: number[];
    highlight: string[];
    timestamp: Date;
    tokensUsed: number;
    promptTokens?: number;
    completionTokens?: number;
    tokensEstimated?: boolean;
  } | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [enabledKinds, setEnabledKinds] = useState<Record<EntityKind, boolean>>({
    person: true,
    vehicle: true,
    address: true,
    account: true,
    phone: true,
    case: true,
  });
  const [filterToNeighbours, setFilterToNeighbours] = useState<string | null>(null);
  const [pathFrom, setPathFrom] = useState<string>("");
  const [pathTo, setPathTo] = useState<string>("");
  const [pathEdgeIdxs, setPathEdgeIdxs] = useState<number[] | null>(null);

  const [audit, setAudit] = useState<AuditEntry[]>([
    {
      id: "0",
      timestamp: new Date(),
      actor: "Det. K. Singh",
      action: `Opened Investigative Link Analysis — ${nodes.length} entities, ${edges.length} relations`,
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

  async function ask(prompt: string) {
    setBusy(true);
    setResponse(null);
    log(`Asked: "${prompt}"`);
    try {
      const r = await backend.inference.complete({
        useCaseId: "link-analysis",
        prompt,
      });
      const fixture = LINK_ANALYSIS_ANSWERS.find((a) => a.match.test(prompt));
      setResponse({
        text: r.data.text,
        confidence: r.data.confidence,
        edgeIdxs: r.data.citations,
        highlight: fixture?.answer.highlight ?? [],
        timestamp: new Date(),
        ...usageFromCompletion(r.data),
      });
      logProv(
        `Generated narrative (${r.data.citations.length} edge citations)`,
        r.provenance,
      );
    } catch (e) {
      log(`Failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  function findPath() {
    if (!pathFrom || !pathTo || pathFrom === pathTo) {
      setPathEdgeIdxs(null);
      return;
    }
    const result = bfsPath(nodes, edges, pathFrom, pathTo);
    setPathEdgeIdxs(result);
    log(
      result
        ? `Found path from ${pathFrom} to ${pathTo} (${result.length} hops)`
        : `No path found from ${pathFrom} to ${pathTo}`,
    );
  }

  // ── Visible graph subset based on filters ────────────────────────
  const visibleNodes = useMemo(() => {
    let v = nodes.filter((n) => enabledKinds[n.kind]);
    if (filterToNeighbours) {
      const neighbours = new Set<string>([filterToNeighbours]);
      for (const e of edges) {
        if (e.from === filterToNeighbours) neighbours.add(e.to);
        if (e.to === filterToNeighbours) neighbours.add(e.from);
      }
      v = v.filter((n) => neighbours.has(n.id));
    }
    return v;
  }, [nodes, edges, enabledKinds, filterToNeighbours]);

  const visibleNodeIds = useMemo(
    () => new Set(visibleNodes.map((n) => n.id)),
    [visibleNodes],
  );

  const visibleEdges = useMemo(
    () => edges.filter((e) => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to)),
    [edges, visibleNodeIds],
  );

  const citations: Citation[] = useMemo(() => {
    if (!response) return [];
    const seen = new Set<number>();
    const list: Citation[] = [];
    for (const ei of response.edgeIdxs) {
      if (seen.has(ei)) continue;
      seen.add(ei);
      const e = edges[ei];
      if (!e) continue;
      const fromN = nodes.find((n) => n.id === e.from);
      const toN = nodes.find((n) => n.id === e.to);
      list.push({
        index: list.length + 1,
        title: `${labelOf(fromN)} → ${e.relation} → ${labelOf(toN)}`,
        meta: `${e.source} · confidence ${e.confidence}${e.activeFrom ? ` · from ${e.activeFrom.slice(0, 10)}` : ""}`,
      });
    }
    return list;
  }, [response, nodes, edges]);

  const highlightSet = new Set([
    ...(response?.highlight ?? []),
    ...(hoveredId ? neighbourIds(edges, hoveredId) : []),
    ...(selectedId ? [selectedId] : []),
  ]);
  const highlightedEdgeIdxs = new Set([
    ...(response?.edgeIdxs ?? []),
    ...(pathEdgeIdxs ?? []),
    ...(hoveredId ? incidentEdgeIdxs(edges, hoveredId) : []),
  ]);

  const selectedNode = selectedId ? nodes.find((n) => n.id === selectedId) ?? null : null;
  const selectedEdges = selectedNode
    ? edges
        .map((e, i) => ({ e, i }))
        .filter(({ e }) => e.from === selectedNode.id || e.to === selectedNode.id)
    : [];

  function toggleKind(k: EntityKind) {
    setEnabledKinds((prev) => ({ ...prev, [k]: !prev[k] }));
    log(`Toggled ${KIND_LABEL[k].toLowerCase()} ${enabledKinds[k] ? "off" : "on"}`);
  }

  return (
    <Workspace>
      <DisclaimerBar />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: 14,
          alignItems: "start",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <Section title="Ask the agent">
            <AIPromptBar
              placeholder="Ask: 'Show co-defendants', 'Phone activity', 'Vehicles linked to subject', 'What links to case TPS-26-418', 'Crypto wallet usage' …"
              onSubmit={ask}
              busy={busy}
            />
          </Section>

          <Section
            title="Network"
            count={visibleNodes.length}
            meta={
              <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <Badge variant="ai">air-gapped agent</Badge>
                {filterToNeighbours && (
                  <Badge variant="warning">filtered to neighbours</Badge>
                )}
              </span>
            }
            trailing={
              filterToNeighbours && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterToNeighbours(null);
                    log("Cleared neighbour filter");
                  }}
                >
                  Clear filter
                </Button>
              )
            }
          >
            <NetworkGraph
              nodes={visibleNodes}
              edges={visibleEdges}
              edgesAll={edges}
              highlightNodes={highlightSet}
              highlightEdges={highlightedEdgeIdxs}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id);
                log(`Selected node ${id}`);
              }}
              onHover={setHoveredId}
              onRevealRedacted={(n) => log(`Revealed ${n.redactionCategory} on ${n.id}`)}
            />
            <div
              style={{
                marginTop: 8,
                fontSize: "var(--font-size-xs)",
                color: "var(--aisp-text-muted)",
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <span>
                <strong>{visibleNodes.length}</strong> entities,{" "}
                <strong>{visibleEdges.length}</strong> relations visible.
              </span>
              <span>Click a node for details. Hover an edge for provenance.</span>
            </div>
          </Section>

          {busy && (
            <Section title="Working">
              <StreamingIndicator label="Reasoning over the graph" />
            </Section>
          )}

          {response && (
            <>
              <AIResponseCard
                role="ai"
                model="AISP · Link Analysis (air-gapped)"
                confidence={response.confidence}
                timestamp={response.timestamp}
                footer={<InferenceUsage {...response} />}
              >
                <MarkdownBody>{response.text}</MarkdownBody>
                {citations.length > 0 && (
                  <p>
                    {citations.slice(0, 6).map((c) => (
                      <CitationChip key={c.index} citation={c} />
                    ))}
                  </p>
                )}
              </AIResponseCard>
              {citations.length > 0 && (
                <Section title="Edges cited" count={citations.length}>
                  <CitationSources citations={citations} />
                </Section>
              )}
            </>
          )}
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <BackingServicesPanel
            services={[
              { kind: "llm", name: "llama-3.1-70b", detail: "air-gapped, on-prem" },
              { kind: "vector", name: "entity-descriptions", detail: "per-entity embeddings" },
              { kind: "relational", name: "case_links", detail: "cross-case correlation table" },
            ]}
          />
          <Section title="Filter by kind">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 6,
                fontSize: "var(--font-size-sm)",
              }}
            >
              {(Object.keys(enabledKinds) as EntityKind[]).map((k) => (
                <label
                  key={k}
                  style={{ display: "flex", gap: 6, alignItems: "center" }}
                >
                  <input
                    type="checkbox"
                    checked={enabledKinds[k]}
                    onChange={() => toggleKind(k)}
                  />
                  <KindSwatch kind={k} />
                  {KIND_LABEL[k]}
                </label>
              ))}
            </div>
          </Section>

          <Section title="Path between" count={pathEdgeIdxs?.length ?? 0}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Select value={pathFrom} onChange={(e) => setPathFrom(e.target.value)}>
                <option value="">From…</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {labelOf(n)}
                  </option>
                ))}
              </Select>
              <Select value={pathTo} onChange={(e) => setPathTo(e.target.value)}>
                <option value="">To…</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {labelOf(n)}
                  </option>
                ))}
              </Select>
              <div style={{ display: "flex", gap: 6 }}>
                <Button
                  variant="ai"
                  size="sm"
                  onClick={findPath}
                  disabled={!pathFrom || !pathTo || pathFrom === pathTo}
                >
                  Find path
                </Button>
                {pathEdgeIdxs && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPathEdgeIdxs(null);
                      log("Cleared path");
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
              {pathEdgeIdxs?.length === 0 && (
                <div
                  style={{
                    fontSize: "var(--font-size-xs)",
                    color: "var(--aisp-status-error)",
                  }}
                >
                  No path between these entities under current edges.
                </div>
              )}
              {pathEdgeIdxs && pathEdgeIdxs.length > 0 && (
                <div
                  style={{
                    fontSize: "var(--font-size-xs)",
                    color: "var(--aisp-text-muted)",
                  }}
                >
                  Highlighted on the graph in lavender; {pathEdgeIdxs.length} hop
                  {pathEdgeIdxs.length === 1 ? "" : "s"}.
                </div>
              )}
            </div>
          </Section>

          {selectedNode ? (
            <Section
              title={
                selectedNode.redactionCategory
                  ? `[${selectedNode.redactionCategory}]`
                  : selectedNode.label
              }
              meta={<Badge variant="blue">{KIND_LABEL[selectedNode.kind]}</Badge>}
              trailing={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedId(null);
                    setFilterToNeighbours(null);
                  }}
                >
                  Close
                </Button>
              }
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  fontSize: "var(--font-size-sm)",
                }}
              >
                {selectedNode.attrs?.map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "110px 1fr",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        color: "var(--aisp-text-muted)",
                        fontSize: "var(--font-size-xs)",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {k}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--font-size-xs)" }}>
                      {v}
                    </span>
                  </div>
                ))}
                <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                  <Button
                    variant="ai"
                    size="sm"
                    onClick={() => {
                      setFilterToNeighbours(selectedNode.id);
                      log(`Filtered to neighbours of ${selectedNode.id}`);
                    }}
                  >
                    Show neighbours only
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPathFrom(selectedNode.id);
                      log(`Set path origin to ${selectedNode.id}`);
                    }}
                  >
                    Use as path origin
                  </Button>
                </div>
              </div>
              <div
                style={{
                  marginTop: 10,
                  borderTop: "1px solid var(--aisp-border-soft)",
                  paddingTop: 8,
                }}
              >
                <div
                  style={{
                    fontSize: "var(--font-size-xs)",
                    color: "var(--aisp-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: 4,
                  }}
                >
                  Relations ({selectedEdges.length})
                </div>
                {selectedEdges.map(({ e, i }) => {
                  const otherId = e.from === selectedNode.id ? e.to : e.from;
                  const other = nodes.find((n) => n.id === otherId);
                  return (
                    <div
                      key={i}
                      style={{
                        fontSize: "var(--font-size-sm)",
                        padding: "4px 0",
                        borderBottom: "1px solid var(--aisp-border-soft)",
                      }}
                    >
                      <StatusDot
                        variant={
                          e.confidence === "high"
                            ? "ok"
                            : e.confidence === "medium"
                              ? "warning"
                              : "muted"
                        }
                      />{" "}
                      <em>{e.relation}</em> →{" "}
                      <button
                        type="button"
                        style={{
                          background: "none",
                          border: 0,
                          padding: 0,
                          color: "var(--aisp-link)",
                          cursor: "pointer",
                          font: "inherit",
                        }}
                        onClick={() => setSelectedId(otherId)}
                      >
                        {labelOf(other)}
                      </button>
                      <div
                        style={{
                          fontSize: "var(--font-size-xs)",
                          color: "var(--aisp-text-muted)",
                        }}
                      >
                        {e.source}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          ) : (
            <Section title="Legend">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  fontSize: "var(--font-size-sm)",
                }}
              >
                {(Object.keys(KIND_LABEL) as EntityKind[]).map((k) => (
                  <div
                    key={k}
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <KindSwatch kind={k} /> {KIND_LABEL[k]}
                  </div>
                ))}
                <div
                  style={{
                    marginTop: 6,
                    fontSize: "var(--font-size-xs)",
                    color: "var(--aisp-text-muted)",
                  }}
                >
                  Bold edges = cited in current response or active path.
                  Dashed names are redacted; click to reveal (audited).
                </div>
              </div>
            </Section>
          )}

          <Section title="Trust">
            <div style={{ fontSize: "var(--font-size-sm)" }}>
              <ConfidenceBadge level={response?.confidence ?? "medium"} />
            </div>
          </Section>

          <AuditTrail entries={audit} />
        </aside>
      </div>
    </Workspace>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────

function labelOf(n: NetworkNode | undefined) {
  if (!n) return "?";
  if (n.redactionCategory) return `[${n.redactionCategory}]`;
  return n.label;
}

function colorFor(kind: NetworkNode["kind"]): string {
  switch (kind) {
    case "person":
      return "var(--ai-accent)";
    case "case":
      return "var(--aisp-blue)";
    case "vehicle":
      return "var(--aisp-status-info)";
    case "address":
      return "#7a5a00"; // matches review banner accent — distinct earthy tone
    case "phone":
      return "#5a9f3b";
    case "account":
      return "#c0392b";
  }
}

function iconFor(kind: NetworkNode["kind"]) {
  switch (kind) {
    case "person":
      return "user";
    case "vehicle":
      return "occurrence";
    case "address":
      return "home";
    case "phone":
      return "mail";
    case "account":
      return "key";
    case "case":
      return "folder";
  }
}

function neighbourIds(edges: NetworkEdge[], id: string): string[] {
  const out: string[] = [];
  for (const e of edges) {
    if (e.from === id) out.push(e.to);
    if (e.to === id) out.push(e.from);
  }
  return out;
}

function incidentEdgeIdxs(edges: NetworkEdge[], id: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < edges.length; i++) {
    if (edges[i]!.from === id || edges[i]!.to === id) out.push(i);
  }
  return out;
}

function bfsPath(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  fromId: string,
  toId: string,
): number[] | null {
  if (!nodes.some((n) => n.id === fromId) || !nodes.some((n) => n.id === toId)) return null;
  const adj = new Map<string, Array<{ next: string; edgeIdx: number }>>();
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i]!;
    if (!adj.has(e.from)) adj.set(e.from, []);
    if (!adj.has(e.to)) adj.set(e.to, []);
    adj.get(e.from)!.push({ next: e.to, edgeIdx: i });
    adj.get(e.to)!.push({ next: e.from, edgeIdx: i });
  }
  const queue: Array<{ at: string; via: number[] }> = [{ at: fromId, via: [] }];
  const seen = new Set<string>([fromId]);
  while (queue.length) {
    const { at, via } = queue.shift()!;
    if (at === toId) return via;
    for (const { next, edgeIdx } of adj.get(at) ?? []) {
      if (seen.has(next)) continue;
      seen.add(next);
      queue.push({ at: next, via: [...via, edgeIdx] });
    }
  }
  return [];
}

function KindSwatch({ kind }: { kind: NetworkNode["kind"] }) {
  return (
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: colorFor(kind),
        display: "inline-block",
      }}
    />
  );
}

// ──────────────────────────────────────────────────────────────────────
// Graph SVG
// ──────────────────────────────────────────────────────────────────────

function NetworkGraph({
  nodes,
  edges,
  edgesAll,
  highlightNodes,
  highlightEdges,
  selectedId,
  onSelect,
  onHover,
  onRevealRedacted,
}: {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  /** All edges (for reverse-lookup of edge index when only filtered set is rendered). */
  edgesAll: NetworkEdge[];
  highlightNodes: Set<string>;
  highlightEdges: Set<number>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onRevealRedacted: (n: NetworkNode) => void;
}) {
  const w = 1100;
  const h = 680;
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      style={{
        background: "#fafaff",
        border: "1px solid var(--aisp-border)",
        display: "block",
      }}
      aria-label="Investigative entity graph"
    >
      {edges.map((e) => {
        const a = nodeMap.get(e.from);
        const b = nodeMap.get(e.to);
        if (!a || !b) return null;
        const idx = edgesAll.indexOf(e);
        const cited = highlightEdges.has(idx);
        const baseWidth =
          e.confidence === "high" ? 1.6 : e.confidence === "medium" ? 1.1 : 0.7;
        const width = cited ? baseWidth + 1.6 : baseWidth;
        const stroke = cited ? "var(--ai-accent)" : "var(--aisp-border-dark)";
        const opacity = cited ? 0.95 : 0.55;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        return (
          <g key={`${e.from}-${e.to}-${e.relation}`}>
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={stroke}
              strokeWidth={width}
              opacity={opacity}
            >
              <title>
                {`${a.label} —(${e.relation})→ ${b.label}\n${e.source} · ${e.confidence}${e.activeFrom ? `\nactive from ${e.activeFrom.slice(0, 10)}` : ""}${e.activeTo ? ` to ${e.activeTo.slice(0, 10)}` : ""}`}
              </title>
            </line>
            {cited && (
              <text
                x={mx}
                y={my - 4}
                textAnchor="middle"
                style={{
                  font: "10px Arial",
                  fill: "var(--ai-accent-dark)",
                  pointerEvents: "none",
                }}
              >
                {e.relation}
              </text>
            )}
          </g>
        );
      })}
      {nodes.map((n) => {
        const cited = highlightNodes.has(n.id);
        const isSelected = n.id === selectedId;
        const r = n.primary ? 18 : isSelected ? 16 : cited ? 14 : 11;
        const fill = colorFor(n.kind);
        return (
          <g
            key={n.id}
            transform={`translate(${n.x},${n.y})`}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => onHover(n.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => {
              if (n.redactionCategory) onRevealRedacted(n);
              onSelect(n.id);
            }}
          >
            <circle
              r={r + 4}
              fill="#ffffff"
              opacity={cited || isSelected ? 0.7 : 0}
            />
            <circle
              r={r}
              fill={fill}
              stroke={isSelected ? "var(--ai-accent-dark)" : cited ? "var(--ai-accent-dark)" : "#ffffff"}
              strokeWidth={isSelected ? 3 : cited ? 2.4 : 1.2}
              opacity={cited || isSelected ? 1 : 0.85}
            />
            <text
              y={4}
              textAnchor="middle"
              style={{
                font: "11px Arial",
                fill: "#ffffff",
                pointerEvents: "none",
              }}
            >
              {iconLetterFor(n.kind)}
            </text>
            <text
              y={r + 14}
              textAnchor="middle"
              style={{
                font: "11px Arial",
                fill: "var(--aisp-text)",
                pointerEvents: "none",
              }}
            >
              {n.redactionCategory ? `[${n.redactionCategory}]` : n.label}
            </text>
            {n.tag && (
              <text
                y={-r - 6}
                textAnchor="middle"
                style={{
                  font: "10px Arial",
                  fill: "var(--aisp-text-muted)",
                  pointerEvents: "none",
                }}
              >
                {n.tag}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function iconLetterFor(kind: NetworkNode["kind"]): string {
  switch (kind) {
    case "person":
      return "P";
    case "vehicle":
      return "V";
    case "address":
      return "A";
    case "phone":
      return "☎";
    case "account":
      return "$";
    case "case":
      return "C";
  }
}

// Re-export so external smoke tests / docs can grab the icon helper.
export { iconFor };

export default LinkAnalysisUseCase;
