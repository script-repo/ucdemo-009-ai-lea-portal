# Sub-prompt — UC1: AI-Powered Report Writing from Body-Camera Audio

## Scope

ONLY create files in `src/use-cases/body-cam-report/`. Do not modify
anything in `vendor/aisp-design-system/`, `src/backend/`, or any
other use-case folder.

## Context to read first

- `CLAUDE.md` — repo conventions, hygiene rules
- `vendor/aisp-design-system/docs/AI-PATTERNS.md` — required UX patterns
- `src/use-cases/shift-handover/index.tsx` — reference composition
- `src/backend/index.ts` + `src/backend/fixtures/bodyCam.ts` — what the
  simulated transcribe/complete will return

## What to build

A page that lets the officer:

1. Pick a body-camera clip from the dropdown of `BODY_CAM_CLIPS`.
2. Trigger transcription via `backend.inference.transcribe({ audioRef: clip.id })` and watch the segments populate
   (use `<StreamingIndicator>` while in flight).
3. Trigger drafting via `backend.inference.complete({ useCaseId: "body-cam-report", prompt: "<implied draft prompt>" })`
   and render the returned narrative inside `<AIResponseCard>` with
   `<CitationChip>`s back to the underlying transcript segments.
4. Wrap the draft in `<HumanReviewBanner>` with Accept / Reject /
   Edit. Edit can simply log; Accept clears the draft and audit-logs
   "posted to occurrence" (no actual write).
5. Render every party involved in the report — when the party has a
   `redactionCategory`, wrap their name in `<RedactionToken category=…
   revealable>`.
6. Right rail: `<SourceSelector>` showing the segments (just for
   showcase), `<AuditTrail>` with every event.

## Layout

Two-column grid `1fr 280px` like shift-handover. Left column: clip
picker → transcribe button → transcript card → draft card. Right
column: source selector + audit trail.

## Backend contract used

| Call | Purpose |
|---|---|
| `backend.inference.transcribe({ audioRef: clip.id })` | get segments |
| `backend.inference.complete({ useCaseId: "body-cam-report", prompt })` | get narrative |

Pass `provenance` info into the audit log entry so the operator can
see source + latency for each AI call.

## Components required (all from `@aisp/components`)

`AIPromptBar` is OPTIONAL here — the trigger is a button, not a
prompt. Required: `Workspace`, `DisclaimerBar`, `Section`, `Select`
(or simple `<select>` styled with the design system's `<Select>`),
`Button`, `Badge`, `Icon`, `StreamingIndicator`, `AIResponseCard`,
`HumanReviewBanner`, `CitationChip`, `CitationSources`,
`ConfidenceBadge`, `RedactionToken`, `AuditTrail`.

## Files to create

- `src/use-cases/body-cam-report/index.tsx` — exports
  `BodyCamReportUseCase`
- `src/use-cases/body-cam-report/README.md` — short notes on the
  workflow, the pieces of the design system used, and how to swap in
  real backend

## Stop condition

Exit when:
- `npm run typecheck` passes
- The page renders at `http://localhost:5174/#/uc/body-cam-report`
- The orchestrator has registered the use case in
  `src/portal/useCases.ts` with a non-`planned` status
- A line in `progress.txt` flips to `[x] body-cam-report`
