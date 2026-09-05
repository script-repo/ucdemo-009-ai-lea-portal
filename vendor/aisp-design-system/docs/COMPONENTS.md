# Component Catalog

Every component is exported from `@/components`. Use cases must
import only from that barrel — direct imports from subfolders are
considered private API and may move.

```ts
import {
  AppShell,
  IconRail,
  SidePanel,
  ContextHeader,
  Workspace,
  Section,
  Button,
  AIPromptBar,
  AIResponseCard,
  CitationChip,
  RedactionToken,
  HumanReviewBanner,
  AuditTrail,
} from "@/components";
```

---

## Layout

### `<AppShell>`

Three-zone application frame (icon rail | side panel | main).

| Prop | Type | Notes |
|---|---|---|
| `iconRail` | `ReactNode` | Required. Use `<IconRail/>`. |
| `sidePanel` | `ReactNode` | Optional. Omit for two-zone layouts. |
| `children` | `ReactNode` | The main column (toolbar, context header, workspace). |

### `<IconRail>`

42px-wide blue rail on the far left. Pass an array of `{ id, icon, label, active?, onClick?, href? }`. `label` becomes the
`aria-label` — required.

### `<SidePanel>` / `<NavGroup>` / `<NavItem>`

260px navigation panel. `SidePanel` accepts `variant="ai"` to swap
in the lavender AI background.

### `<TopToolbar>`

Light toolbar above the context header. Pass `leftActions` /
`rightActions` (`ToolbarAction[]`) and a `user` object. Free-form
children appear between the left actions and the right edge.

### `<ContextHeader>`

Dark charcoal title strip. Required props: `title`. Optional:
`subtitle`, `icon`, `actions`.

### `<Workspace>`

Scrollable main work area. Pass `narrow` to cap at 960px for
reading-heavy surfaces.

---

## Primitives

### `<Button>`

Variants: `primary | dark | outline | ghost | ai | danger`.
Sizes: `sm | md | lg`. Always square-cornered. The `ai` variant is
reserved for AI generation triggers.

### `<StatusDot>`

18px circle. Variants: `ok | warning | error | info | muted`.

### `<Badge>`

Inline metadata chip. Variants: `default | blue | ok | warning | error | ai`.

### `<Input>` / `<Select>` / `<Textarea>`

Thin-bordered 30px controls. Same API as the underlying HTML
elements — use the `htmlFor` of an outer `<FormField>` for labels.

### `<FormField>`

Label + control + help/error stack. Use inside `<FormGrid>`.

### `<FormGrid>`

Dense 2/3/4-column grid. Pass `columns={3}` to override.

---

## Patterns

### `<Section>`

Header strip + body card. Props:

| Prop | Type | Notes |
|---|---|---|
| `title` | `ReactNode` | Required |
| `count` | `number` | Rendered as ` (count)` after the title |
| `meta` | `ReactNode` | Right-aligned in the header |
| `trailing` | `ReactNode` | Goes after `meta` |
| `collapsible` | `boolean` | Toggles open/closed on header click |
| `defaultOpen` | `boolean` | Default `true` |
| `flush` | `boolean` | Removes body padding |

### `<SearchStrip>`

Desktop search bar: type select | input | advanced link | blue button.
Pass `types`, `onSearch`, `onAdvanced`.

### `<RecordList>` / `<RecordRow>`

Active-items list. `RecordRow` props: `role`, `title`, `meta`,
`summary`, `actions`, `iconName`, `onOpen`.

### `<QuickLinks>` / `<QuickLink>`

Home-page quick-link rows.

---

## AI extensions

### `<DisclaimerBar>`

The "draft — not evidence" header. Use it at the top of every AI page.

### `<HumanReviewBanner>`

Wraps an AI artifact with Accept / Reject / Edit actions. Each handler
should also push an entry into the audit log.

### `<AIPromptBar>`

Textarea + Send button. Submits on Enter; Shift+Enter for newline.

### `<AIResponseCard>`

One conversation turn. Pass `role: "user" | "ai" | "system"`,
optional `model`, `confidence`, `timestamp`, `actions`.

### `<CitationChip>` / `<CitationSources>`

Inline `[1]`-style chip and the corresponding source list. Use
`Citation` shape: `{ index, title, meta?, onOpen?, href? }`.

### `<ConfidenceBadge>`

Three-level confidence: `high | medium | low`. Optional `score` +
`showScore` for power users.

### `<RedactionToken>`

Inline `[CATEGORY]` block. Categories: `PII | JUVENILE | VICTIM | CONFIDENTIAL | INFORMANT | MEDICAL`. Set `revealable` and supply
`onReveal` to audit reveal events.

### `<StreamingIndicator>`

Three pulsing dots + label. Use during model inference.

### `<SourceSelector>`

Checkbox list of records the AI may draw from on a given turn.

### `<AuditTrail>` / `AuditEntry`

Read-only audit list. Each entry: `{ id, timestamp, actor, action, ai? }`.

### `<AISuggestion>`

Compact inline suggestion with Accept / Dismiss. Use for single-line
corrections, not full artifacts.

---

## Icons

`<Icon name="…" size={18}/>` — see `src/icons/index.tsx` for the full
list. All icons are stroke-only line icons; never introduce filled
illustrative icons.
