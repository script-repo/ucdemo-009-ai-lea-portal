import { Link, useParams } from "react-router-dom";
import { Workspace } from "@/components";
import { findUseCase } from "./useCases";

/**
 * Renders the registered use-case component, or a friendly "planned"
 * placeholder if the slug exists in the registry but isn't built yet.
 */
export function UseCaseRoute() {
  const { id } = useParams<{ id: string }>();
  const uc = id ? findUseCase(id) : undefined;

  if (!uc) {
    return (
      <Workspace>
        <div style={{ padding: 40, textAlign: "center" }}>
          <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 500 }}>
            Unknown use case
          </h2>
          <p style={{ color: "var(--aisp-text-muted)" }}>
            No use case is registered under <code>{id}</code>.
          </p>
          <Link to="/" style={{ color: "var(--aisp-link)" }}>
            ← Back to portal home
          </Link>
        </div>
      </Workspace>
    );
  }

  if (!uc.component) {
    return (
      <Workspace>
        <div style={{ padding: 40, maxWidth: 560 }}>
          <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 500 }}>
            {uc.title}
          </h2>
          <p style={{ color: "var(--aisp-text-muted)" }}>{uc.description}</p>
          <p style={{ marginTop: 14, fontSize: "var(--font-size-sm)" }}>
            This use case is <strong>planned</strong>. Register a component on
            the use-case definition in <code>src/portal/useCases.ts</code> to
            light it up.
          </p>
          <Link to="/" style={{ color: "var(--aisp-link)" }}>
            ← Back to portal home
          </Link>
        </div>
      </Workspace>
    );
  }

  const Component = uc.component;
  return <Component />;
}
