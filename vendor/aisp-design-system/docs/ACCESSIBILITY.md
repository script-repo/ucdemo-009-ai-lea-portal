# Accessibility

The AISP visual language is dense by design (see spec §22 rule 1:
"Do not modernize spacing"). Density is in tension with several
accessibility heuristics. This document records the trade-offs we
accept, the ones we mitigate, and the ones we will not compromise on.

---

## What we accept

### Compact type (13px body)

The legacy enterprise aesthetic depends on 12–14px text. We do not
override this on a use-case basis.

**Mitigation**: respect the user's browser/OS zoom level. Do not lock
viewport scale (`<meta name="viewport" maximum-scale="1">` is forbidden
in this repository). At 200% zoom every layout in the design system
remains usable.

### High information density

Rows are 30–42px; spacing is 4–24px; cards have no shadow.

**Mitigation**: focus rings are 1px solid `--aisp-blue-light` and
visible everywhere. Hover states use background changes (no color-only
state). Keyboard focus order matches visual order.

---

## What we mitigate

### Status color reliance

Status uses red/yellow/green dots. By itself this fails WCAG 1.4.1.

**Mitigation**: every `StatusDot` and `ConfidenceBadge` carries a
text label and an icon glyph (`check`, `alert`, `info`). Color is
reinforcement, never the only signal.

### Density vs. tap targets

Mobile-only surfaces use larger touch targets (per spec §16). Desktop
buttons are 34px tall by default — meets WCAG 2.5.5 enhanced target
size for the "essential" exception under mouse/keyboard input.

---

## What we will not compromise

### Keyboard reachable

Every interactive element renders as `<button>` or `<a>`. The icon
rail items, side-panel rows, quick-link rows, record-row chevrons,
citation chips, redaction tokens (when revealable), audit log, and
all toolbar buttons all reach via Tab.

### Screen reader labels

- Every icon-only button has an `aria-label` matching its `title`.
- The icon rail nav is wrapped in `<nav aria-label="Primary navigation">`.
- AI response cards declare their role with `data-role`.
- Confidence badges declare themselves as `role="status"`.
- Redaction tokens describe themselves as
  "Redacted VICTIM information" so a screen-reader user knows what
  was masked without revealing the underlying value.
- Streaming indicator is `role="status" aria-live="polite"` so AT
  is informed mid-generation without spamming announcements.

### Focus visible

`outline: 1px solid var(--aisp-blue-light)` on `:focus-visible`. The
outline is muted to match the visual density but it is always there.
Never remove it from a component without a replacement focus style.

---

## Open items

- **Live regions for streaming responses**: when a response streams
  in token-by-token, screen readers benefit from an
  `aria-live="polite"` region rather than reading the full body
  on every update. The reference `AIResponseCard` does not yet
  implement this. Track in roadmap.
- **High-contrast theme**: the system currently ships one theme.
  Token names are designed so a future high-contrast variant can be
  introduced by swapping CSS custom-property values — no component
  changes required.
- **Reduce motion**: the streaming dots animate. Wrap the keyframe
  in `@media (prefers-reduced-motion: reduce)` to disable the pulse.
