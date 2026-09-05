# UC1 — Body-Cam Report Drafting

Officer picks a body-camera clip → ASR transcribes the segments → LLM
drafts a structured occurrence report grounded in those segments →
officer reviews and accepts or rejects.

## Backend calls

| Call | Source service | Fixture in sim mode |
|---|---|---|
| `backend.inference.transcribe({ audioRef: clip.id })` | ASR (whisper) | `BODY_CAM_CLIPS[*].segments` |
| `backend.inference.complete({ useCaseId: "body-cam-report", … })` | LLM | `BODY_CAM_CLIPS[*].draftReport.narrative` |

## Pivot to real

1. Stand up the ASR + LLM endpoints behind `VITE_AISP_INFERENCE_URL`.
2. Have the ASR endpoint accept either an object-storage key or a
   pre-signed URL — same `audioRef` shape the simulated client uses.
3. Have the LLM endpoint honour `useCaseId` for prompt-template
   routing, OR drop `useCaseId` and switch to a system prompt the
   client builds explicitly.
4. Flip the toggle in the Infrastructure panel.
