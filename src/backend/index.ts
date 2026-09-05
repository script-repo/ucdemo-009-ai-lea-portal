/**
 * AISP Backend client.
 *
 * One entry point for every UI component. Choose a mode (simulated /
 * real) and call methods on the returned `BackendClient`. The same
 * client instance reflects mode changes — listeners are notified when
 * the operator flips the toggle in the Infrastructure panel.
 *
 *   import { useBackend } from "../../backend";
 *
 *   function MyUseCase() {
 *     const backend = useBackend();
 *     async function ask() {
 *       const r = await backend.inference.complete({ prompt: "…" });
 *       console.log(r.data.text, r.provenance);
 *     }
 *   }
 */

import { useEffect, useState } from "react";
import { getBackendMode, getRealEndpoints, subscribeBackendMode } from "./config";
import type { BackendClient, BackendMode, InferenceClient } from "./types";

import { simulatedInference } from "./inference/simulated";
import { realInference } from "./inference/real";
import { simulatedVector } from "./vector/simulated";
import { realVector } from "./vector/real";
import { simulatedRelational } from "./relational/simulated";
import { realRelational } from "./relational/real";
import { simulatedObjectStorage } from "./object-storage/simulated";
import { realObjectStorage } from "./object-storage/real";
import { simulatedVirtualization } from "./virtualization/simulated";
import { realVirtualization } from "./virtualization/real";
import { simulatedKubernetes } from "./kubernetes/simulated";
import { realKubernetes } from "./kubernetes/real";

function hybridInference(): InferenceClient {
  const extra = getRealEndpoints().inferenceBaseUrl;
  return {
    complete: (req) => realInference.complete(req),
    embed: (req) => (extra ? realInference.embed(req) : simulatedInference.embed(req)),
    transcribe: (req) =>
      extra ? realInference.transcribe(req) : simulatedInference.transcribe(req),
    redactVideo: (req) =>
      extra ? realInference.redactVideo(req) : simulatedInference.redactVideo(req),
  };
}

function buildClient(mode: BackendMode): BackendClient {
  if (mode === "real") {
    const ep = getRealEndpoints();
    return {
      mode,
      inference: hybridInference(),
      vector: ep.vectorBaseUrl ? realVector : simulatedVector,
      relational: ep.relationalBaseUrl ? realRelational : simulatedRelational,
      objectStorage: ep.objectStorageBaseUrl ? realObjectStorage : simulatedObjectStorage,
      virtualization: ep.virtualizationBaseUrl ? realVirtualization : simulatedVirtualization,
      kubernetes: ep.kubernetesBaseUrl ? realKubernetes : simulatedKubernetes,
    };
  }
  return {
    mode,
    inference: simulatedInference,
    vector: simulatedVector,
    relational: simulatedRelational,
    objectStorage: simulatedObjectStorage,
    virtualization: simulatedVirtualization,
    kubernetes: simulatedKubernetes,
  };
}

export function getBackend(): BackendClient {
  return buildClient(getBackendMode());
}

/**
 * React hook — returns a backend client and re-renders when the mode
 * toggle flips. Use this in any component that talks to the backend.
 */
export function useBackend(): BackendClient {
  const [mode, setMode] = useState<BackendMode>(() => getBackendMode());
  useEffect(() => subscribeBackendMode(setMode), []);
  return buildClient(mode);
}

export type { BackendClient, BackendMode } from "./types";
export {
  getBackendMode,
  setBackendMode,
  subscribeBackendMode,
  getRealEndpoints,
} from "./config";
export {
  clearInferenceSettings,
  configuredProviders,
  defaultInferenceSettings,
  loadInferenceSettings,
  saveInferenceSettings,
  subscribeInferenceSettings,
  testProvider,
} from "./inference/settings";
export type {
  InferenceProviderId,
  InferenceSettings,
  ProviderSettings,
} from "./inference/settings";
export type {
  CompletionRequest,
  CompletionResult,
  EmbeddingRequest,
  EmbeddingResult,
  GroundedPassage,
  K8sWorkload,
  ObjectMeta,
  ProvenanceTag,
  ServiceResponse,
  TranscriptSegment,
  TranscriptionRequest,
  TranscriptionResult,
  VectorMatch,
  VectorQueryRequest,
  VectorQueryResult,
  VirtualMachine,
  VisionRedactionCategory,
  VisionRedactionDetection,
  VisionRedactionRequest,
  VisionRedactionResult,
} from "./types";

// Domain fixtures re-exported so use-case components can render
// citation lists, network nodes, etc., consistent with what the
// simulated backend has already returned.
export { BODY_CAM_CLIPS, findBodyCamClip } from "./fixtures/bodyCam";
export { EVIDENCE_ITEMS, EVIDENCE_CASE_ID } from "./fixtures/evidence";
export type { EvidenceItem, EvidenceMediaType } from "./fixtures/evidence";
export { POLICY_SNIPPETS } from "./fixtures/policies";
export type { PolicySnippet } from "./fixtures/policies";
export { INTERVIEWS } from "./fixtures/interviews";
export type { InterviewClip } from "./fixtures/interviews";
export { INVESTIGATIVE_GRAPH } from "./fixtures/network";
export type { NetworkNode, NetworkEdge, EntityKind } from "./fixtures/network";
export { CALLS_911, CALLS_911_DATE_RANGE, TPS_DIVISIONS } from "./fixtures/calls911";
export type { Call911, CallCategory, CallDisposition, TPSDivision } from "./fixtures/calls911";
export {
  HANDOVER_SOURCES,
  HANDOVER_OCCURRENCES,
  HANDOVER_NOTES,
  HANDOVER_TASKS,
  HANDOVER_RADIO,
  HANDOVER_CITATIONS,
  HANDOVER_NARRATIVE,
} from "./fixtures/shiftHandover";
export type {
  HandoverSource,
  HandoverCitation,
  HandoverOccurrence,
  OutstandingTask,
  RadioEntry,
  OfficerNote,
} from "./fixtures/shiftHandover";
export {
  MCP_SERVERS,
  CANNED_PLANS,
  TPS_PERSONS,
  TPS_OCCURRENCES,
  MTO_VEHICLES,
  MTO_DRIVERS,
  CPIC_SUBJECTS,
  COURT_PROCEEDINGS,
  VICTIM_SERVICES_FILES,
  ICES_FLAGS,
  INTEL_SUBJECTS,
} from "./fixtures/mcpFederation";
export type {
  MCPServer,
  MCPServerStatus,
  MCPAuthMode,
  CannedPlan,
  PlanStep,
  TPSPerson,
  TPSOccurrence,
  MTOVehicle,
  MTODriver,
  CPICSubject,
  CourtProceeding,
  VictimServicesFile,
  ICESFlag,
  IntelSubject,
} from "./fixtures/mcpFederation";
export {
  REDACTION_DOCUMENTS,
  findRedactionDocument,
} from "./fixtures/documents";
export type {
  RedactionDocument,
  DocSegment,
  DocEntity,
  DetectionSubtype,
} from "./fixtures/documents";
