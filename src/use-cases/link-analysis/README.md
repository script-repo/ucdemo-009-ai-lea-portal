# UC6 — Investigative Link Analysis

A static SVG node-link graph + an LLM agent that answers
plain-English questions about the network with edge-level citations.

## Backend calls

| Call | Source service | Fixture in sim mode |
|---|---|---|
| `backend.inference.complete({ useCaseId: "link-analysis", … })` | LLM agent | `LINK_ANALYSIS_ANSWERS` |

The graph itself comes from `INVESTIGATIVE_GRAPH` and never crosses
the network boundary in this demo — consistent with the air-gapped
inference posture.

## Pivot to real

1. Replace the static graph with a load from
   `backend.relational.query({ table: "case_network" })` (or a
   dedicated graph store). The `NetworkNode` / `NetworkEdge` shapes
   are the contract.
2. The LLM agent must return its narrative with `citations` indexing
   the edges array — the same shape the simulated client uses.
3. Highlight is optional. If the real agent doesn't return it, the
   UI degrades to "no node highlighting" without breaking.
