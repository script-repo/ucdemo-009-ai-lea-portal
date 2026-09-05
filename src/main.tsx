import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Pull the entire design-system stylesheet from the submodule.
// One side-effect import wires up tokens, layout, primitives, AI patterns,
// and the mobile overrides. Do NOT add a second stylesheet that overrides
// these classes — propose changes in aisp-design-system instead.
import "@aisp/styles";

import { App } from "./App";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container #root not found in index.html");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
