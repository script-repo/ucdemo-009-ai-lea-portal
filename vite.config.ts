import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * Two alias prefixes are configured:
 *
 *   @aisp/*  — the design-system surface this app imports from.
 *              Use this in your application code.
 *
 *   @/*      — passthrough for the design system's INTERNAL imports.
 *              The design-system source files use `@/components`, `@/icons`,
 *              etc.; this alias keeps them resolving when Vite walks into
 *              the submodule. DO NOT use `@/*` in application code — use
 *              relative imports (`./portal/PortalShell`) or `@aisp/*`.
 *
 * Application code uses relative imports for app-local files. That keeps
 * the boundary obvious: a `@aisp/*` import is always a design-system call;
 * a `./*` import is always app-local.
 */
const dsRoot = path.resolve(__dirname, "vendor/aisp-design-system/src");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@aisp\/styles$/,        replacement: path.join(dsRoot, "styles/index.css") },
      { find: /^@aisp\/styles\/(.*)$/,  replacement: path.join(dsRoot, "styles/$1") },
      { find: /^@aisp\/components$/,    replacement: path.join(dsRoot, "components") },
      { find: /^@aisp\/icons$/,         replacement: path.join(dsRoot, "icons") },
      { find: /^@aisp\/tokens$/,        replacement: path.join(dsRoot, "tokens") },

      // Design-system internal-import passthrough — last so it can't
      // accidentally intercept anything more specific.
      { find: /^@\/(.*)$/,              replacement: path.join(dsRoot, "$1") },
    ],
  },
  server: {
    port: 5174,
    host: true,
    proxy: {
      "/api/nai": {
        target: "https://nai.hpoc.nutanix.com",
        changeOrigin: true,
        secure: false,
        rewrite: (p: string) => p.replace(/^\/api\/nai/, "/api/v1"),
      },
      "/api/openrouter": {
        target: "https://openrouter.ai",
        changeOrigin: true,
        rewrite: (p: string) => p.replace(/^\/api\/openrouter/, "/api/v1"),
      },
    },
  },
});
