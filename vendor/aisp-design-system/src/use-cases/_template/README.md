# Use case template

Copy this folder to create a new use case.

```
src/use-cases/_template/  →  src/use-cases/<your-slug>/
```

Then:

1. Open `index.tsx`, rename `TemplateUseCase`, and replace the placeholders.
2. Add an entry in `src/portal/useCases.ts`:

   ```ts
   import { YourUseCase } from "@/use-cases/<your-slug>";

   {
     id: "<your-slug>",
     title: "Your Use Case",
     tagline: "One-line description.",
     description: "Two- or three-sentence longer description.",
     icon: "sparkles",          // pick from src/icons/index.tsx
     category: "Drafting",      // Drafting | Search & retrieval | Analysis | Translation | Triage
     status: "experimental",    // experimental | beta | stable
     requires: ["genai.feature.scope"],
     component: YourUseCase,
   }
   ```

3. Visit `http://localhost:5173/#/uc/<your-slug>` to confirm it loads.

## Required hygiene

The template already wires up the three non-negotiable patterns:

- `DisclaimerBar` at the top.
- `AIResponseCard` for every AI turn.
- `AuditTrail` capturing officer + AI actions.

Do not remove them. If your use case generates an artifact that becomes
part of the record (a draft narrative, a redacted summary), also wrap
that artifact in `HumanReviewBanner` so the officer must explicitly
accept it.
