# Use case — Shift Handover Summary

Application-owned use case. Generates an end-of-shift handover note
from the officer's session activity.

## What it shows

The same accountability surfaces you get for every AISP use case:

| Concern | Component |
|---|---|
| Prompting | `AIPromptBar` |
| Source grounding | `SourceSelector` |
| Streaming feedback | `StreamingIndicator` |
| Output | `AIResponseCard` + `ConfidenceBadge` |
| Citations | `CitationChip` + `CitationSources` |
| Sensitive data | `RedactionToken` |
| Acceptance gate | `HumanReviewBanner` |
| Audit | `AuditTrail` |
| Disclaimer | `DisclaimerBar` |

All of those components are imported from `@aisp/components` — i.e.
the design system, not this file. This use case contributes only the
*workflow*: which sources are in scope, what the prompt looks like,
what the simulated model says.

## Replacing the simulated backend

Open `index.tsx` and find `handlePrompt`. Replace the `setTimeout` with
a call to your real handover-generation service. The contract:

- Input: the prompt string + the set of `selectedSources`.
- Output: text content + an array of `Citation`s + a confidence level.

Everything else (citation chips, redaction blocks, audit hooks) is
already wired.
