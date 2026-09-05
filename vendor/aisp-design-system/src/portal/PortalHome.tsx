import { useNavigate } from "react-router-dom";
import {
  Badge,
  Icon,
  QuickLink,
  QuickLinks,
  SearchStrip,
  Section,
  Workspace,
} from "@/components";
import { groupByCategory, type UseCaseDefinition } from "./useCases";

/**
 * Portal launcher home.
 *
 * Lists every registered AI use case as a launchable card, grouped by
 * category. Intentionally re-uses the existing search strip + quick-link
 * patterns so officers feel they are still inside AISP, just with
 * an AI panel attached.
 */
export function PortalHome() {
  const navigate = useNavigate();
  const grouped = groupByCategory();

  return (
    <Workspace>
      <SearchStrip
        types={[
          { value: "ai", label: "Ask AI" },
          { value: "person", label: "Person" },
          { value: "occurrence", label: "Occurrence" },
          { value: "address", label: "Address" },
        ]}
        placeholder="Describe what you need help with…"
      />

      <Section title="Features" count={Object.values(grouped).flat().length}>
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: 600,
                color: "var(--aisp-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                margin: "4px 0 6px",
              }}
            >
              {category}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 12,
              }}
            >
              {items.map((uc) => (
                <UseCaseCard
                  key={uc.id}
                  useCase={uc}
                  onOpen={() => navigate(`/uc/${uc.id}`)}
                />
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section title="Quick links" count={4}>
        <QuickLinks>
          <QuickLink
            icon="document"
            label="View design system spec"
            href="https://localhost"
          />
          <QuickLink
            icon="folder"
            label="Recent occurrences"
            onClick={() => undefined}
          />
          <QuickLink
            icon="user"
            label="My active assignments (3)"
            onClick={() => undefined}
          />
          <QuickLink
            icon="info"
            label={"What is \u2018not evidence\u2019 mode?"}
            onClick={() => undefined}
          />
        </QuickLinks>
      </Section>
    </Workspace>
  );
}

function UseCaseCard({
  useCase,
  onOpen,
}: {
  useCase: UseCaseDefinition;
  onOpen: () => void;
}) {
  const launchable = useCase.status !== "planned" && Boolean(useCase.component);

  return (
    <button
      type="button"
      onClick={launchable ? onOpen : undefined}
      disabled={!launchable}
      style={{
        textAlign: "left",
        border: "1px solid var(--aisp-border)",
        background: launchable ? "#ffffff" : "var(--aisp-muted-bg)",
        padding: 12,
        display: "grid",
        gridTemplateColumns: "32px 1fr",
        gap: 10,
        cursor: launchable ? "pointer" : "not-allowed",
        opacity: launchable ? 1 : 0.78,
        font: "inherit",
        color: "inherit",
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          border: "1px solid var(--aisp-border)",
          color: "var(--ai-accent)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={useCase.icon} size={18} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 4,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: "var(--font-size-base)" }}>
            {useCase.title}
          </span>
          <StatusBadge status={useCase.status} />
        </div>
        <div
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--aisp-text-muted)",
            lineHeight: 1.35,
          }}
        >
          {useCase.tagline}
        </div>
        {useCase.requires && useCase.requires.length > 0 && (
          <div
            style={{
              marginTop: 6,
              fontSize: "var(--font-size-xs)",
              color: "var(--aisp-text-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            requires: {useCase.requires.join(", ")}
          </div>
        )}
      </div>
    </button>
  );
}

function StatusBadge({ status }: { status: UseCaseDefinition["status"] }) {
  switch (status) {
    case "stable":
      return <Badge variant="ok">Stable</Badge>;
    case "beta":
      return <Badge variant="ai">Beta</Badge>;
    case "experimental":
      return <Badge variant="warning">Experimental</Badge>;
    case "planned":
      return <Badge>Planned</Badge>;
  }
}
