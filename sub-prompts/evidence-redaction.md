# Sub-prompt — UC3/5: Automated Digital Evidence Redaction

## Scope

ONLY create files in `src/use-cases/evidence-redaction/`.

## Context to read first

- `CLAUDE.md`
- `src/backend/fixtures/bodyCam.ts` and `src/backend/fixtures/evidence.ts`
  — what video clips are available
- `src/backend/types.ts` — `VisionRedactionRequest`, the categories
  enum, and the detection bbox shape

## What to build

A page that demonstrates AI redaction of a body-cam / surveillance
clip for FOIA / disclosure release:

1. Picker — choose source (body-cam clip OR evidence item of type
   `body-cam` or `surveillance-video`).
2. Category checkboxes — `FACE`, `LICENSE_PLATE`, `TATTOO`,
   `SCREEN_TEXT`, `DOCUMENT_TEXT`. Default ON: FACE + LICENSE_PLATE.
3. "Run redaction" button (variant `ai`).
4. While running: `<StreamingIndicator>`. After: render an inline
   simulated video frame using a 16:9 SVG of size 640×360 with:
   - A neutral-grey background and a simple street-scene line drawing
     (do NOT bundle external images — pure SVG primitives).
   - A timeline scrubber below the SVG (HTML range input).
   - The bbox track from the response — at the current scrub time,
     overlay a dark rectangle (use `var(--ai-redaction-bg)`) for each
     active detection. Label each box with its category in white text.
5. `<HumanReviewBanner>` with Apply / Reject / Edit. Apply logs
   "Redaction applied; chain of custody updated"; Reject logs
   "Redaction rejected"; Edit logs "Reviewer opened editor".
6. Right rail:
   - `<Section title="Detections" count=…>` — flat list with
     timestamp, category, confidence badge.
   - `<Section title="Chain of custody">` — three pre-built entries
     showing the original hash, the redaction operator, and the new
     output ref.
   - `<AuditTrail>`.

## Backend contract used

| Call | Purpose |
|---|---|
| `backend.inference.redactVideo({ sourceRef, categories })` | get detection track + outputRef |
| `backend.objectStorage.head({ bucket, key })` | show source-file metadata in the right rail |

## Components required

`Workspace`, `DisclaimerBar`, `Section`, `Button`, `Badge`,
`StatusDot`, `Icon`, `StreamingIndicator`, `AIResponseCard`,
`HumanReviewBanner`, `ConfidenceBadge`, `AuditTrail`.

## Stop condition

Exit when typecheck passes, route renders, registry updated,
progress.txt updated.
