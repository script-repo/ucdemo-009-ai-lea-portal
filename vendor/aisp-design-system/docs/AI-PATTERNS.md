# AI Patterns for Law-Enforcement Use Cases

This document is the conceptual companion to
[`COMPONENTS.md`](./COMPONENTS.md). It explains *why* each AI pattern
in this design system exists and *how* to combine them. If you only
read one doc in this folder, read this one.

The AISP spec was written for static records management. It does
not address the failure modes that emerge when an LLM is in the loop:
hallucination, source leakage, accidental PII exposure, unaudited
state changes, automation bias. The patterns below are how this
design system addresses them.

---

## Pattern: Disclaimers & accountability

### Why

An officer's report is a legal artifact. Anything that looks finalized
will be treated as finalized. AI output that visually blends into a
record is a liability.

### How

- Every AI page begins with `<DisclaimerBar/>`. It is small, persistent,
  and visually distinct (red-ish background, dark red text).
- Every AI-produced artifact that could be confused with a finalized
  record is wrapped in `<HumanReviewBanner/>` until accepted.
- The accepted-or-rejected decision is appended to `<AuditTrail/>`.

### Anti-patterns

- A "don't show this again" dismiss button on the disclaimer.
- Auto-accepting AI output after a timeout.
- Hiding the review banner behind a tab.

---

## Pattern: Grounded generation (RAG)

### Why

Unsourced AI output cannot be verified. In law-enforcement context,
unverifiable output is worse than no output.

### How

- The officer chooses the source set with `<SourceSelector/>`.
- The selector is visible **on the same screen** as the prompt bar.
  Not in a settings page, not behind a gear icon.
- Every claim in the AI response carries a `<CitationChip/>`.
- The full source list appears with the response via
  `<CitationSources/>`. Clicking a chip jumps to the corresponding
  entry in the list (and ideally to the underlying record).
- If the model has nothing to cite for a claim, prefer to **drop the
  claim** rather than ship an unsourced sentence.

### Anti-patterns

- Citations rendered as footnotes the user must scroll for.
- "Sources" link that opens a modal — keep them inline.
- A single citation for an entire paragraph; cite at the claim level.

---

## Pattern: Confidence as a category, not a percentage

### Why

`73.4%` reads like calibrated probability. Real LLM confidence rarely
is. Officers asked to act on `73.4%` will treat it as quantitative
truth.

### How

Use `<ConfidenceBadge level="high|medium|low"/>`. Default to `medium`
unless you have strong reason to up- or down-grade. Reveal the raw
score only in audit / power-user views with `showScore`.

Mapping (suggested):

| Internal score | Level |
|---|---|
| ≥ 0.85 with ≥ 1 citation per claim | high |
| 0.55–0.85 or partial citations | medium |
| < 0.55, no citations, or inferred bridges | low |

Use case authors should tune the mapping per workflow.

### Anti-patterns

- A 0–100 progress bar.
- Color-only confidence (red/yellow/green dot with no label) — fails
  accessibility and is unreadable in print.

---

## Pattern: Default-opaque redaction

### Why

Even read-access to a record does not mean read-access to every field
in that record. Juvenile names, victim contact, informant identity,
and medical history are commonly subject to stricter scopes than the
record itself.

### How

- Use `<RedactionToken category="…"/>` for every inline reference.
- Default state is opaque (`[VICTIM]`, `[JUVENILE]`, etc.).
- A reveal action is allowed only when the caller is authorized.
  The component does not enforce authorization — your host does. The
  component fires `onReveal` so the host can audit the action.
- Revealed values render in dashed-border style; they look obviously
  "this was redacted a moment ago", not like normal body text.

### Anti-patterns

- Storing the raw value in the DOM where a screenshot would expose it.
- Using red for redaction (red is for errors in this system).
- Reveal toggles that don't audit.

---

## Pattern: Officer-in-the-loop

### Why

Automation bias is real. A draft sitting in a text field with no
visual difference from a normal field gets accepted without reading.

### How

The four-step canonical flow:

1. AI produces a draft inside `<AIResponseCard/>`.
2. `<HumanReviewBanner/>` sits above the draft with Accept / Reject
   / Edit actions.
3. Until the officer acts, the draft is **not** part of the record.
4. Accept / Reject / Edit each push an entry into `<AuditTrail/>`.

The accept button is `btn--primary` (institutional blue), reject is
`btn--dark`, edit is `btn--outline`. Order: Edit · Reject · Accept,
left to right (Accept is the rightmost, primary action).

### Anti-patterns

- "Suggested by AI, click to dismiss" with no explicit accept —
  silence becomes consent.
- An auto-save that commits the AI draft into the record.

---

## Pattern: Compact, persistent audit

### Why

After-the-fact accountability matters. A supervisor or auditor needs
to see exactly what happened: who prompted, what was generated, what
was accepted, what was revealed.

### How

- Use `<AuditTrail/>` somewhere visible on the use-case surface
  (typically the right rail).
- Every officer action and every AI response pushes an entry.
- Entries are timestamped, actor-tagged, and AI-flagged so they
  visually separate in the log.
- The component is read-only. Persisting the entries is the host's job.

### Anti-patterns

- Hiding the audit behind a separate tab.
- Logging only AI events and not officer events — the officer's
  consent is the most important state change.

---

## Pattern: AI uses a distinct accent, never replaces blue

### Why

If the AI surfaces look like everything else in AISP, officers will
mistake AI output for canonical system output.

### How

- All AI-specific UI uses `--ai-accent` (lavender). Reserved for AI
  triggers, AI response card headers, AI suggestion badges, AI button
  variant.
- Institutional blue (`--aisp-blue`) is reserved for navigation,
  primary affirmative actions, and links.
- A button that says "Generate" → `btn--ai`.
- A button that says "Accept this draft" → `btn--primary` (the officer's
  affirmation, not the AI's generation).

### Anti-patterns

- Replacing the primary blue button with the AI lavender button
  globally. The two colors mean different things; keep them separate.

---

## Pattern: Streaming feedback, not loading screens

### Why

Loading spinners feel modern and chatty — they clash with the legacy
enterprise aesthetic. Officers also want to know an inference is
in-flight without it dominating the screen.

### How

`<StreamingIndicator/>` is a small inline "Generating · · ·" with
three pulsing 5px dots. Place it where the response will appear, not
overlaid on the page.

### Anti-patterns

- Full-screen modal spinners.
- Long progress bars without ETA.

---

## Pattern: Read-only AI by default

### Why

AI features that *write* to records introduce a new failure surface
(write race conditions, partial commits, accidental overwrites).
Almost every law-enforcement AI use case can be valuable as
read-only-with-handoff.

### How

- Default a new use case to read-only output.
- The officer copies, edits, or accepts; the *officer* writes.
- If a use case must write, that write goes through
  `<HumanReviewBanner/>` and the audit log.

### Anti-patterns

- An "auto-update record on save" toggle.
- Background AI tasks that mutate records without an officer in the
  loop.
