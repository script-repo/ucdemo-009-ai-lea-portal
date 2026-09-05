# Document Redaction

AI-assisted redaction of disclosure documents (witness statements,
officer narratives, FOIA replies, medical disclosures, intel briefings).

## What this use case shows

The disclosure officer picks a document. The AI runs NER + classification
and proposes redactions. Every detection has a category drawn from the
design-system enum (PII, VICTIM, JUVENILE, CONFIDENTIAL, INFORMANT,
MEDICAL) plus a finer-grained subtype (NAME, ADDRESS, OHIP, BADGE, etc.).

Each detection is reviewed individually:

- accept (will redact in the output) or reject (will appear in the output),
- the side panel rationale and confidence are visible,
- a "recommended" preset applies the disclosure-class default, and
- the document body lights up the entity in the original view and shows
  the `[CATEGORY]` token in the redacted preview.

A HumanReviewBanner gates the redacted version becoming part of the
disclosure record. Every action is audited.

## Backend interaction

| Service | Used for |
| --- | --- |
| `inference.complete({ useCaseId: "document-redaction" })` | Detection summary + recommendation |
| (fixture) `REDACTION_DOCUMENTS` | The pre-tokenized document corpus (deterministic for the demo) |

## Sample documents in the corpus

- Witness statement (Occurrence 26-0044 — Domestic) — heavy victim PII
- Officer narrative (Occurrence 26-0042 — MVA) — moderate PII
- FOIA disclosure response (FOI-2026-0142) — needs heavy redaction
- Medical disclosure (Occurrence 26-0043 — MHA) — heavy MEDICAL +
  JUVENILE redaction
- Intel briefing (INT-2026-014) — INFORMANT handle redaction

## Hygiene

- DisclaimerBar at the top.
- Per-detection accept / reject (no auto-redaction).
- HumanReviewBanner before export.
- AuditTrail records every accept, reject, view-toggle, and export.
