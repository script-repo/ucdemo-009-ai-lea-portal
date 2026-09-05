# GitOps deployment

Full architecture and a replication checklist:
[`docs/gitops-nkp-pipeline.md`](../../docs/gitops-nkp-pipeline.md).

The deployable application is one container image:

```text
ghcr.io/script-repo/ucdemo-009-ai-lea-portal/portal
```

## Flow

1. A change to portal inputs on `main` triggers
   `.github/workflows/publish-portal.yml`.
2. GitHub Actions builds `linux/amd64`, publishes `main` and immutable
   `sha-<full-commit>` tags to GHCR, and attests the image.
3. The workflow updates this environment's `newTag` to the immutable SHA tag
   and commits that desired state to `main`.
4. Flux polls the public repository and reconciles
   `deploy/gitops/db-project-009/` into the `db-project-009` namespace.

The `main` tag is a convenience tag. Flux deploys the immutable SHA tag written
to `kustomization.yaml`.

## Bootstrap

Flux is already installed on NKP. Bootstrap this repository once:

```bash
kubectl apply -f deploy/flux/db-project-009-sync.yaml
```

After bootstrap, do not apply the application overlay manually. Change Git,
allow GitHub Actions to publish the image and update its tag, then let Flux
reconcile.

## Frontend

- Two replicas
- NodePort `30015`
- No PVC: application files are inside the image
- Non-secret environment metadata comes from `portal-config`

## Shared-resource settings

Inference endpoints, API keys, and selected models are saved in browser local
storage. The browser calls Nutanix Enterprise AI first and OpenRouter only if
the primary endpoint fails or is not configured. Clearing browser storage
removes the configuration.

This lab deployment has no user authentication or TLS. Use HTTPS and
authentication before deploying this configuration outside the isolated lab.

## Package visibility

The GHCR package must be public for an unauthenticated NKP pull. If it is kept
private, create an `imagePullSecret` out of band and reference it from the
Deployment; never commit registry credentials.
