# Sub-prompt — UC8: 911 Transcript Analysis

## Scope

ONLY create files in `src/use-cases/transcript-911/`.

## Context to read first

- `CLAUDE.md`
- `src/backend/fixtures/calls911.ts` — anonymized call records with
  `callerHash` (never raw caller PII)

## What to build

An analyst-facing dashboard for de-identified 911 trends:

1. `<DisclaimerBar>` plus an additional `<Section>` with a privacy
   notice: "All caller identifiers are hashed at intake. No raw
   audio, phone number, or address is exposed in this view."
2. Filter strip: division select (multi), category select (multi),
   date range. Use `<Select>` and `<Input>` from the design system.
3. Calls table — load via
   `backend.relational.query({ table: "calls911", where, search, orderBy: ["timestamp:desc"], limit: 50 })`. Render with
   columns: timestamp, division, category, disposition, response time
   (sec), interpreter? (badge). The `excerpt` cell should be wrapped
   in `<RedactionToken category="CONFIDENTIAL" revealable>` and only
   show the first 80 chars when collapsed.
4. Stats panel — compute (in the browser) per-category and
   per-disposition counts plus median response time, render as a set
   of `<Section>`s with simple SVG bar charts (one bar per row, width
   proportional to count, colour `var(--ai-accent)`).
5. "Generate insight summary" button (variant `ai`). On click,
   `backend.inference.complete({ useCaseId: "transcript-911", prompt: "Summarize the trends in the visible call set with privacy preserved." })`.
   Render inside `<AIResponseCard>` with a `<HumanReviewBanner>`
   (because the analyst may post the insight to an internal report).
6. `<AuditTrail>` records every filter change, every generate-insight
   call, and every reveal of a redacted excerpt.

## Backend contract used

| Call | Purpose |
|---|---|
| `backend.relational.query({ table: "calls911" })` | filtered call set |
| `backend.inference.complete({ useCaseId: "transcript-911" })` | narrative summary |

## Components required

`Workspace`, `DisclaimerBar`, `Section`, `Input`, `Select`,
`FormField`, `FormGrid`, `Button`, `Badge`, `StatusDot`, `Icon`,
`AIResponseCard`, `HumanReviewBanner`, `ConfidenceBadge`,
`StreamingIndicator`, `RedactionToken`, `AuditTrail`.

## Stop condition

Typecheck, render, register, progress update.
