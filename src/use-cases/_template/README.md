# Use case template

Copy this folder to create a new application use case.

```
src/use-cases/_template/  →  src/use-cases/<your-slug>/
```

Then:

1. Open `index.tsx`, rename `TemplateUseCase`, replace the placeholders.
2. Add an entry in `src/portal/useCases.ts`:

   ```ts
   import { YourUseCase } from "../use-cases/<your-slug>";

   {
     id: "<your-slug>",
     title: "Your Service",
     tagline: "One-line description.",
     description: "Two- or three-sentence longer description.",
     icon: "sparkles",          // pick from @aisp/icons IconName union
     category: "Drafting",      // Drafting | Search & retrieval | Analysis | Translation | Triage
     status: "experimental",    // experimental | beta | stable
     requires: ["genai.feature.scope"],
     component: YourUseCase,
   }
   ```

3. Visit `http://localhost:5174/#/uc/<your-slug>` to confirm it loads.

## Required hygiene

- `<DisclaimerBar/>` at the top of the page.
- `<AIResponseCard/>` for every AI turn.
- `<AuditTrail/>` somewhere visible.
- `<HumanReviewBanner/>` if the output could become part of a record.
- `<RedactionToken/>` for any PII / VICTIM / JUVENILE / INFORMANT /
  MEDICAL / CONFIDENTIAL reference.

If you find yourself reaching for a hex value, a custom button shape,
or a new CSS class — STOP. Open an issue in the design-system repo
instead. The whole point of `vendor/aisp-design-system/` being a
pinned submodule is that those decisions happen in one place.
