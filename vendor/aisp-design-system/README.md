# AISP Design System

A design system and portal application for building **generative-AI
use cases in a law-enforcement records-management environment**.

This repository is the **source of truth** for any AI-driven UI in
this workspace. New use cases should be authored against this system,
not against ad-hoc components.

It is built directly on top of the AISP visual language defined
in [`aisp_ui_design_spec.md`](./aisp_ui_design_spec.md), and
extends that spec with the AI-specific patterns needed for safe,
auditable generative experiences:

- inline citations (`CitationChip`, `CitationSources`)
- three-bucket confidence (`ConfidenceBadge`)
- default-opaque redaction (`RedactionToken`)
- accept-reject-edit gating (`HumanReviewBanner`)
- persistent audit (`AuditTrail`)
- scope-control before generation (`SourceSelector`)
- "this is a draft, not evidence" disclaimer (`DisclaimerBar`)

---

## Quick start

```powershell
npm install
npm run dev
```

Then open the URL printed by Vite (typically
[http://localhost:5173](http://localhost:5173)).

Build:

```powershell
npm run build
npm run preview
```

Type-check only (no emit):

```powershell
npm run typecheck
```

---

## Repository layout

```
TPS-demo/
├── aisp_ui_design_spec.md     # The original AISP spec — read first
├── README.md                       # You are here
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── docs/
│   ├── DESIGN-PRINCIPLES.md        # Why we do what we do
│   ├── TOKENS.md                   # Every design token, what it's for
│   ├── COMPONENTS.md               # Catalog of every exported component
│   ├── AI-PATTERNS.md              # AI-specific patterns + LE rationale
│   ├── USE-CASES.md                # How to author a new use case
│   └── ACCESSIBILITY.md            # Density vs. a11y trade-offs
└── src/
    ├── main.tsx                    # Entry point
    ├── App.tsx                     # Router
    ├── tokens.ts                   # Design tokens (TypeScript mirror of CSS)
    ├── styles/
    │   ├── index.css               # Imports everything below
    │   ├── tokens.css              # Design tokens (runtime SOT)
    │   ├── reset.css               # Baseline reset
    │   ├── layout.css              # App shell, rail, panel, toolbar, header
    │   ├── primitives.css          # Buttons, inputs, status, badges
    │   ├── patterns.css            # Section, list, quick-link, person, login
    │   ├── ai.css                  # AI-specific patterns
    │   └── mobile.css              # Mobile overrides
    ├── icons/
    │   └── index.tsx               # All inline SVG icons
    ├── components/
    │   ├── index.ts                # Public API barrel — import from here
    │   ├── layout/                 # AppShell, IconRail, SidePanel, ...
    │   ├── primitives/             # Button, Input, FormField, ...
    │   ├── patterns/               # Section, SearchStrip, RecordRow, ...
    │   └── ai/                     # AIPromptBar, AIResponseCard, ...
    ├── portal/
    │   ├── PortalShell.tsx         # Hosts the rail/panel/toolbar around routes
    │   ├── PortalHome.tsx          # Launcher home
    │   ├── UseCaseRoute.tsx        # Renders the registered use case
    │   └── useCases.ts             # USE-CASE REGISTRY — single source of truth
    └── use-cases/
        ├── README.md
        ├── narrative-draft/        # Reference implementation (live)
        └── _template/              # Copy this to create a new use case
```

---

## Reading order

If you are new to this repository, read the docs in this order:

1. [`aisp_ui_design_spec.md`](./aisp_ui_design_spec.md) —
   the visual language you are inheriting.
2. [`docs/DESIGN-PRINCIPLES.md`](./docs/DESIGN-PRINCIPLES.md) — why
   the AI surfaces are shaped the way they are.
3. [`docs/AI-PATTERNS.md`](./docs/AI-PATTERNS.md) — every AI-specific
   pattern, what it solves, what *not* to do with it.
4. [`docs/COMPONENTS.md`](./docs/COMPONENTS.md) — the catalog you will
   actually compose against.
5. [`docs/USE-CASES.md`](./docs/USE-CASES.md) — how to ship your own
   surface.
6. [`docs/TOKENS.md`](./docs/TOKENS.md) — token reference.
7. [`docs/ACCESSIBILITY.md`](./docs/ACCESSIBILITY.md) — the trade-offs
   we have accepted.

---

## Adding a new use case

Short version:

```
1. cp -r src/use-cases/_template  src/use-cases/<your-slug>
2. Replace placeholders inside index.tsx
3. Register in src/portal/useCases.ts
4. Open http://localhost:5173/#/uc/<your-slug>
```

Long version: [`docs/USE-CASES.md`](./docs/USE-CASES.md).

Hard rules:

- Every page renders `<DisclaimerBar/>` first.
- Every AI output uses `<AIResponseCard/>`.
- Every substantive claim carries a `<CitationChip/>`.
- Every artifact that could enter a record is wrapped in
  `<HumanReviewBanner/>`.
- Sensitive values use `<RedactionToken/>`.
- Officer + AI actions append to `<AuditTrail/>`.

If you find a use case fighting against these, the right move is
almost always to redesign the use case, not relax the rule.

---

## Tech notes

- React 18 + TypeScript + Vite. Hash routing keeps the bundle
  trivially deployable behind any static file server.
- No CSS-in-JS, no Tailwind. CSS variables on `:root` are the SOT;
  every component composes the same class names that appear in the
  AISP spec. Swap the stylesheet, change the theme — no
  component rewrites needed.
- `@types/react` brings the JSX namespace. `tsconfig.json` uses
  `"jsx": "react-jsx"` (the new transform) so components do not
  need to import React.
- The use-case registry (`src/portal/useCases.ts`) is the single
  point that connects a slug, a route, a launcher card, and a
  component. Touch it, and nothing else, to flip a use case on.

---

## License & data

All names, photos, IDs, addresses, and incident numbers in this
repository are fictional placeholders. The design system does not
ship with any real records. Per spec §24 ("anonymized placeholder
data"), keep it that way.
