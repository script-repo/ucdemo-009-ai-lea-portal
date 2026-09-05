import type { ComponentType } from "react";
import type { IconName } from "@aisp/icons";

/**
 * APPLICATION USE-CASE REGISTRY.
 *
 * Add an entry, register a component, and the portal home page picks
 * it up. The route `/uc/<id>` becomes live automatically.
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

import { ShiftHandoverUseCase } from "../use-cases/shift-handover";
import { BodyCamReportUseCase } from "../use-cases/body-cam-report";
import { EvidenceIntelUseCase } from "../use-cases/evidence-intel";
import { EvidenceRedactionUseCase } from "../use-cases/evidence-redaction";
import { MultilingualInterviewUseCase } from "../use-cases/multilingual-interview";
import { LinkAnalysisUseCase } from "../use-cases/link-analysis";
import { PolicyChatbotUseCase } from "../use-cases/policy-chatbot";
import { Transcript911UseCase } from "../use-cases/transcript-911";
import { DatabaseIntegrationUseCase } from "../use-cases/database-integration";
import { DocumentRedactionUseCase } from "../use-cases/document-redaction";

export const useCases: UseCaseDefinition[] = [
  {
    id: "body-cam-report",
    title: "Body-Cam Report Drafting",
    tagline: "Auto-draft a structured incident report from a body-camera clip.",
    description:
      "Transcribes the clip, extracts the key parties and actions, and drafts a structured occurrence report. Officer reviews, redacts, and accepts before anything reaches the record.",
    icon: "document",
    category: "Drafting",
    status: "experimental",
    requires: ["genai.bodycam.transcribe", "genai.report.draft"],
    component: BodyCamReportUseCase,
  },
  {
    id: "evidence-intel",
    title: "Ask Your Case File",
    tagline: "Plain-English search over a case's mixed-media evidence.",
    description:
      "Agentic RAG across video, photos, witness statements, transactions, and case notes. Every claim is grounded in a chain-of-custody-tracked exhibit.",
    icon: "folder",
    category: "Search & retrieval",
    status: "experimental",
    requires: ["genai.evidence.rag", "vector.evidence"],
    component: EvidenceIntelUseCase,
  },
  {
    id: "evidence-redaction",
    title: "Evidence Redaction",
    tagline: "Auto-redact faces, plates, and PII from disclosure releases.",
    description:
      "Vision pipeline detects faces, license plates, screen text, and document text frame-by-frame. Reviewer approves the proposed redactions and the chain of custody is updated automatically.",
    icon: "shield",
    category: "Analysis",
    status: "experimental",
    requires: ["genai.vision.redact", "objects.evidence"],
    component: EvidenceRedactionUseCase,
  },
  {
    id: "multilingual-interview",
    title: "Multilingual Interview",
    tagline: "Live bilingual transcript + structured English statement.",
    description:
      "Transcribes the source language, translates to English in parallel, and drafts a structured statement an officer can post to the file after review.",
    icon: "mail",
    category: "Translation",
    status: "experimental",
    requires: ["genai.translate.nllb", "genai.bodycam.transcribe"],
    component: MultilingualInterviewUseCase,
  },
  {
    id: "link-analysis",
    title: "Investigative Link Analysis",
    tagline: "Visualise the entity graph behind a complex investigation.",
    description:
      "Air-gapped LLM agent constructs a network of people, vehicles, addresses, accounts, phones, and prior cases — every edge cited back to the source record.",
    icon: "occurrence",
    category: "Analysis",
    status: "experimental",
    requires: ["agent.link.airgapped", "vector.cases"],
    component: LinkAnalysisUseCase,
  },
  {
    id: "policy-chatbot",
    title: "Policy & Legal Reference",
    tagline: "RAG chatbot over TPS procedures, Charter, and Criminal Code.",
    description:
      "Ask plain-English questions about policy, statute, and case law. Every answer cites the underlying section. Read-only; no record output.",
    icon: "info",
    category: "Search & retrieval",
    status: "experimental",
    requires: ["genai.kb.policy", "vector.policy"],
    component: PolicyChatbotUseCase,
  },
  {
    id: "transcript-911",
    title: "911 Transcript Insights",
    tagline: "Privacy-preserving stats over historical 911 transcripts.",
    description:
      "Aggregates anonymized 911 transcripts to surface category, disposition, and response-time trends. AI-generated insight summary with reviewer gate before posting.",
    icon: "clock",
    category: "Analysis",
    status: "experimental",
    requires: ["genai.911.summary", "relational.calls911"],
    component: Transcript911UseCase,
  },
  {
    id: "shift-handover",
    title: "Shift Handover Summary",
    tagline: "Draft an end-of-shift brief from your session activity.",
    description:
      "Generates a structured handover note for the relieving officer. Pulls from your active occurrences, notes, and unresolved tasks. Every claim is cited; nothing is committed until you accept.",
    icon: "clock",
    category: "Drafting",
    status: "experimental",
    requires: ["genai.handover.write"],
    component: ShiftHandoverUseCase,
  },
  {
    id: "database-integration",
    title: "Database Integration (MCP)",
    tagline: "Federated query across TPS, MTO, CPIC, court, and intel.",
    description:
      "An agentic workflow that decomposes a plain-English question into multi-step tool calls across MCP-fronted databases. Every step is shown to the officer before it runs; the synthesised answer is grounded in per-step provenance.",
    icon: "settings",
    category: "Search & retrieval",
    status: "experimental",
    requires: ["agent.federation.mcp", "relational.federation"],
    component: DatabaseIntegrationUseCase,
  },
  {
    id: "document-redaction",
    title: "Document Redaction",
    tagline: "AI-assisted redaction of disclosure documents.",
    description:
      "Detects and classifies sensitive entities (PII, victim, juvenile, medical, informant) in witness statements, narratives, FOIA replies, and intel briefings. Officer reviews each detection; the redacted version is gated by human approval and chain-of-custody.",
    icon: "shield",
    category: "Analysis",
    status: "experimental",
    requires: ["genai.docs.redact", "relational.disclosure_log"],
    component: DocumentRedactionUseCase,
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
