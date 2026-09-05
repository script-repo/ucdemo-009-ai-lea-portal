import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppShell,
  ContextHeader,
  IconRail,
  type IconRailItem,
  SidePanel,
  NavGroup,
  NavItem,
  TopToolbar,
} from "@/components";
import { findUseCase, useCases } from "./useCases";

/**
 * The portal frame.
 *
 * Renders the icon rail, the side panel (whose contents change based on
 * the current route), the top toolbar, and the dark context header.
 * The active route renders inside an <Outlet>, which lets each use case
 * own its own workspace.
 */
export function PortalShell() {
  const location = useLocation();
  const navigate = useNavigate();

  const path = location.pathname;
  const isHome = path === "/" || path === "";
  const useCaseId = path.startsWith("/uc/") ? path.split("/")[2] : null;
  const activeUseCase = useCaseId ? findUseCase(useCaseId) : null;

  const railItems: IconRailItem[] = [
    {
      id: "menu",
      icon: "menu",
      label: "Menu",
    },
    {
      id: "home",
      icon: "home",
      label: "Home",
      active: isHome,
      onClick: () => navigate("/"),
    },
    {
      id: "active",
      icon: "list",
      label: "Active items",
    },
    {
      id: "history",
      icon: "clock",
      label: "History",
    },
    {
      id: "favourites",
      icon: "star",
      label: "Favourites",
    },
    {
      id: "messages",
      icon: "mail",
      label: "Messages",
    },
    {
      id: "ai",
      icon: "sparkles",
      label: "Generative AI",
      active: !isHome && Boolean(activeUseCase),
      onClick: () => navigate("/"),
    },
  ];

  const railFooter = (
    <>
      <button
        type="button"
        className="icon-rail__button"
        aria-label="Settings"
        title="Settings"
      >
        <span aria-hidden>
          {/* settings cog */}
          <svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.4.8a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.5a7 7 0 0 0-2 1.2l-2.4-.8-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-.8a7 7 0 0 0 2 1.2L10 21h4l.5-2.5a7 7 0 0 0 2-1.2l2.4.8 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z" />
          </svg>
        </span>
      </button>
    </>
  );

  const sidePanel = isHome ? (
    <SidePanel title="AISP">
      <NavGroup title="Assistant">
        <NavItem
          label="Generative AI"
          active
        />
        <NavItem label="What's new" />
      </NavGroup>
      <NavGroup title="Sections" defaultOpen>
        {useCases.map((uc) => (
          <NavItem
            key={uc.id}
            label={uc.title}
            muted={uc.status === "planned"}
            onClick={() => uc.component && navigate(`/uc/${uc.id}`)}
          />
        ))}
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
      <NavGroup title="Other AI features">
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
    </SidePanel>
  ) : null;

  const headerTitle = activeUseCase ? activeUseCase.title : "AISP";
  const headerSubtitle = activeUseCase ? activeUseCase.tagline : "AI Services Portal";

  return (
    <AppShell
      iconRail={<IconRail items={railItems} footer={railFooter} />}
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
        <Link to="/" style={{ marginLeft: 8, fontSize: 12, color: "var(--aisp-link)" }}>
          Home
        </Link>
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
        icon={activeUseCase?.icon ?? "sparkles"}
      />
      <Outlet />
    </AppShell>
  );
}
