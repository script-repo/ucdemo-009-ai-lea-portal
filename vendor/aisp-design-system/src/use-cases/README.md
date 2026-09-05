# Use cases

Each subfolder is one generative-AI surface hosted by the portal.

| Folder | Status | What it shows |
|---|---|---|
| `narrative-draft/` | beta | Reference implementation: prompt → grounded draft → human review → audit |
| `_template/` | template | Minimal scaffold for new use cases |

## Adding a new use case

See [`_template/README.md`](./_template/README.md).

## Rules

1. A use case never declares its own colors, typography, or layout
   tokens. If you need a new visual primitive, propose it in
   `src/components/` first — the design system is the source of
   truth, not the use case.
2. Every use case page must include `<DisclaimerBar/>`,
   `<AIResponseCard/>` for AI output, and an `<AuditTrail/>` for
   officer actions. The portal does NOT inject these automatically;
   each use case owns its accountability surface.
3. Sensitive fields (juvenile names, victim PII, informant IDs,
   medical history) must use `<RedactionToken/>`. Never inline raw.
4. Any artifact that could be confused with a finalized record must
   be wrapped in `<HumanReviewBanner/>` until the officer explicitly
   accepts it.
