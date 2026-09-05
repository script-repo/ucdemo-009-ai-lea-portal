# AISP Portal — Ralph PRD: Law-enforcement AI use cases

## Overview

Build seven generative-AI use cases for the Toronto Police Service
demo, all running on the AISP Portal frontend with a simulated
Nutanix-style backend that can be flipped to real with a single
toggle. Every use case must satisfy AISP's safety hygiene
(disclaimer, citations, redaction, human review, audit) and must
exclusively talk to the backend through `useBackend()`.

## Tasks

### Task 1 — Backend abstraction (`src/backend/`) — DONE

Six services with simulated and real implementations, each behind a
shared TypeScript contract. Mode flips at runtime via the
Infrastructure panel.

### Task 2 — Infrastructure panel + ribbon — DONE

`/infrastructure` route showing the mode toggle, backing services,
VMs, and Kubernetes workloads. Persistent `BackendModeRibbon` below
the disclaimer surfaces the current mode on every page.

### Task 3 — Use case registry — IN PROGRESS

Update `src/portal/useCases.ts` so every use case below is registered
(status `planned` until its component is built, then `experimental`).

### Task 4 — UC1: Body-cam → report (`src/use-cases/body-cam-report/`)

Sub-prompt: `sub-prompts/body-cam-report.md`.
Inputs: `backend.inference.transcribe` against a body-cam clip,
`backend.inference.complete` with `useCaseId: "body-cam-report"` to
draft the report, audit trail of every step.

### Task 5 — UC2: Ask Your Case File (`src/use-cases/evidence-intel/`)

Sub-prompt: `sub-prompts/evidence-intel.md`.
Inputs: `backend.vector.query({ collection: "evidence:TPS-26-417" })`
to retrieve, then `backend.inference.complete({ useCaseId: "evidence-intel", context: passages })`. Render citations
inline against `EVIDENCE_ITEMS`.

### Task 6 — UC3/5: Evidence redaction (`src/use-cases/evidence-redaction/`)

Sub-prompt: `sub-prompts/evidence-redaction.md`.
Inputs: `backend.inference.redactVideo` for face / plate / screen-text
detection. Render an SVG overlay of the simulated bbox track on a
fixed video poster frame, with a "Apply / Reject" review banner and a
full audit log.

### Task 7 — UC4: Multilingual interview (`src/use-cases/multilingual-interview/`)

Sub-prompt: `sub-prompts/multilingual-interview.md`.
Inputs: `backend.inference.transcribe` against an interview clip,
`backend.inference.complete` for the structured English summary.
Render side-by-side source-language + translation transcript.

### Task 8 — UC6: Link analysis (`src/use-cases/link-analysis/`)

Sub-prompt: `sub-prompts/link-analysis.md`.
Inputs: `INVESTIGATIVE_GRAPH` fixture + `backend.inference.complete({ useCaseId: "link-analysis" })`. Render an SVG
node-link diagram with edge tooltips, AI-generated narrative, and
edge-level citations.

### Task 9 — UC7: Policy chatbot (`src/use-cases/policy-chatbot/`)

Sub-prompt: `sub-prompts/policy-chatbot.md`.
Inputs: `backend.vector.query({ collection: "policy" })` for retrieval,
`backend.inference.complete({ useCaseId: "policy-chatbot" })` for the
answer. Pure RAG; no record-write surface.

### Task 10 — UC8: 911 transcript analysis (`src/use-cases/transcript-911/`)

Sub-prompt: `sub-prompts/transcript-911.md`.
Inputs: `backend.relational.query({ table: "calls911" })` for
aggregation, `backend.inference.complete({ useCaseId: "transcript-911" })` for the narrative summary. Render
category and disposition breakdowns. Strip caller identifiers.

## Technical notes

- Use `npm run dev` (port 5174) to verify each use case manually.
- Use `npm run typecheck` after every task to catch type drift.
- Use `npm run build` before declaring `done`.
- Reference implementation: `src/use-cases/shift-handover/index.tsx`.
- Available components: see `vendor/aisp-design-system/src/components/index.ts`.
- Available icons: see `vendor/aisp-design-system/src/icons/index.tsx`.
- Backend client: `src/backend/index.ts` exposes `useBackend()`.

## Checklist

- [x] Task 1 — Backend abstraction
- [x] Task 2 — Infrastructure panel + ribbon
- [ ] Task 3 — Registry has all 7 use cases
- [ ] Task 4 — UC1 body-cam report
- [ ] Task 5 — UC2 evidence intel
- [ ] Task 6 — UC3/5 evidence redaction
- [ ] Task 7 — UC4 multilingual interview
- [ ] Task 8 — UC6 link analysis
- [ ] Task 9 — UC7 policy chatbot
- [ ] Task 10 — UC8 911 transcript analysis

## Stop condition

Exit when ALL of the following are true:

- `npm run typecheck` exits 0.
- `npm run build` exits 0.
- Every entry in the `useCases` registry is non-`planned` and points
  at a real component.
- Every use case folder contains an `index.tsx` and a `README.md`.
- Every use case page renders without a console error in dev.
- `progress.txt` shows all use cases as Completed.
- All required hygiene components are present in every use case
  (DisclaimerBar, AIResponseCard, AuditTrail; HumanReviewBanner where
  output can become a record; RedactionToken where applicable).

## Coordination rules

- The orchestrator owns: `src/portal/`, `src/backend/`, `useCases.ts`.
- Each sub-agent owns ONLY its `src/use-cases/<slug>/` folder.
- If a sub-agent finds a missing fixture or backend method, it
  appends to the "Blockers" section of `progress.txt` and exits
  rather than monkey-patching the backend.
- Commits per use case: `feat(use-cases): add <slug>`.
- After each use case lands, the orchestrator updates the registry
  and `progress.txt`.
