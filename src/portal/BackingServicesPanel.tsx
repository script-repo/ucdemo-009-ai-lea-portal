import { Icon, type IconName, Section } from "@aisp/components";

/**
 * Per-use-case "Backing services" inspector.
 *
 * Surfaces, in the side rail, the concrete backend services + models /
 * indexes / buckets a use case talks to. This complements the global
 * `/infrastructure` panel by answering the more specific question:
 * "for *this* use case, what is being called when I press Generate?"
 *
 * Display rules:
 *   - One row per service. Icon comes from the `kind`.
 *   - The `name` is the model identifier, index name, bucket prefix, or
 *     table — i.e. what an operator would actually search for in the
 *     Nutanix infra console.
 *   - The optional `detail` is a short qualifier (e.g. "air-gapped",
 *     "production-order scoped"). Keep it short — single line.
 */

export type BackingServiceKind =
  | "llm"
  | "asr"
  | "vision"
  | "translation"
  | "embedding"
  | "vector"
  | "relational"
  | "object"
  | "kubernetes"
  | "vm";

export interface BackingService {
  kind: BackingServiceKind;
  /** Specific model / index / bucket / table name. */
  name: string;
  /** Optional short qualifier — air-gapped, prod-order-scoped, etc. */
  detail?: string;
}

const ICON_BY_KIND: Record<BackingServiceKind, IconName> = {
  llm: "sparkles",
  asr: "sparkles",
  vision: "sparkles",
  translation: "sparkles",
  embedding: "sparkles",
  vector: "filter",
  relational: "document",
  object: "folder",
  kubernetes: "settings",
  vm: "settings",
};

const LABEL_BY_KIND: Record<BackingServiceKind, string> = {
  llm: "LLM",
  asr: "ASR",
  vision: "Vision",
  translation: "Translation",
  embedding: "Embeddings",
  vector: "Vector DB",
  relational: "Relational DB",
  object: "Object storage",
  kubernetes: "Kubernetes",
  vm: "Virtualization",
};

export function BackingServicesPanel({ services }: { services: BackingService[] }) {
  return (
    <Section title="Backing services" count={services.length}>
      <div
        style={{
          fontSize: "var(--font-size-sm)",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {services.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
            <Icon name={ICON_BY_KIND[s.kind]} size={12} />
            <span>
              <span style={{ color: "var(--aisp-text-muted)" }}>{LABEL_BY_KIND[s.kind]} — </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--font-size-xs)" }}>
                {s.name}
              </span>
              {s.detail && (
                <span style={{ color: "var(--aisp-text-muted)" }}> · {s.detail}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}
