# Authoring a Use Case

A "use case" is one generative-AI surface — narrative drafting,
records copilot, evidence summary, etc. The portal hosts them; the
design system gives them their look and shared safety primitives.

---

## TL;DR

1. Copy `src/use-cases/_template/` to `src/use-cases/<your-slug>/`.
2. Rename the component, replace the placeholders.
3. Register the use case in `src/portal/useCases.ts`.
4. Visit `http://localhost:5173/#/uc/<your-slug>`.

---

## Step by step

### 1. Pick a slug

Kebab-case, scoped to the workflow:

- `narrative-draft`
- `records-copilot`
- `evidence-summary`

The slug becomes the route segment (`/uc/<slug>`) and the folder name.

### 2. Copy the template

```
src/use-cases/_template/  →  src/use-cases/<your-slug>/
```

Open `index.tsx`. Rename `TemplateUseCase` to something descriptive
(`NarrativeDraftUseCase`, `RecordsCopilotUseCase`, …).

### 3. Compose the surface

Use cases are *compositions*, not new visual primitives. The full
toolbox lives in `@/components`. The most common moving parts:

- `<Workspace>` — the scrollable container.
- `<DisclaimerBar>` — **required** at the top.
- `<Section>` — for grouping. Headers carry counts.
- `<SourceSelector>` — for any RAG-grounded use case.
- `<AIPromptBar>` + `<AIResponseCard>` — for the actual interaction.
- `<HumanReviewBanner>` — when the output could enter a record.
- `<AuditTrail>` — **required** somewhere on the page.
- `<CitationChip>` / `<CitationSources>` — for every cited claim.
- `<ConfidenceBadge>` — on every AI response.
- `<RedactionToken>` — for every PII / victim / juvenile reference.

A typical two-column layout:

```tsx
<Workspace>
  <DisclaimerBar />

  <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14 }}>
    {/* left: prompt, response, citations */}
    <main>
      <Section title="Composition">
        <AIPromptBar onSubmit={handlePrompt} />
      </Section>
      {response && (
        <>
          <HumanReviewBanner onAccept={...} onReject={...} onEdit={...} />
          <AIResponseCard role="ai" confidence="medium" ...>
            ...
          </AIResponseCard>
          <Section title="Sources" count={citations.length}>
            <CitationSources citations={citations} />
          </Section>
        </>
      )}
    </main>

    {/* right: controls + audit */}
    <aside>
      <SourceSelector ... />
      <AuditTrail entries={audit} />
    </aside>
  </div>
</Workspace>
```

For a copy-paste reference, see
[`src/use-cases/narrative-draft/index.tsx`](../src/use-cases/narrative-draft/index.tsx).

### 4. Wire your backend

Replace the simulated `handlePrompt` in your file with a call to your
AI service. The surface contract:

- The service returns text + citations + a confidence level.
- The use-case component renders that into `<AIResponseCard>` with
  `<CitationChip>`s embedded inline.
- Until the officer accepts via `<HumanReviewBanner>`, the result is
  **not** committed.

### 5. Register the use case

Open `src/portal/useCases.ts`:

```ts
import { YourUseCase } from "@/use-cases/your-slug";

export const useCases: UseCaseDefinition[] = [
  // ...existing entries
  {
    id: "your-slug",
    title: "Your Use Case",
    tagline: "One line that fits on a card.",
    description: "Two-sentence longer description for the home launcher.",
    icon: "sparkles",                    // pick from src/icons/index.tsx
    category: "Drafting",                // see UseCaseCategory union
    status: "experimental",              // experimental → beta → stable
    requires: ["genai.feature.scope"],   // for display only
    component: YourUseCase,
  },
];
```

That's it. The portal home page picks it up; the route is live.

---

## Conventions

- **No new visual tokens** in a use case. Hex literals and pixel
  literals are a smell. If you need a value, add it to
  `src/styles/tokens.css` first.
- **No layout overrides** that fight the AppShell. If you need a
  different layout (full-screen reading mode), discuss it in the
  design system before forking the AppShell.
- **Inline styles are OK** for layout glue (gap, grid templates).
  They are **not** OK for colors, typography, or border treatment —
  those must come from CSS classes or token variables.
- **Audit every state change.** If you find yourself adding a button
  that doesn't push to the audit log, ask why.
- **Disclaimer first.** Never skip `<DisclaimerBar/>`.

---

## Definition of done

A use case is ready to flip to `stable` when:

- [ ] `<DisclaimerBar/>` is present.
- [ ] Every AI output is rendered with `<AIResponseCard/>`.
- [ ] Every substantive claim has a `<CitationChip/>`.
- [ ] Every artifact that can become part of a record is wrapped
      in `<HumanReviewBanner/>`.
- [ ] Sensitive fields use `<RedactionToken/>`.
- [ ] Officer + AI actions push to `<AuditTrail/>`.
- [ ] No hex literals or pixel literals in the use-case folder.
- [ ] Mobile flow either exists or the use case is hidden on mobile.
- [ ] Backend integration replaces the simulated handler.
- [ ] Status field in the registry is updated.
