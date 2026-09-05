import { HashRouter, Route, Routes } from "react-router-dom";
import { PortalShell } from "./portal/PortalShell";
import { PortalHome } from "./portal/PortalHome";
import { UseCaseRoute } from "./portal/UseCaseRoute";

/**
 * Hash routing keeps this demo working when served from `file://` or
 * any static host without server-side rewrites. Swap to BrowserRouter
 * once the portal is deployed behind a real web server.
 */
export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<PortalShell />}>
          <Route path="/" element={<PortalHome />} />
          <Route path="/uc/:id" element={<UseCaseRoute />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
