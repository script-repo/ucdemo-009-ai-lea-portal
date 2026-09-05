import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Icon,
  Section,
  StatusDot,
  Workspace,
} from "@aisp/components";
import {
  type BackendMode,
  getBackendMode,
  setBackendMode,
  subscribeBackendMode,
  useBackend,
} from "../backend";
import type { K8sWorkload, VirtualMachine } from "../backend";

/**
 * Operator-facing infrastructure inspector.
 *
 * Two responsibilities:
 *
 * 1. Display the current backend mode (simulated / real) and let a
 *    privileged operator flip it. The mode persists in localStorage
 *    and propagates to every `useBackend()` consumer in the app.
 *
 * 2. Show a live inventory of the VMs and Kubernetes workloads that
 *    back each use case — so it is obvious which AI service is
 *    serving traffic and where it lives.
 *
 * Composition only — every visual primitive comes from the design
 * system. No new tokens or pixel constants live here.
 */
export function InfrastructurePanel() {
  const navigate = useNavigate();
  const backend = useBackend();
  const [mode, setMode] = useState<BackendMode>(() => getBackendMode());
  const [vms, setVms] = useState<VirtualMachine[]>([]);
  const [workloads, setWorkloads] = useState<K8sWorkload[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => subscribeBackendMode(setMode), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLastError(null);
    (async () => {
      try {
        const [vmRes, wlRes] = await Promise.all([
          backend.virtualization.list(),
          backend.kubernetes.listWorkloads(),
        ]);
        if (cancelled) return;
        setVms(vmRes.data.vms);
        setWorkloads(wlRes.data.workloads);
      } catch (e) {
        if (cancelled) return;
        setLastError((e as Error).message);
        setVms([]);
        setWorkloads([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [backend, mode]);

  function flipMode() {
    setBackendMode(mode === "simulated" ? "real" : "simulated");
  }

  return (
    <Workspace>
      <Section
        title="Backend mode"
        meta={<ModeBadge mode={mode} />}
        trailing={
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outline" size="sm" onClick={() => navigate("/resources")}>
              Inference keys
            </Button>
            <Button variant="ai" size="sm" onClick={flipMode}>
              {mode === "simulated" ? "Switch to real" : "Switch to simulated"}
            </Button>
          </div>
        }
      >
        <p style={{ margin: "0 0 8px 0", fontSize: "var(--font-size-sm)" }}>
          <strong>Real</strong> mode sends chat completions to Nutanix
          Enterprise AI (then OpenRouter). Case files, 911 stats, RAG
          indexes, VMs, and Kubernetes stay on in-browser fixtures unless
          those endpoints are configured separately.
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "var(--font-size-xs)",
            color: "var(--aisp-text-muted)",
          }}
        >
          Save keys on{" "}
          <a href="#/resources" style={{ color: "var(--aisp-link)" }}>Resources</a>
          {" "}before switching. Test Connection must succeed and a model must
          be selected.
        </p>
        {lastError && (
          <div
            style={{
              marginTop: 10,
              padding: 8,
              border: "1px solid var(--aisp-border)",
              background: "var(--aisp-muted-bg)",
              fontSize: "var(--font-size-xs)",
              fontFamily: "var(--font-mono)",
              color: "var(--aisp-text-muted)",
            }}
          >
            <Icon name="alert" size={12} /> {lastError}
          </div>
        )}
      </Section>

      <Section title="Backing services" count={6}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
          <ServiceCard label="Inference" detail="LLM · ASR · Vision · Translate" model="llama-3.1-70b · whisper · NLLB-200" />
          <ServiceCard label="Vector" detail="RAG retrieval" model="pgvector / Milvus" />
          <ServiceCard label="Relational" detail="Case metadata, 911 stats" model="PostgreSQL 16" />
          <ServiceCard label="Object storage" detail="Video, audio, documents" model="Nutanix Objects" />
          <ServiceCard label="Virtualization" detail="VM hosting" model="Nutanix AHV" />
          <ServiceCard label="Kubernetes" detail="Workload orchestration" model="Nutanix Kubernetes Engine" />
        </div>
      </Section>

      <Section title="Virtual machines" count={vms.length} meta={loading ? "loading…" : undefined}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {vms.map((vm) => (
            <VmRow key={vm.id} vm={vm} />
          ))}
          {!loading && vms.length === 0 && (
            <div style={{ padding: 8, fontSize: "var(--font-size-sm)", color: "var(--aisp-text-muted)" }}>
              No VMs reported.
            </div>
          )}
        </div>
      </Section>

      <Section title="Kubernetes workloads" count={workloads.length} meta={loading ? "loading…" : undefined}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {workloads.map((wl) => (
            <WorkloadRow key={`${wl.namespace}/${wl.name}`} wl={wl} />
          ))}
          {!loading && workloads.length === 0 && (
            <div style={{ padding: 8, fontSize: "var(--font-size-sm)", color: "var(--aisp-text-muted)" }}>
              No workloads reported.
            </div>
          )}
        </div>
      </Section>
    </Workspace>
  );
}

function ModeBadge({ mode }: { mode: BackendMode }) {
  if (mode === "simulated") return <Badge variant="warning">Simulated</Badge>;
  return <Badge variant="ok">Real</Badge>;
}

function ServiceCard({ label, detail, model }: { label: string; detail: string; model: string }) {
  return (
    <div
      style={{
        padding: 10,
        border: "1px solid var(--aisp-border)",
        background: "#ffffff",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: "var(--font-size-base)" }}>{label}</div>
      <div style={{ fontSize: "var(--font-size-sm)", color: "var(--aisp-text-muted)" }}>
        {detail}
      </div>
      <div
        style={{
          marginTop: 6,
          fontFamily: "var(--font-mono)",
          fontSize: "var(--font-size-xs)",
          color: "var(--aisp-text-muted)",
        }}
      >
        {model}
      </div>
    </div>
  );
}

function VmRow({ vm }: { vm: VirtualMachine }) {
  const statusVariant =
    vm.state === "running" ? "ok" : vm.state === "stopped" ? "muted" : vm.state === "paused" ? "warning" : "error";
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "20px 220px 80px 1fr 130px",
        gap: 8,
        alignItems: "center",
        padding: "6px 8px",
        borderBottom: "1px solid var(--aisp-border-soft)",
        fontSize: "var(--font-size-sm)",
      }}
    >
      <StatusDot variant={statusVariant} />
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--font-size-xs)" }}>{vm.name}</span>
      <span style={{ color: "var(--aisp-text-muted)" }}>{vm.state}</span>
      <span style={{ minWidth: 0, color: "var(--aisp-text-muted)" }}>{vm.purpose ?? "—"}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--font-size-xs)", color: "var(--aisp-text-muted)" }}>
        {vm.vcpu} vCPU · {Math.round(vm.memMiB / 1024)} GiB
      </span>
    </div>
  );
}

function WorkloadRow({ wl }: { wl: K8sWorkload }) {
  const ratio = wl.desired === 0 ? 1 : wl.ready / wl.desired;
  const variant = ratio === 1 ? "ok" : ratio === 0 ? "muted" : "warning";
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "20px 200px 80px 80px 1fr",
        gap: 8,
        alignItems: "center",
        padding: "6px 8px",
        borderBottom: "1px solid var(--aisp-border-soft)",
        fontSize: "var(--font-size-sm)",
      }}
    >
      <StatusDot variant={variant} />
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--font-size-xs)" }}>
        {wl.namespace}/{wl.name}
      </span>
      <span style={{ color: "var(--aisp-text-muted)" }}>{wl.kind}</span>
      <span style={{ color: "var(--aisp-text-muted)" }}>
        {wl.ready}/{wl.desired}
      </span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--font-size-xs)", color: "var(--aisp-text-muted)" }}>
        {wl.image}
      </span>
    </div>
  );
}
