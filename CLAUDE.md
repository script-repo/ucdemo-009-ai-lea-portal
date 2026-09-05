# AISP Portal — agent context

This file gives any AI agent (composer or background) the persistent
context it needs to work on this repository safely. Read it once at
the start of every iteration.

## What this repo is

The **AISP Portal** is a React + TypeScript + Vite application that
hosts generative-AI use cases for law-enforcement agencies (Toronto
Police Service is the design partner). The portal has two layers:

1. **Pinned design system** at `vendor/aisp-design-system/` — a vendored
   snapshot so GitHub Actions and Flux can build without a private
   submodule URL. **Never edit anything in this folder.** All visual
   primitives, AI components (DisclaimerBar, AIResponseCard,
   AuditTrail, CitationChip, RedactionToken, ConfidenceBadge,
   HumanReviewBanner, SourceSelector, AIPromptBar, StreamingIndicator),
   icons, and CSS tokens come from there.

2. **Application code** under `src/`. This is yours to modify.

## Architecture you must understand

```
src/
├── App.tsx                         hash router
├── main.tsx                        loads `@aisp/styles` once
├── portal/
│   ├── PortalShell.tsx             AppShell + IconRail + SidePanel + ribbon
│   ├── PortalHome.tsx              launcher home page
│   ├── UseCaseRoute.tsx            /uc/:id renderer
│   ├── InfrastructurePanel.tsx     /infrastructure operator inspector
│   ├── ResourcesPanel.tsx          /resources — NAI + OpenRouter keys
│   ├── BackendModeRibbon.tsx       persistent sim/real ribbon
│   └── useCases.ts                 THE registry — register every use case here
├── backend/                        SIMULATED + REAL backend abstraction
│   ├── index.ts                    BackendClient + useBackend() hook
│   ├── types.ts                    contracts shared by sim and real
│   ├── config.ts                   mode toggle (localStorage), env config
│   ├── latency.ts                  realistic-feeling delays + chunk streaming
│   ├── fixtures/                   domain data the simulated layer serves
│   ├── inference/                  LLM, ASR, embeddings, vision (sim + real)
│   ├── vector/                     RAG retrieval (sim + real)
│   ├── relational/                 PostgreSQL-style queries (sim + real)
│   ├── object-storage/             S3/Nutanix Objects (sim + real)
│   ├── virtualization/             AHV / KVM (sim + real)
│   └── kubernetes/                 NKE workloads (sim + real)
└── use-cases/
    ├── _template/                  copy this to start a new use case
    ├── shift-handover/             reference implementation
    └── <one folder per use case>
```

## How a use case is built

Every use case is a **composition** of design-system primitives plus
the `useBackend()` hook. Use cases must NEVER:

- Modify anything under `vendor/aisp-design-system/`
- Introduce new visual primitives, hex literals, or pixel literals
  for colors / typography / borders (use design-system classes /
  tokens or `Icon`)
- Bypass `<DisclaimerBar/>`, `<AIResponseCard/>`, `<AuditTrail/>`,
  `<HumanReviewBanner/>` (when output can become a record), or
  `<RedactionToken/>` (when displaying PII / VICTIM / JUVENILE /
  INFORMANT references)
- Talk to network APIs directly. Always go through `useBackend()`.

Inline styles ARE allowed for layout glue (gap, grid templates) — just
not for color, typography, or borders.

## How the backend abstraction works

Every UI call goes through one `BackendClient` returned by
`useBackend()` (or `getBackend()` outside React). The client routes to
either the simulated or real implementation based on
`localStorage["aisp.backend.mode"]`. The mode is flipped from the
Infrastructure panel (`/infrastructure` route).

A use case's backend interaction looks like:

```tsx
import { useBackend } from "../../backend";

const backend = useBackend();
const response = await backend.inference.complete({
  prompt: userPrompt,
  useCaseId: "evidence-intel",   // routes to the right fixture in sim mode
  context: passages,
  onChunk: (chunk) => appendStreaming(chunk),
});
log(`Inference returned in ${response.provenance.latencyMs}ms via ${response.provenance.source}`);
```

Switching completions to real inference:

1. Save Nutanix Enterprise AI (and optional OpenRouter) settings on `/resources`
2. Toggle the mode in the Infrastructure panel

Other services still read `VITE_AISP_*` when those URLs are set.

## Required hygiene on every use case

- `<DisclaimerBar/>` at the very top
- `<AIResponseCard/>` for every AI turn (with `confidence` prop set)
- `<AuditTrail/>` somewhere visible (typically right rail)
- `<HumanReviewBanner/>` when the AI output could become part of a
  record
- `<RedactionToken category="…"/>` for every sensitive reference
- Every officer action AND every AI response pushes an audit entry
- Stamp the AI response card's `provenance` (mode + source + latency)
  somewhere in the audit log so a supervisor can tell sim from real

## Definition of done for a use case

- [ ] Folder under `src/use-cases/<slug>/` with `index.tsx` + README
- [ ] Component registered in `src/portal/useCases.ts` (status bumped
      out of `planned`)
- [ ] All required hygiene components present
- [ ] Talks to `useBackend()` exclusively — no direct fetches
- [ ] Audit trail records both officer events and AI events
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] `progress.txt` updated and committed

## Coordination

When the orchestrator delegates to a sub-agent for a single use case,
the sub-prompt at `sub-prompts/<slug>.md` is the contract — DO NOT
expand scope beyond that file. If the use case needs a fixture or
backend method that doesn't exist, STOP and add a row to the
"Blockers" section of `progress.txt` rather than inventing one
inline.
