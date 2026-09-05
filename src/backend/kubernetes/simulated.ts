/**
 * Simulated Kubernetes inventory.
 *
 * Reflects the workloads that would be running on a Nutanix Kubernetes
 * Engine cluster behind the portal — model serving, redaction workers,
 * the link-analysis agent, and so on.
 */

import { simulateLatency } from "../latency";
import type {
  K8sWorkload,
  KubernetesClient,
  ServiceResponse,
} from "../types";

const NAMESPACES = ["aisp-portal", "aisp-inference", "aisp-data", "aisp-agents"];

const WORKLOADS: K8sWorkload[] = [
  { namespace: "aisp-portal", name: "portal-frontend", kind: "Deployment", ready: 2, desired: 2, image: "registry.tps.local/aisp-portal:0.4.1" },
  { namespace: "aisp-portal", name: "auth-gateway", kind: "Deployment", ready: 3, desired: 3, image: "registry.tps.local/auth-gateway:1.7.2" },

  { namespace: "aisp-inference", name: "llm-serving", kind: "StatefulSet", ready: 4, desired: 4, image: "registry.tps.local/llm-server:1.6.0", useCaseId: "evidence-intel" },
  { namespace: "aisp-inference", name: "asr-serving", kind: "Deployment", ready: 2, desired: 2, image: "registry.tps.local/whisper-server:0.9.4", useCaseId: "body-cam-report" },
  { namespace: "aisp-inference", name: "translate-serving", kind: "Deployment", ready: 2, desired: 2, image: "registry.tps.local/nllb200-server:0.4.0", useCaseId: "multilingual-interview" },
  { namespace: "aisp-inference", name: "vision-redact", kind: "Deployment", ready: 3, desired: 3, image: "registry.tps.local/redact-vision:0.8.1", useCaseId: "evidence-redaction" },

  { namespace: "aisp-data", name: "vector-db", kind: "StatefulSet", ready: 3, desired: 3, image: "registry.tps.local/pgvector:16.2", useCaseId: "policy-chatbot" },
  { namespace: "aisp-data", name: "postgres", kind: "StatefulSet", ready: 1, desired: 1, image: "registry.tps.local/postgres:16.2" },
  { namespace: "aisp-data", name: "object-gateway", kind: "Deployment", ready: 2, desired: 2, image: "registry.tps.local/objects-gateway:2.1.0" },

  { namespace: "aisp-agents", name: "link-analysis-agent", kind: "Deployment", ready: 1, desired: 1, image: "registry.tps.local/link-agent:0.3.2", useCaseId: "link-analysis" },
  { namespace: "aisp-agents", name: "redaction-worker", kind: "Job", ready: 0, desired: 1, image: "registry.tps.local/redact-worker:0.8.1", useCaseId: "evidence-redaction" },
  { namespace: "aisp-agents", name: "transcript-summarizer", kind: "CronJob", ready: 0, desired: 1, image: "registry.tps.local/summarizer:0.5.0", useCaseId: "transcript-911" },
];

export const simulatedKubernetes: KubernetesClient = {
  async listWorkloads(namespace?: string): Promise<ServiceResponse<{ workloads: K8sWorkload[] }>> {
    const latency = await simulateLatency("fast");
    const rows = namespace ? WORKLOADS.filter((w) => w.namespace === namespace) : WORKLOADS;
    return {
      data: { workloads: rows },
      provenance: {
        mode: "simulated",
        service: "kubernetes",
        source: `fixture: nke ${namespace ?? "<all>"}`,
        latencyMs: latency,
      },
    };
  },

  async listNamespaces() {
    const latency = await simulateLatency("instant");
    return {
      data: { namespaces: NAMESPACES },
      provenance: {
        mode: "simulated",
        service: "kubernetes",
        source: "fixture: nke meta",
        latencyMs: latency,
      },
    };
  },
};
