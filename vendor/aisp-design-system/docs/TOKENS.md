# Design Tokens

The single source of truth at runtime is
[`src/styles/tokens.css`](../src/styles/tokens.css). When you need
token values from JavaScript (e.g. for a chart library that does not
read CSS custom properties), use
[`src/tokens.ts`](../src/tokens.ts).

> If you change a value in one file, change the other.

Never use hex literals or pixel literals in component code. If a value
isn't in the tokens, propose adding it.

---

## Color

### Brand (institutional, navigation only)

| Token | Value | Use |
|---|---|---|
| `--aisp-blue` | `#1565b3` | Primary brand surfaces (icon rail) |
| `--aisp-blue-dark` | `#0d4f91` | Active states, hover on icon rail |
| `--aisp-blue-light` | `#2f7ec8` | Focus rings, secondary brand surfaces |

### Chrome

| Token | Value | Use |
|---|---|---|
| `--aisp-charcoal` | `#24262b` | Dark context header background |
| `--aisp-charcoal-2` | `#2f3137` | Charcoal hover |
| `--aisp-topbar-icon` | `#6b6f77` | Default top-toolbar icon color |

### Surfaces

| Token | Value |
|---|---|
| `--aisp-bg` | `#ffffff` |
| `--aisp-section-bg` | `#f3f4f8` |
| `--aisp-muted-bg` | `#f7f8fb` |

### Borders

| Token | Value |
|---|---|
| `--aisp-border` | `#d9dce3` |
| `--aisp-border-soft` | `#eceef3` |
| `--aisp-border-dark` | `#c5c9d3` |

### Text

| Token | Value |
|---|---|
| `--aisp-text` | `#2b2f36` |
| `--aisp-text-muted` | `#6c7280` |
| `--aisp-link` | `#215f9c` |

### Status

| Token | Value | Use |
|---|---|---|
| `--aisp-status-ok` | `#5a9f3b` | Complete / valid |
| `--aisp-status-warning` | `#f1c232` | Incomplete / attention |
| `--aisp-status-error` | `#c0392b` | Invalid / destructive |
| `--aisp-status-info` | `#3f7fbf` | Neutral information |

### Buttons

| Token | Value |
|---|---|
| `--aisp-btn-primary` | `#1268b3` |
| `--aisp-btn-primary-hover` | `#0e5798` |
| `--aisp-btn-dark` | `#333333` |
| `--aisp-btn-disabled` | `#bfc4cc` |

---

## AI extensions (not in original AISP spec)

These tokens give AI surfaces a distinct vocabulary while staying
visually compatible with the rest of the system.

| Token | Value | Use |
|---|---|---|
| `--ai-accent` | `#5a4fb3` | The lavender that marks "AI did this" |
| `--ai-accent-dark` | `#423a8e` | Hover / active for the AI accent |
| `--ai-accent-soft` | `#eeecf7` | AI response card header strip, AI badge bg |
| `--ai-citation-bg` | `#eef3fa` | Citation chip background |
| `--ai-citation-border` | `#b6cbe3` | Citation chip border |
| `--ai-redaction-bg` | `#2b2f36` | Redaction block background (charcoal — never red) |
| `--ai-review-bg` | `#fff8e1` | Human-in-the-loop banner background |
| `--ai-draft-bg` | `#fdecec` | "Draft — not evidence" disclaimer bar |
| `--ai-confidence-high` | `#5a9f3b` | High confidence dot |
| `--ai-confidence-medium` | `#f1c232` | Medium confidence dot |
| `--ai-confidence-low` | `#c0392b` | Low confidence dot |

---

## Typography

| Token | Value |
|---|---|
| `--font-ui` | `Arial, Helvetica, "Roboto", sans-serif` |
| `--font-mono` | `"Consolas", "Menlo", "Monaco", "Courier New", monospace` |
| `--font-size-xs` | `11px` |
| `--font-size-sm` | `12px` |
| `--font-size-md` | `13px` (default body) |
| `--font-size-base` | `14px` |
| `--font-size-lg` | `16px` |
| `--font-size-xl` | `18px` |
| `--line-tight` | `1.2` |
| `--line-normal` | `1.4` |

The default body size is `13px`. Do not enlarge it on a use-case basis.
The compactness of the type is what makes the dense data layout
readable — moving it up to 16px would force everything else to grow.

---

## Spacing

| Token | Value |
|---|---|
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` (default gap) |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |

---

## Layout

| Token | Value | Use |
|---|---|---|
| `--aisp-icon-rail-width` | `42px` | Vertical blue icon rail |
| `--aisp-side-panel-width` | `260px` | Left assistant / nav panel |
| `--aisp-top-toolbar-height` | `42px` | Light toolbar above context header |
| `--aisp-context-header-height` | `52px` | Dark charcoal context header |
| `--ai-prompt-bar-height` | `56px` | Minimum height of AI prompt input |
| `--ai-response-max-width` | `760px` | Max width of an AI response card |

---

## Radius

The spec is square-cornered by default. The only allowed radii:

| Token | Value | Use |
|---|---|---|
| `--border-radius-none` | `0` | Default for cards, buttons, inputs |
| `--border-radius-sm` | `2px` | Badges, citation chips, redaction blocks |
| `--border-radius-pill` | `999px` | Status dots only |

Anything in between is wrong.

---

## Z-index

| Token | Value |
|---|---|
| `--z-rail` | `100` |
| `--z-toolbar` | `90` |
| `--z-panel` | `80` |
| `--z-modal` | `200` |
| `--z-toast` | `300` |
