# Use case — Narrative Drafting Assistant

Reference implementation of an AI surface in this design system.

## What it shows

| Concern | How it is handled |
|---|---|
| Prompting | `AIPromptBar` (Enter to send, Shift+Enter for newline) |
| Source grounding | `SourceSelector` — officer explicitly chooses which records are in scope |
| Streaming feedback | `StreamingIndicator` while generation is in progress |
| Output | `AIResponseCard` with the model name and a `ConfidenceBadge` |
| Citation | `CitationChip` inline + `CitationSources` list at the foot |
| Sensitive data | `RedactionToken` that requires an explicit reveal action |
| Accountability | `HumanReviewBanner` blocks the draft from becoming part of the record until accepted |
| Auditing | Every interaction is appended to `AuditTrail` |
| Disclaimer | `DisclaimerBar` at the very top — never absent |

## Layout

Two-column workspace:

- **Left**: composition area (prompt + generated draft + sources)
- **Right**: source selector, output controls, audit trail

## How to adapt

Copy this directory to `src/use-cases/<your-slug>/`, then:

1. Update the title, copy, and sources for your scenario.
2. Replace the simulated `handlePrompt` with a call to your real backend.
3. Add or remove citations as appropriate.
4. Register the use case in `src/portal/useCases.ts`.

Do not add new visual primitives here. If a new pattern is needed,
propose it inside `src/components/` first so every future use case
inherits it.
