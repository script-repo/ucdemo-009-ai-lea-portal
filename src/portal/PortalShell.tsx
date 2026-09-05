import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppShell,
  ContextHeader,
  IconRail,
  type IconRailItem,
  NavGroup,
  NavItem,
  SidePanel,
  TopToolbar,
} from "@aisp/components";
import { findUseCase, useCases } from "./useCases";
import { BackendModeRibbon } from "./BackendModeRibbon";

/**
 * Portal frame for the application.
 *
 * Composes design-system primitives (AppShell, IconRail, SidePanel,
 * TopToolbar, ContextHeader). All visual decisions live in the
 * design system; this file only decides *what* to show.
 */
export function PortalShell() {
  const location = useLocation();
  const navigate = useNavigate();

  const path = location.pathname;
  const isHome = path === "/" || path === "";
  const isInfra = path === "/infrastructure";
  const isResources = path === "/resources";
  const useCaseId = path.startsWith("/uc/") ? path.split("/")[2] : null;
  const activeUseCase = useCaseId ? findUseCase(useCaseId) : null;

  const railItems: IconRailItem[] = [
    { id: "menu", icon: "menu", label: "Menu" },
    {
      id: "home",
      icon: "home",
      label: "Home",
      active: isHome,
      onClick: () => navigate("/"),
    },
    { id: "active", icon: "list", label: "Active items" },
    { id: "history", icon: "clock", label: "History" },
    { id: "favourites", icon: "star", label: "Favourites" },
    { id: "messages", icon: "mail", label: "Messages" },
    {
      id: "ai",
      icon: "sparkles",
      label: "AI Services",
      active: !isHome && !isInfra && !isResources && Boolean(activeUseCase),
      onClick: () => navigate("/"),
    },
    {
      id: "resources",
      icon: "key",
      label: "Resources",
      active: isResources,
      onClick: () => navigate("/resources"),
    },
    {
      id: "infra",
      icon: "settings",
      label: "Infrastructure",
      active: isInfra,
      onClick: () => navigate("/infrastructure"),
    },
  ];

  const sidePanel = isResources ? (
    <SidePanel title="Resources">
      <NavGroup title="Inference">
        <NavItem label="Nutanix Enterprise AI" active />
        <NavItem label="OpenRouter fallback" />
      </NavGroup>
      <NavGroup title="Operator">
        <NavItem label="Infrastructure" onClick={() => navigate("/infrastructure")} />
      </NavGroup>
      <NavGroup title="Services">
        {useCases.map((uc) => (
          <NavItem
            key={uc.id}
            label={uc.title}
            muted={uc.status === "planned"}
            onClick={() => uc.component && navigate(`/uc/${uc.id}`)}
          />
        ))}
      </NavGroup>
    </SidePanel>
  ) : isInfra ? (
    <SidePanel title="Infrastructure">
      <NavGroup title="Operator">
        <NavItem label="Mode + services" active />
        <NavItem label="Inference resources" onClick={() => navigate("/resources")} />
        <NavItem label="VMs" />
        <NavItem label="Kubernetes workloads" />
      </NavGroup>
      <NavGroup title="Other services">
        {useCases.map((uc) => (
          <NavItem
            key={uc.id}
            label={uc.title}
            muted={uc.status === "planned"}
            onClick={() => uc.component && navigate(`/uc/${uc.id}`)}
          />
        ))}
      </NavGroup>
    </SidePanel>
  ) : isHome ? (
    <SidePanel title="AISP">
      <NavGroup title="Services">
        {useCases.map((uc) => (
          <NavItem
            key={uc.id}
            label={uc.title}
            muted={uc.status === "planned"}
            onClick={() => uc.component && navigate(`/uc/${uc.id}`)}
          />
        ))}
      </NavGroup>
      <NavGroup title="Operator" defaultOpen={false}>
        <NavItem label="Resources" onClick={() => navigate("/resources")} />
        <NavItem label="Infrastructure" onClick={() => navigate("/infrastructure")} />
      </NavGroup>
      <NavGroup title="Favourite searches" defaultOpen={false}>
        <NavItem label="Open occurrences (mine)" muted />
        <NavItem label="Last 7 days — vehicle" muted />
      </NavGroup>
    </SidePanel>
  ) : activeUseCase ? (
    <SidePanel title={activeUseCase.title} variant="ai">
      <NavGroup title="This session">
        <NavItem label="Conversation" active />
        <NavItem label="Sources in scope" />
        <NavItem label="Audit trail" />
      </NavGroup>
      <NavGroup title="Other services">
        {useCases
          .filter((uc) => uc.id !== activeUseCase.id)
          .map((uc) => (
            <NavItem
              key={uc.id}
              label={uc.title}
              muted={uc.status === "planned"}
              onClick={() => uc.component && navigate(`/uc/${uc.id}`)}
            />
          ))}
      </NavGroup>
      <NavGroup title="Operator" defaultOpen={false}>
        <NavItem label="Resources" onClick={() => navigate("/resources")} />
        <NavItem label="Infrastructure" onClick={() => navigate("/infrastructure")} />
      </NavGroup>
    </SidePanel>
  ) : null;

  const headerTitle = isResources
    ? "Resources"
    : isInfra
      ? "Infrastructure"
      : activeUseCase
        ? activeUseCase.title
        : "AISP";
  const headerSubtitle = isResources
    ? "Nutanix Enterprise AI first, OpenRouter fallback"
    : isInfra
      ? "Backend mode, services, VMs, Kubernetes workloads"
      : activeUseCase
        ? activeUseCase.tagline
        : "AI Services Portal";
  const headerIcon = isResources
    ? "key"
    : isInfra
      ? "settings"
      : activeUseCase?.icon ?? "sparkles";

  return (
    <AppShell
      iconRail={<IconRail items={railItems} />}
      sidePanel={sidePanel}
    >
      <TopToolbar
        leftActions={[
          { id: "back", icon: "back", label: "Back", onClick: () => navigate(-1) },
          { id: "forward", icon: "forward", label: "Forward", onClick: () => navigate(1) },
        ]}
        rightActions={[
          { id: "print", icon: "print", label: "Print" },
          { id: "more", icon: "more", label: "More" },
        ]}
        user={{ name: "Officer J. Brand", role: "Patrol — Unit 14" }}
      >
        <Link
          to="/"
          style={{ marginLeft: 8, fontSize: 12, color: "var(--aisp-link)" }}
        >
          Home
        </Link>
        {isResources && (
          <>
            <span style={{ color: "var(--aisp-text-muted)" }}>›</span>
            <span style={{ fontSize: 12 }}>Resources</span>
          </>
        )}
        {isInfra && (
          <>
            <span style={{ color: "var(--aisp-text-muted)" }}>›</span>
            <span style={{ fontSize: 12 }}>Infrastructure</span>
          </>
        )}
        {activeUseCase && (
          <>
            <span style={{ color: "var(--aisp-text-muted)" }}>›</span>
            <span style={{ fontSize: 12 }}>{activeUseCase.title}</span>
          </>
        )}
      </TopToolbar>
      <ContextHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        icon={headerIcon}
      />
      <BackendModeRibbon />
      <Outlet />
    </AppShell>
  );
}
