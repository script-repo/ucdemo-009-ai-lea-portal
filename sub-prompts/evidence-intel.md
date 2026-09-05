# Sub-prompt — UC2: Agentic Evidence Intelligence ("Ask Your Case File")

## Scope

ONLY create files in `src/use-cases/evidence-intel/`.

## Context to read first

- `CLAUDE.md`
- `vendor/aisp-design-system/docs/AI-PATTERNS.md` (esp. "Grounded
  generation (RAG)")
- `src/backend/fixtures/evidence.ts` — the canonical evidence corpus
  and pre-canned answers

## What to build

A RAG chat surface scoped to one case (`TPS-26-417`):

1. `<DisclaimerBar>` + `<BackendModeRibbon>` (already global).
2. `<SourceSelector>` listing the evidence items in the case (one per
   `EVIDENCE_ITEMS`); officer can de-scope items.
3. `<AIPromptBar>` for plain-English questions ("Show me all footage
   of the suspect near Yonge and Dundas between 9 and 11 PM").
4. On submit:
   a. `backend.vector.query({ collection: "evidence:TPS-26-417", query: prompt, topK: 5, filter: scoped to selected items })` — show the
      retrieved hits as a "Retrieved sources" section.
   b. `backend.inference.complete({ useCaseId: "evidence-intel", prompt, context: passages })` — render the narrative
      inside `<AIResponseCard>` with `<CitationChip>`s pointing into
      the retrieved sources.
5. Below the response, `<CitationSources citations=…>` with one
   `Citation` per cited evidence item; clicking a chip should scroll
   to / highlight the matching source row.
6. Right rail: `<AuditTrail>` recording every prompt, retrieval, and
   model call (with provenance). Include a "Chain of custody" mini
   section per cited item — pulled from `EvidenceItem.custody[]`.

## Layout

Two-column `1fr 320px`. Left: prompt → retrieved sources → response
→ citation footer. Right: source selector + audit trail.

## Backend contract used

| Call | Purpose |
|---|---|
| `backend.vector.query` | RAG retrieval (collection `"evidence:TPS-26-417"`) |
| `backend.inference.complete` | grounded answer (useCaseId `"evidence-intel"`) |

## Components required

`Workspace`, `DisclaimerBar`, `Section`, `AIPromptBar`,
`StreamingIndicator`, `AIResponseCard`, `ConfidenceBadge`,
`CitationChip`, `CitationSources`, `SourceSelector`, `RedactionToken`
(for any victim/witness named in retrieved snippets), `AuditTrail`,
`Badge`, `Icon`.

## Stop condition

Exit when typecheck passes, route renders, registry updated,
progress.txt updated.
