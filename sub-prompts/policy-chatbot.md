# Sub-prompt — UC7: Internal Policy / Legal Reference Chatbot

## Scope

ONLY create files in `src/use-cases/policy-chatbot/`.

## Context to read first

- `CLAUDE.md`
- `src/backend/fixtures/policies.ts` — TPS Procedure / Charter / CCC /
  Ontario snippets and pre-canned topical answers

## What to build

The simplest of the seven — a pure RAG chatbot:

1. `<DisclaimerBar>` (extra emphasis: this is reference-only, not
   legal advice).
2. `<AIPromptBar>` with example placeholder ("What are the legal
   thresholds for a warrantless search under exigent circumstances?").
3. Conversation log (a vertically stacked sequence of
   `<AIResponseCard>`s for both user and AI turns — `role="user"` and
   `role="ai"`):
   - On submit: call `backend.vector.query({ collection: "policy", query, topK: 4 })` to retrieve, then
     `backend.inference.complete({ useCaseId: "policy-chatbot", prompt: query, context: retrievedPassages, onChunk })`
     for the streamed answer.
   - Each AI card has `<ConfidenceBadge>` and inline `<CitationChip>`s
     pointing into a `<CitationSources>` block scoped to that turn.
4. Right rail: `<Section title="Sources">` showing what's currently
   indexed (count + top tags) plus `<AuditTrail>`.

No `<HumanReviewBanner>` (no record output). No `<RedactionToken>`
needed.

## Backend contract used

| Call | Purpose |
|---|---|
| `backend.vector.query({ collection: "policy" })` | retrieve relevant snippets |
| `backend.inference.complete({ useCaseId: "policy-chatbot" })` | grounded answer |

## Components required

`Workspace`, `DisclaimerBar`, `Section`, `AIPromptBar`,
`AIResponseCard`, `ConfidenceBadge`, `CitationChip`,
`CitationSources`, `StreamingIndicator`, `AuditTrail`, `Badge`,
`Icon`.

## Stop condition

Typecheck, render, register, progress update.
