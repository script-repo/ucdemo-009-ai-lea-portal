# UC8 — 911 Transcript Insights

A privacy-preserving analyst dashboard over de-identified 911
transcripts. Filter, see breakdowns, and optionally generate an AI
narrative summary gated behind a review banner.

## Backend calls

| Call | Source service | Fixture in sim mode |
|---|---|---|
| `backend.relational.query({ table: "calls911" })` | PostgreSQL | `CALLS_911` |
| `backend.inference.complete({ useCaseId: "transcript-911", … })` | LLM | canned narrative |

## Pivot to real

1. Land 911 transcripts into the `calls911` relational table with
   the same column shape as `Call911` (caller hash, division,
   category, disposition, duration, response time, interpreter flag,
   redacted excerpt). Never store raw caller PII; hash at intake.
2. The LLM endpoint must accept `useCaseId: "transcript-911"` (or
   the equivalent system prompt) and return a privacy-preserving
   narrative.
3. Replace the in-browser stat aggregation with a server-side
   roll-up once volume is non-trivial.

## Privacy hygiene

- All raw caller identifiers are stripped at intake.
- Excerpts default to redacted (`<RedactionToken category="CONFIDENTIAL">`); reveals are audited.
- The summary is wrapped in `<HumanReviewBanner>` because it may
  appear in an internal report.
