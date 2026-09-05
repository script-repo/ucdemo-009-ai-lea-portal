/**
 * AISP Design System — Design Tokens (TypeScript)
 *
 * This file mirrors `src/styles/tokens.css`. Use these constants when you
 * need token values inside JS/TS logic (charts, canvas, third-party libs).
 * For styling, prefer the CSS variables — never hardcode hex values in
 * component code.
 *
 * If you change a value here, change `tokens.css` to match. The CSS file is
 * the runtime source of truth; this file is for code that cannot read CSS
 * custom properties.
 */

export const colors = {
  brand: {
    blue: "#1565b3",
    blueDark: "#0d4f91",
    blueLight: "#2f7ec8",
  },
  chrome: {
    charcoal: "#24262b",
    charcoal2: "#2f3137",
    topbarIcon: "#6b6f77",
  },
  surface: {
    bg: "#ffffff",
    panel: "#ffffff",
    section: "#f3f4f8",
    row: "#ffffff",
    muted: "#f7f8fb",
  },
  border: {
    default: "#d9dce3",
    soft: "#eceef3",
    dark: "#c5c9d3",
  },
  text: {
    default: "#2b2f36",
    muted: "#6c7280",
    light: "#ffffff",
    link: "#215f9c",
  },
  status: {
    ok: "#5a9f3b",
    warning: "#f1c232",
    error: "#c0392b",
    info: "#3f7fbf",
  },
  button: {
    primary: "#1268b3",
    primaryHover: "#0e5798",
    dark: "#333333",
    darkHover: "#222222",
    disabled: "#bfc4cc",
  },
  ai: {
    accent: "#5a4fb3",
    accentDark: "#423a8e",
    accentSoft: "#eeecf7",
    accentBorder: "#c8c3e3",
    panelBg: "#fafaff",
    promptBg: "#f7f7fb",
    citationBg: "#eef3fa",
    citationBorder: "#b6cbe3",
    redactionBg: "#2b2f36",
    redactionText: "#ffffff",
    reviewBg: "#fff8e1",
    reviewBorder: "#e6c75a",
    reviewText: "#7a5a00",
    draftBg: "#fdecec",
    draftBorder: "#e8a8a4",
    draftText: "#8a2a23",
    confidence: {
      high: "#5a9f3b",
      medium: "#f1c232",
      low: "#c0392b",
    },
  },
} as const;

export const layout = {
  iconRailWidth: 42,
  sidePanelWidth: 260,
  topToolbarHeight: 42,
  contextHeaderHeight: 52,
  aiPromptBarHeight: 56,
  aiResponseMaxWidth: 760,
} as const;

export const typography = {
  fontUi: 'Arial, Helvetica, "Roboto", sans-serif',
  fontMono: '"Consolas", "Menlo", "Monaco", "Courier New", monospace',
  size: {
    xs: 11,
    sm: 12,
    md: 13,
    base: 14,
    lg: 16,
    xl: 18,
  },
  line: {
    tight: 1.2,
    normal: 1.4,
  },
} as const;

export const spacing = {
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 20,
  s6: 24,
} as const;

export const rowHeight = {
  sm: 30,
  md: 34,
  lg: 42,
} as const;

export const radius = {
  none: 0,
  sm: 2,
  pill: 999,
} as const;

export const zIndex = {
  rail: 100,
  toolbar: 90,
  panel: 80,
  modal: 200,
  toast: 300,
} as const;

export type ConfidenceLevel = "high" | "medium" | "low";
export type StatusLevel = "ok" | "warning" | "error" | "info";
