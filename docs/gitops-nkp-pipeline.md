# GitOps delivery: GitHub → GHCR → Flux → NKP

This file copies the Casino portal's live delivery path onto this
repository. Git is the desired state. Flux makes the cluster match Git.

## Current lab instance

| Piece | This lab |
| --- | --- |
| GitHub repo | `https://github.com/script-repo/ucdemo-009-ai-lea-portal` |
| Branch Flux tracks | `main` |
| Container registry | `ghcr.io` |
| Image | `ghcr.io/script-repo/ucdemo-009-ai-lea-portal/portal` |
| Convenience tag | `main` |
| Deployed tag | `sha-<full-git-commit>` |
| GitHub Actions workflow | `.github/workflows/publish-portal.yml` |
| Desired-state overlay | `deploy/gitops/db-project-009/` |
| Flux bootstrap objects | `deploy/flux/db-project-009-sync.yaml` |
| NKP namespace | `db-project-009` |
| Deployment name | `aisp-portal` |
| Replicas | `2` |
| Service | NodePort `30015` → container port `8080` |
| Portal PVC | None |
| Package visibility | GHCR package should be **public** so NKP can pull without a pull secret |

```text
Developer laptop
      │  git commit + push origin main
      ▼
GitHub
      ├──────────────► GitHub Actions
      │                      ├─ docker build (linux/amd64)
      │                      ├─ docker push  ghcr.io/.../portal:sha-<commit>
      │                      └─ commit newTag into deploy/gitops/db-project-009/
      ▼
Flux on NKP  (polls Git every 1 minute)
      ▼
Namespace db-project-009
      ├─ Deployment aisp-portal   replicas: 2
      ├─ Service aisp-portal      NodePort 30015
      └─ ConfigMap portal-config  (hostnames only — no API keys)
```

## What not to do

- Do not store API keys in the overlay ConfigMap.
- Do not `kubectl apply -k deploy/gitops/db-project-009` for day-to-day releases.
- Do not treat the floating `main` image tag as the cluster pin. Flux follows `newTag`.
- Do not commit `imagePullSecret` YAML with a real password.

## Bootstrap

```bash
kubectl apply -f deploy/flux/db-project-009-sync.yaml
```

After that, change Git and let Actions + Flux run.

## Verify

```bash
kubectl -n db-project-009 get gitrepository,kustomization
kubectl -n db-project-009 get deploy,po,svc
curl -sI http://<node-ip>:30015
```
