/**
 * Simulated virtualization (KVM / Nutanix AHV) inventory.
 *
 * The portal exposes this on the "Infrastructure" panel so an operator
 * can see *which* VMs are backing each demo without pivoting to Prism
 * Central. In real mode this would proxy to the AHV REST API.
 */

import { simulateLatency } from "../latency";
import type {
  ServiceResponse,
  VirtualMachine,
  VirtualizationClient,
} from "../types";

const VMS: VirtualMachine[] = [
  { id: "vm-001", name: "tps-nai-llm-01", state: "running", vcpu: 32, memMiB: 196_608, ipv4: "10.42.7.21", cluster: "ai-prod-east", purpose: "LLM serving (llama-3.1-70b)" },
  { id: "vm-002", name: "tps-nai-asr-01", state: "running", vcpu: 16, memMiB: 65_536, ipv4: "10.42.7.22", cluster: "ai-prod-east", purpose: "Whisper-large-v3 ASR" },
  { id: "vm-003", name: "tps-nai-vision-01", state: "running", vcpu: 24, memMiB: 98_304, ipv4: "10.42.7.23", cluster: "ai-prod-east", purpose: "Vision redaction (SAM2 + YOLO-redact)" },
  { id: "vm-004", name: "tps-vector-01", state: "running", vcpu: 16, memMiB: 65_536, ipv4: "10.42.7.31", cluster: "data-prod-east", purpose: "Vector DB (pgvector / Milvus)" },
  { id: "vm-005", name: "tps-relational-01", state: "running", vcpu: 8, memMiB: 32_768, ipv4: "10.42.7.32", cluster: "data-prod-east", purpose: "PostgreSQL — case metadata" },
  { id: "vm-006", name: "tps-objstore-01", state: "running", vcpu: 8, memMiB: 32_768, ipv4: "10.42.7.41", cluster: "data-prod-east", purpose: "Object Storage gateway (Nutanix Objects)" },
  { id: "vm-007", name: "tps-portal-01", state: "running", vcpu: 4, memMiB: 8_192, ipv4: "10.42.7.51", cluster: "app-prod-east", purpose: "AISP Portal frontend" },
  { id: "vm-008", name: "tps-portal-02", state: "running", vcpu: 4, memMiB: 8_192, ipv4: "10.42.7.52", cluster: "app-prod-east", purpose: "AISP Portal frontend (HA pair)" },
  { id: "vm-009", name: "tps-nai-translate-01", state: "running", vcpu: 16, memMiB: 65_536, ipv4: "10.42.7.24", cluster: "ai-prod-east", purpose: "Translation (NLLB-200)" },
  { id: "vm-010", name: "tps-air-gap-runner", state: "stopped", vcpu: 16, memMiB: 65_536, cluster: "ai-secure-east", purpose: "Air-gapped link analysis runner (on-demand)" },
];

export const simulatedVirtualization: VirtualizationClient = {
  async list(): Promise<ServiceResponse<{ vms: VirtualMachine[] }>> {
    const latency = await simulateLatency("fast");
    return {
      data: { vms: VMS },
      provenance: {
        mode: "simulated",
        service: "virtualization",
        source: "fixture: ahv inventory",
        latencyMs: latency,
      },
    };
  },

  async status(id: string): Promise<ServiceResponse<VirtualMachine>> {
    const latency = await simulateLatency("instant");
    const vm = VMS.find((v) => v.id === id);
    if (!vm) throw new Error(`VM not found: ${id}`);
    return {
      data: vm,
      provenance: {
        mode: "simulated",
        service: "virtualization",
        source: `fixture: ahv ${id}`,
        latencyMs: latency,
      },
    };
  },
};
