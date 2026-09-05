import { HashRouter, Route, Routes } from "react-router-dom";
import { PortalShell } from "./portal/PortalShell";
import { PortalHome } from "./portal/PortalHome";
import { UseCaseRoute } from "./portal/UseCaseRoute";
import { InfrastructurePanel } from "./portal/InfrastructurePanel";
import { ResourcesPanel } from "./portal/ResourcesPanel";

/**
 * Hash routing keeps the bundle deployable behind any static host.
 * Swap to BrowserRouter once you have a real server doing rewrites.
 */
export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<PortalShell />}>
          <Route path="/" element={<PortalHome />} />
          <Route path="/uc/:id" element={<UseCaseRoute />} />
          <Route path="/infrastructure" element={<InfrastructurePanel />} />
          <Route path="/resources" element={<ResourcesPanel />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
