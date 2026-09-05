# UC4 — Multilingual Interview

Real-time bilingual transcription + translation, then a structured
English witness statement gated behind a review banner.

## Backend calls

| Call | Source service | Fixture in sim mode |
|---|---|---|
| `backend.inference.transcribe({ audioRef, language })` | ASR + Translate | `INTERVIEWS[*].segments` |
| `backend.inference.complete({ useCaseId: "multilingual-interview", … })` | LLM | `INTERVIEWS[*].englishSummary` |

## Pivot to real

- The ASR endpoint must populate `segment.translation` for non-English
  segments (or split ASR + Translate into two stages and combine in
  the client; the segment shape stays the same).
- The LLM endpoint must accept `useCaseId` for prompt-template routing
  or use a system prompt the client builds explicitly.
- Source-language transcript and English transcript are both retained
  in the audit log.
