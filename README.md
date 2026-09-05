# AISP Portal

React + TypeScript + Vite portal that hosts generative-AI use cases for
law-enforcement agencies. Visual primitives come from the pinned design
system at `vendor/aisp-design-system/` — do not edit that folder.

GitHub: https://github.com/script-repo/ucdemo-009-ai-lea-portal

```
.
├── src/                       Portal, backend abstraction, use cases
├── vendor/aisp-design-system/ Pinned visual language (do not edit)
├── shared-resources/          Inference gateway catalogue
├── deploy/gitops/             Flux overlay for NKP (`db-project-009`)
├── deploy/flux/               One-time Flux bootstrap
└── Dockerfile                 Portal image published to GHCR
```

## Quick start

```powershell
npm install
npm run dev
```

Opens at http://localhost:5174. Configure inference on `#/resources`,
then switch the portal to **real** mode on `#/infrastructure`.

## Inference

Use cases call `useBackend().inference.complete()`. In real mode the
gateway tries **Nutanix Enterprise AI** first and **OpenRouter** only if
the primary endpoint fails or is not configured.

Keys, endpoints, and selected models are saved in this browser only.
They are never committed and never stored in a Kubernetes Secret.

## GitOps

Live path: push to `main` → GitHub Actions publishes
`ghcr.io/script-repo/ucdemo-009-ai-lea-portal/portal` → the workflow
writes `sha-<commit>` into `deploy/gitops/db-project-009/kustomization.yaml`
→ Flux reconciles into namespace `db-project-009` (NodePort `30015`).

Bootstrap once:

```bash
kubectl apply -f deploy/flux/db-project-009-sync.yaml
```

See [`deploy/gitops/README.md`](deploy/gitops/README.md) and
[`docs/gitops-nkp-pipeline.md`](docs/gitops-nkp-pipeline.md).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Portal with hot reload |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript, no emit |

## Adding a use case

1. Copy `src/use-cases/_template/` to `src/use-cases/<slug>/`.
2. Register it in `src/portal/useCases.ts`.
3. Talk to `useBackend()` only. Do not fetch inference APIs directly.

Required hygiene: `DisclaimerBar`, `AIResponseCard`, `AuditTrail`,
`HumanReviewBanner` when output can become a record, `RedactionToken`
for sensitive references.
