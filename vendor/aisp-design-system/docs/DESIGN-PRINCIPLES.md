# Design Principles

The AISP Design System exists to solve one problem:

> Officers should be able to use generative AI inside a records-management
> environment without the AI surfaces feeling alien, dangerous, or
> unaccountable.

Everything in this repository is in service of that statement. The
principles below are how we make decisions when the visual spec, the
component library, or a use case is ambiguous.

---

## 1. The visual language is AISP, not a chat app

The base aesthetic is dense, utilitarian, flat — defined by
[`aisp_ui_design_spec.md`](../aisp_ui_design_spec.md). AI is a
visitor inside that environment, not the host. Concretely:

- **No rounded cards, no shadows, no gradients** (except the mobile app
  bar, per spec §16).
- **Borders, not whitespace**, define hierarchy.
- **Compact typography** — 12–14px body, never larger.
- **Institutional blue is reserved** for navigation, primary actions,
  links, and active states. AI gets a separate lavender accent
  (`--ai-accent`) so officers can visually tell "this is AI" from
  "this is the system".

If a proposed AI feature requires us to break these rules to look
"modern", we keep the rules and rework the feature. The system the
officer is mentally modelling does not change because we bolted an
LLM onto it.

---

## 2. Every AI claim is a citation away from a record

A generative-AI feature for law enforcement that produces text without
showing **where it came from** is, in practice, useless: officers
cannot verify it, supervisors cannot trust it, and any output it
contributes to a record is unreviewable later.

Implications:

- The default `AIResponseCard` always renders alongside a citations
  list. Unsourced claims should be removed or visibly marked.
- `CitationChip` is the smallest unit. Every substantive AI claim has
  one inline; the chip is clickable and resolves to the source.
- `SourceSelector` is the officer's lever to constrain what the model
  may draw from on a turn. It must always be visible, never tucked
  behind a settings page.

---

## 3. AI output is never finalized without a human in the loop

The product never silently turns AI output into part of the record. The
canonical pattern:

1. AI generates a draft inside an `AIResponseCard`.
2. A `HumanReviewBanner` sits above the draft.
3. The officer must `Accept`, `Reject`, or `Edit`.
4. The chosen action fires an audit event.

There is no "auto-accept" mode. There is no "skip review" toggle. If a
PM asks for one, the answer is no — refer them to this section.

---

## 4. Sensitive information is opaque by default

Inside law-enforcement records there are values whose accidental
exposure causes real-world harm: juvenile names, victim contact
details, informant identifiers, medical history. When AI surfaces
these, the UI **must** treat them as redacted by default.

- Use `RedactionToken` for any inline reference to PII / VICTIM /
  JUVENILE / INFORMANT / MEDICAL / CONFIDENTIAL.
- Reveal must require an explicit user action and fire an audit event.
- Redaction blocks are charcoal — never red. Red is reserved for
  errors and destructive actions.

---

## 5. Confidence is three buckets, never a percentage

Numeric confidence (`73.4%`) implies precision the model does not have
and that officers should not act on. We use three buckets:

- **High** — the model has strong, well-cited grounding.
- **Medium** — partial grounding or inferred bridges. Default state.
- **Low** — speculation; the officer should treat this as a lead, not
  a fact.

If you have a raw probability you may show it (`showScore`) for
power-user / audit contexts, but the bucket is the canonical signal.

---

## 6. Every state change is auditable

Use cases must mount `AuditTrail` and append an entry whenever:

- An officer submits a prompt.
- The model generates output.
- The officer accepts, rejects, edits, copies, or reveals.
- A source toggle changes the AI's scope.

The audit log is read-only by the officer; the host application is
responsible for persisting it. The trail is a UI affordance for trust,
not the system of record.

---

## 7. Mobile is a different product

Per spec §16, the mobile experience is not a responsive desktop clone.
AI features should ship a *deliberately simplified* mobile flow rather
than try to shrink the desktop one. If a use case has no good mobile
flow yet, hide it on mobile rather than degrade it.

---

## 8. The design system owns the visual primitives

Use cases compose. They do not invent buttons, color tokens,
spacings, or icons. If a use case finds itself reaching for a hex
literal, an extra CSS file, or a new shape, that is a signal: file
an issue against the design system, not the use case.

This is what makes the portal feel like one product instead of a
shelf of disconnected experiments.
