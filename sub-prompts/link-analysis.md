# Sub-prompt — UC6: Investigative Link Analysis

## Scope

ONLY create files in `src/use-cases/link-analysis/`.

## Context to read first

- `CLAUDE.md`
- `src/backend/fixtures/network.ts` — `INVESTIGATIVE_GRAPH` (nodes
  with pre-computed coords) and `LINK_ANALYSIS_ANSWERS` (regex-keyed
  canned narratives)

## What to build

A "mind map" surface backed by a static SVG:

1. Top: `<AIPromptBar>` for ad-hoc queries ("Show co-defendants",
   "Phone activity", "Vehicles linked to subject", "Witnesses").
2. Centre: 800×500 SVG rendering the graph from
   `INVESTIGATIVE_GRAPH`:
   - Edges as 1px lines (thicker for `confidence: high`).
   - Nodes as small circles colored by `kind` (use design-system
     status / AI tokens — `--aisp-blue` for case, `--ai-accent` for
     person, `--aisp-status-info` for vehicle/address/phone/account).
   - Node label below each circle.
   - When the AI returns `highlight` IDs, those nodes scale up and
     the connecting edges go bold.
3. Right rail: `<AIResponseCard>` containing the latest narrative,
   with `<CitationChip>`s pointing into a "Edges" section (each
   citation references one `NetworkEdge` and shows its `source` and
   `confidence`).
4. Below the response, `<HumanReviewBanner>` is NOT required (this
   surface is read-only) but `<DisclaimerBar>` and `<AuditTrail>`
   are.
5. Any node with `redactionCategory` shows a `<RedactionToken>` in
   place of its label by default; clicking the redaction token's
   reveal logs an audit event.

## Backend contract used

| Call | Purpose |
|---|---|
| `backend.inference.complete({ useCaseId: "link-analysis", prompt })` | get narrative + edge citations |

The graph itself comes straight from the fixture — no vector or
relational call needed for this demo.

## Components required

`Workspace`, `DisclaimerBar`, `Section`, `AIPromptBar`,
`StreamingIndicator`, `AIResponseCard`, `ConfidenceBadge`,
`CitationChip`, `CitationSources`, `RedactionToken`, `AuditTrail`,
`Badge`, `Icon`.

## Stop condition

Typecheck, render, register, progress update.
