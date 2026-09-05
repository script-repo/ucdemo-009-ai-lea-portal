# UC3 / UC5 — Evidence Redaction

A reviewer-facing surface that runs an AI vision pipeline over a body-
cam clip, proposes redactions for FOIA / Crown disclosure, and gates
the final commit behind a human review banner. The original clip is
immutable; the redaction output gets a new chain-of-custody entry.

## Backend calls

| Call | Source service | Fixture in sim mode |
|---|---|---|
| `backend.inference.redactVideo({ sourceRef, categories })` | Vision (SAM2 + YOLO-redact) | deterministic synthetic detection track |

## Pivot to real

1. Stand up the vision pipeline behind `VITE_AISP_INFERENCE_URL`
   exposing `POST /v1/redact-video` returning the same
   `{ detections, outputRef, durationMs, model }` shape.
2. Replace the synthetic SVG poster frame with the real video element
   that fetches the source URL via `backend.objectStorage.presign`.
3. The bbox overlay layer is already coordinate-normalized (0..1) so
   the same overlay code works against a real `<video>` once it's in.
4. Flip the Infrastructure toggle.

## Design-system hygiene

- `<DisclaimerBar/>` at top.
- `<HumanReviewBanner/>` gates commit (Apply / Reject / Edit).
- `<AuditTrail/>` records every action — including the chain-of-
  custody update on Apply.
- The AI accent (lavender) is only on the "Run redaction" button —
  the Accept action stays primary blue per the AI design pattern.
