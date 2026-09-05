import type { ComponentType } from "react";
import type { IconName } from "@/icons";

/**
 * USE-CASE REGISTRY
 *
 * The single source of truth for every generative-AI surface the
 * portal hosts. Adding a use case here exposes it on the home
 * launcher AND wires up its route — that's it.
 *
 * Conventions:
 *  - `id` is a kebab-case slug. It becomes the route segment.
 *  - `icon` MUST be an AISP line icon (see src/icons/index.tsx).
 *  - `status` lets you stage rollouts:
 *      "stable"      — production ready
 *      "beta"        — feature flagged but visible
 *      "experimental"— internal only, marked clearly in the UI
 *      "planned"     — placeholder card, no route
 *  - `category` groups the cards on the home launcher.
 *  - `requires` lists role/permission identifiers your auth layer
 *    should gate on. Display only; enforcement is up to the host.
 */

export type UseCaseStatus = "stable" | "beta" | "experimental" | "planned";

export type UseCaseCategory =
  | "Drafting"
  | "Search & retrieval"
  | "Analysis"
  | "Translation"
  | "Triage";

export type UseCaseDefinition = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: IconName;
  category: UseCaseCategory;
  status: UseCaseStatus;
  requires?: string[];
  component?: ComponentType;
};

import { NarrativeDraftUseCase } from "@/use-cases/narrative-draft";

export const useCases: UseCaseDefinition[] = [
  {
    id: "narrative-draft",
    title: "Narrative Drafting Assistant",
    tagline: "Draft an occurrence narrative from notes and records.",
    description:
      "Compose a structured narrative section by section, pulling supporting facts from linked records. Every claim is cited; every output requires officer review before it joins the report.",
    icon: "document",
    category: "Drafting",
    status: "beta",
    requires: ["genai.narrative.write"],
    component: NarrativeDraftUseCase,
  },
  {
    id: "records-copilot",
    title: "Records Search Copilot",
    tagline: "Ask plain-English questions across records you can access.",
    description:
      "Natural-language search over occurrences, persons, and addresses. Cites every record it surfaces; respects redaction rules; never returns data outside your assigned scope.",
    icon: "search",
    category: "Search & retrieval",
    status: "planned",
    requires: ["genai.search.read"],
  },
  {
    id: "evidence-summary",
    title: "Evidence Summary",
    tagline: "Summarize an occurrence into a 5-line brief.",
    description:
      "Generates a non-evidentiary summary card for triage. Officer reviews before forwarding to a supervisor. Audit log captures every regeneration.",
    icon: "list",
    category: "Triage",
    status: "planned",
  },
  {
    id: "translate",
    title: "Statement Translation",
    tagline: "Translate a witness statement with confidence scoring.",
    description:
      "Side-by-side translation with per-sentence confidence and a 'keep original' fallback when the model is uncertain.",
    icon: "mail",
    category: "Translation",
    status: "planned",
  },
  {
    id: "pattern-finder",
    title: "Pattern Finder",
    tagline: "Surface recurring entities across recent occurrences.",
    description:
      "Cluster recent reports by recurring persons, vehicles, or addresses. Strictly read-only; output is presented as leads to be verified, never as conclusions.",
    icon: "occurrence",
    category: "Analysis",
    status: "planned",
  },
];

export function findUseCase(id: string): UseCaseDefinition | undefined {
  return useCases.find((uc) => uc.id === id);
}

export function groupByCategory(): Record<string, UseCaseDefinition[]> {
  return useCases.reduce<Record<string, UseCaseDefinition[]>>((acc, uc) => {
    (acc[uc.category] ??= []).push(uc);
    return acc;
  }, {});
}
