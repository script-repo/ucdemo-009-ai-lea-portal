# Sub-prompt — UC4: Multilingual Interview Transcription & Translation

## Scope

ONLY create files in `src/use-cases/multilingual-interview/`.

## Context to read first

- `CLAUDE.md`
- `src/backend/fixtures/interviews.ts` — the two clips (Mandarin and
  Tagalog) and their pre-built English summaries

## What to build

An interview-room workflow:

1. Picker — choose an interview clip (`INTERVIEWS`).
2. Big "Transcribe + translate" button (variant `ai`). Call
   `backend.inference.transcribe({ audioRef: clip.id })`.
3. Render the transcript as a two-column conversation:
   left column = source language, right column = English translation.
   Use `<Badge variant="ai">`-style language tags in the speaker row.
   When an officer-spoken segment is already English, the right column
   should show "(English original)" greyed out.
4. Below the transcript, "Generate structured statement" button →
   `backend.inference.complete({ useCaseId: "multilingual-interview", prompt: "Summarize this interview as an English structured witness statement." })`.
   Render inside `<AIResponseCard>` with `<HumanReviewBanner>`. The
   summary text sits inside `<RedactionToken category="VICTIM">` for
   any role-tagged person.
5. Audit trail records every action with provenance.

## Layout

Workspace with three vertical sections: clip picker, transcript
(full width), structured summary (full width). Right-rail audit
trail.

## Backend contract used

| Call | Purpose |
|---|---|
| `backend.inference.transcribe` | bilingual transcript |
| `backend.inference.complete` | structured English summary |

## Components required

`Workspace`, `DisclaimerBar`, `Section`, `Button`, `Badge`, `Icon`,
`StreamingIndicator`, `AIResponseCard`, `HumanReviewBanner`,
`ConfidenceBadge`, `RedactionToken`, `AuditTrail`.

## Stop condition

Typecheck, render, register, progress update.
