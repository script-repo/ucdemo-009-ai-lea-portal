import { useState } from "react";
import {
  Badge,
  Button,
  FormField,
  FormGrid,
  Icon,
  Input,
  Section,
  Select,
  Workspace,
} from "@aisp/components";
import {
  clearInferenceSettings,
  defaultInferenceSettings,
  loadInferenceSettings,
  PROVIDER_META,
  saveInferenceSettings,
  testProvider,
  type InferenceProviderId,
  type InferenceSettings,
  type ProviderSettings,
} from "../backend/inference/settings";

/**
 * Operator configuration for generative inference.
 *
 * Behaviour matches the Legal AI portal: Nutanix Enterprise AI is
 * tried first, OpenRouter is the fallback, and credentials stay in
 * this browser. Visuals come from the AISP design system.
 */
const PROVIDERS: InferenceProviderId[] = ["nai", "openrouter"];

type TestStatus = { kind: "" | "pending" | "ok" | "error"; message: string };

export function ResourcesPanel() {
  const [settings, setSettings] = useState<InferenceSettings>(() => loadInferenceSettings());
  const [showKey, setShowKey] = useState<Record<InferenceProviderId, boolean>>({
    nai: false,
    openrouter: false,
  });
  const [testStatus, setTestStatus] = useState<Record<InferenceProviderId, TestStatus>>({
    nai: statusFromProvider(loadInferenceSettings().providers.nai),
    openrouter: statusFromProvider(loadInferenceSettings().providers.openrouter),
  });
  const [banner, setBanner] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [testing, setTesting] = useState<InferenceProviderId | null>(null);

  function updateProvider(id: InferenceProviderId, patch: Partial<ProviderSettings>) {
    setSettings((prev) => ({
      ...prev,
      providers: {
        ...prev.providers,
        [id]: { ...prev.providers[id], ...patch },
      },
    }));
  }

  async function onTest(id: InferenceProviderId) {
    const provider = settings.providers[id];
    if (!provider.apiKey.trim()) {
      setTestStatus((prev) => ({ ...prev, [id]: { kind: "error", message: "Enter an API key first." } }));
      return;
    }
    setTesting(id);
    setTestStatus((prev) => ({ ...prev, [id]: { kind: "pending", message: "Testing…" } }));
    const result = await testProvider(provider.baseUrl, provider.apiKey);
    if (result.ok) {
      const next: ProviderSettings = {
        ...provider,
        models: result.models,
        lastTestOk: true,
        lastTestedAt: new Date().toISOString(),
        model: result.models.includes(provider.model) ? provider.model : result.models[0] ?? "",
      };
      const saved = loadInferenceSettings();
      saved.providers[id] = { ...saved.providers[id], models: next.models, lastTestOk: true, lastTestedAt: next.lastTestedAt };
      saveInferenceSettings(saved);
      setSettings((prev) => ({ ...prev, providers: { ...prev.providers, [id]: next } }));
      setTestStatus((prev) => ({
        ...prev,
        [id]: { kind: "ok", message: `Connected — ${result.models.length} models found` },
      }));
    } else {
      const failed = loadInferenceSettings();
      failed.providers[id] = {
        ...failed.providers[id],
        lastTestOk: false,
        lastTestedAt: new Date().toISOString(),
      };
      saveInferenceSettings(failed);
      setTestStatus((prev) => ({ ...prev, [id]: { kind: "error", message: result.error } }));
    }
    setTesting(null);
  }

  function onSave() {
    saveInferenceSettings(settings);
    setBanner({ type: "ok", text: "Settings saved to this browser." });
    window.setTimeout(() => setBanner(null), 4000);
  }

  function onClear() {
    clearInferenceSettings();
    const fresh = defaultInferenceSettings();
    setSettings(fresh);
    setTestStatus({ nai: { kind: "", message: "" }, openrouter: { kind: "", message: "" } });
    setBanner({ type: "ok", text: "Saved settings cleared. Use cases will stay on simulated fixtures until you configure a provider." });
    window.setTimeout(() => setBanner(null), 4000);
  }

  return (
    <Workspace>
      <Section title="How inference is resolved">
        <p style={{ margin: "0 0 8px 0", fontSize: "var(--font-size-sm)" }}>
          Every use-case completion in <strong>real</strong> backend mode tries endpoints in a fixed order:
        </p>
        <ol style={{ margin: "0 0 8px 20px", padding: 0, fontSize: "var(--font-size-sm)" }}>
          <li>
            <strong>Nutanix Enterprise AI</strong> — tried first whenever it is enabled with a key and model.
          </li>
          <li>
            <strong>OpenRouter</strong> — used only if the primary endpoint fails or is not configured.
          </li>
        </ol>
        <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--aisp-text-muted)" }}>
          Keys, endpoints, and selected models are stored only in this browser. They are never written to
          Kubernetes or the portal image. Switch the portal to real mode on Infrastructure after saving.
        </p>
        {banner && (
          <div
            role="status"
            style={{
              marginTop: 10,
              padding: 8,
              border: "1px solid var(--aisp-border)",
              background: "var(--aisp-muted-bg)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            <Icon name={banner.type === "ok" ? "check" : "alert"} size={12} /> {banner.text}
          </div>
        )}
      </Section>

      {PROVIDERS.map((id) => (
        <ProviderCard
          key={id}
          id={id}
          provider={settings.providers[id]}
          showKey={showKey[id]}
          testStatus={testStatus[id]}
          testing={testing === id}
          onToggleKey={() => setShowKey((prev) => ({ ...prev, [id]: !prev[id] }))}
          onChange={(patch) => updateProvider(id, patch)}
          onTest={() => void onTest(id)}
        />
      ))}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button variant="primary" onClick={onSave} leadingIcon={<Icon name="save" size={14} />}>
          Save settings
        </Button>
        <Button variant="outline" onClick={onClear}>
          Clear saved settings
        </Button>
      </div>
    </Workspace>
  );
}

function statusFromProvider(p: ProviderSettings): TestStatus {
  if (p.lastTestOk === true) {
    return { kind: "ok", message: `Last test succeeded (${p.models.length} models)` };
  }
  if (p.lastTestOk === false) {
    return { kind: "error", message: "Last test failed" };
  }
  return { kind: "", message: "" };
}

function ProviderCard({
  id,
  provider,
  showKey,
  testStatus,
  testing,
  onToggleKey,
  onChange,
  onTest,
}: {
  id: InferenceProviderId;
  provider: ProviderSettings;
  showKey: boolean;
  testStatus: TestStatus;
  testing: boolean;
  onToggleKey: () => void;
  onChange: (patch: Partial<ProviderSettings>) => void;
  onTest: () => void;
}) {
  const meta = PROVIDER_META[id];
  const modelOptions = provider.models;

  return (
    <Section
      title={meta.label}
      meta={
        <Badge variant={meta.priority === 1 ? "ai" : "default"}>
          {meta.priority} · {meta.priorityLabel}
        </Badge>
      }
      trailing={
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: "var(--font-size-sm)",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={provider.enabled}
            onChange={(e) => onChange({ enabled: e.target.checked })}
          />
          Enable
        </label>
      }
    >
      <p style={{ margin: "0 0 12px 0", fontSize: "var(--font-size-sm)", color: "var(--aisp-text-muted)" }}>
        {meta.hint}
      </p>
      <FormGrid columns={2}>
        <FormField label="Base URL" htmlFor={`${id}-base-url`} span="full">
          <Input
            id={`${id}-base-url`}
            value={provider.baseUrl}
            placeholder={meta.defaultBaseUrl}
            autoComplete="off"
            onChange={(e) => onChange({ baseUrl: e.target.value })}
          />
        </FormField>
        <FormField label="API key" htmlFor={`${id}-api-key`} span="full">
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <Input
              id={`${id}-api-key`}
              type={showKey ? "text" : "password"}
              value={provider.apiKey}
              placeholder={`Paste your ${meta.label} API key`}
              autoComplete="off"
              onChange={(e) => onChange({ apiKey: e.target.value })}
              style={{ flex: 1 }}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleKey}
              aria-label={showKey ? "Hide API key" : "Show API key"}
            >
              <Icon name={showKey ? "shield" : "key"} size={14} />
            </Button>
          </div>
        </FormField>
        <FormField label="Model" htmlFor={`${id}-model`} span="full" help={
          modelOptions.length === 0 ? "Test the connection to load available models." : undefined
        }>
          <Select
            id={`${id}-model`}
            disabled={modelOptions.length === 0}
            value={provider.model}
            onChange={(e) => onChange({ model: e.target.value })}
          >
            {modelOptions.length === 0 ? (
              <option value="">Test the connection to load available models…</option>
            ) : (
              modelOptions.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))
            )}
          </Select>
        </FormField>
      </FormGrid>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
        <Button variant="outline" size="sm" disabled={testing} onClick={onTest}>
          {testing ? "Testing…" : "Test connection"}
        </Button>
        {testStatus.message && (
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              color:
                testStatus.kind === "error"
                  ? "var(--aisp-danger, var(--aisp-text-muted))"
                  : "var(--aisp-text-muted)",
            }}
          >
            {testStatus.message}
          </span>
        )}
      </div>
    </Section>
  );
}
