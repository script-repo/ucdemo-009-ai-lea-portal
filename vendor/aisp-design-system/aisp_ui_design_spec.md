# AISP UI Reconstruction Design Spec

## 1. Design Intent

The observed UI is a **dense, utilitarian, legacy enterprise records-management interface** optimized for police/officer workflows, not consumer aesthetics.

Core visual characteristics:

| Attribute | Description |
|---|---|
| Overall style | Flat, administrative, data-dense, minimal decoration |
| Primary color | Medium institutional blue |
| Secondary color | Dark charcoal header bars |
| Background | Mostly white with light grey panel separators |
| Typography | Compact sans-serif, likely Roboto/Arial-like |
| Layout | Fixed navigation rails, collapsible section menus, scrollable work area |
| Density | High information density; compact rows, small text, low whitespace |
| Interaction model | Section-based forms, accordions, guided-entry status indicators |
| Visual hierarchy | Created mainly through header bars, thin borders, section titles, and status icons |

---

## 2. Core Color System

Use this palette consistently.

```css
:root {
  /* Brand / primary */
  --aisp-blue: #1565b3;
  --aisp-blue-dark: #0d4f91;
  --aisp-blue-light: #2f7ec8;

  /* Header / chrome */
  --aisp-charcoal: #24262b;
  --aisp-charcoal-2: #2f3137;
  --aisp-topbar-icon: #6b6f77;

  /* Surfaces */
  --aisp-bg: #ffffff;
  --aisp-panel-bg: #ffffff;
  --aisp-section-bg: #f3f4f8;
  --aisp-row-bg: #ffffff;
  --aisp-muted-bg: #f7f8fb;

  /* Borders */
  --aisp-border: #d9dce3;
  --aisp-border-soft: #eceef3;
  --aisp-border-dark: #c5c9d3;

  /* Text */
  --aisp-text: #2b2f36;
  --aisp-text-muted: #6c7280;
  --aisp-text-light: #ffffff;
  --aisp-link: #215f9c;

  /* Status */
  --aisp-status-ok: #5a9f3b;
  --aisp-status-warning: #f1c232;
  --aisp-status-error: #c0392b;
  --aisp-status-info: #3f7fbf;

  /* Buttons */
  --aisp-btn-primary: #1268b3;
  --aisp-btn-primary-hover: #0e5798;
  --aisp-btn-dark: #333333;
  --aisp-btn-dark-hover: #222222;
  --aisp-btn-disabled: #bfc4cc;

  /* Layout */
  --aisp-icon-rail-width: 42px;
  --aisp-side-panel-width: 260px;
  --aisp-top-toolbar-height: 42px;
  --aisp-context-header-height: 52px;
}
```

---

## 3. Typography

The UI should feel like an older enterprise web application. Avoid modern large typography.

```css
:root {
  --font-ui: Arial, Helvetica, "Roboto", sans-serif;

  --font-size-xs: 11px;
  --font-size-sm: 12px;
  --font-size-md: 13px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;

  --line-tight: 1.2;
  --line-normal: 1.4;
}
```

Typography usage:

| Element | Size | Weight | Color |
|---|---:|---:|---|
| Global body | 13px | 400 | `--aisp-text` |
| Left panel title | 18px | 600 | `--aisp-text` |
| Section header | 16px | 500 | `--aisp-text` |
| Record title in dark bar | 18px | 500 | white |
| Secondary metadata | 12px | 400 | muted grey |
| Buttons | 13px | 600 | white |
| Mobile page title | 18px | 400/500 | dark text |
| Mobile links | 15–17px | 400 | blue |

```css
body {
  font-family: var(--font-ui);
  font-size: var(--font-size-md);
  line-height: var(--line-normal);
  color: var(--aisp-text);
  background: var(--aisp-bg);
}
```

---

## 4. Desktop Layout

### 4.1 Overall Shell

Desktop uses a three-zone application frame:

1. Vertical blue icon rail
2. White navigation / assistant panel
3. Main workspace

```text
┌──────────────────────────────────────────────────────────────┐
│ Top browser/application toolbar                              │
├────┬──────────────────────┬──────────────────────────────────┤
│Blue│ Left assistant panel │ Main work area                   │
│rail│                      │                                  │
│    │                      │ Dark context header              │
│    │                      │ Forms / lists / cards            │
└────┴──────────────────────┴──────────────────────────────────┘
```

```css
.aisp-app {
  display: grid;
  grid-template-columns: var(--aisp-icon-rail-width) var(--aisp-side-panel-width) 1fr;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: var(--aisp-bg);
}
```

---

### 4.2 Blue Icon Rail

Observed characteristics:

- Always fixed on far left.
- Width approximately 36–44px.
- Solid medium blue.
- White/light-blue line icons stacked vertically.
- Active item slightly brighter or highlighted.
- Icons include hamburger, home, list, clock/history, star, mail/envelope, document, settings/help.

```css
.icon-rail {
  width: var(--aisp-icon-rail-width);
  background: var(--aisp-blue);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 8px;
}

.icon-rail button {
  width: var(--aisp-icon-rail-width);
  height: 40px;
  border: 0;
  background: transparent;
  color: rgba(255,255,255,0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.icon-rail button:hover,
.icon-rail button.active {
  background: var(--aisp-blue-dark);
  color: #ffffff;
}
```

Icon style:

```css
.icon-rail svg {
  width: 20px;
  height: 20px;
  stroke-width: 1.8;
}
```

---

### 4.3 Left Assistant / Navigation Panel

Observed characteristics:

- White background.
- Thin vertical divider to main area.
- Title at top: record name, page name, or “Welcome to AISP”.
- Small close “x” top-right.
- Accordion groups: Assistant, Sections, New occurrence, Tasks, Active Items, Favourite searches, Search, Reports.
- Rows are compact with subtle bottom borders.
- Active row uses dark blue background and white text.
- Status icons appear in yellow/green circles beside section names.

```css
.side-panel {
  width: var(--aisp-side-panel-width);
  background: var(--aisp-panel-bg);
  border-right: 1px solid var(--aisp-border);
  overflow-y: auto;
  font-size: var(--font-size-sm);
}

.side-panel-header {
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-bottom: 1px solid var(--aisp-border-soft);
}

.side-panel-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  flex: 1;
}

.side-panel-close {
  color: #a4a8b0;
  font-size: 18px;
  cursor: pointer;
}

.nav-group {
  border-bottom: 1px solid var(--aisp-border-soft);
}

.nav-group-header {
  height: 34px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--aisp-text);
  cursor: pointer;
}

.nav-group-header .chevron {
  margin-left: auto;
  color: #6f7580;
}

.nav-item {
  height: 34px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px 0 22px;
  color: var(--aisp-text);
  border-top: 1px solid var(--aisp-border-soft);
  cursor: pointer;
}

.nav-item:hover {
  background: var(--aisp-muted-bg);
}

.nav-item.active {
  background: var(--aisp-blue-dark);
  color: #ffffff;
}

.nav-item.muted {
  color: var(--aisp-text-muted);
}
```

---

## 5. Desktop Top Toolbar

Observed characteristics:

- Light toolbar across top of main area.
- Contains back button, forward button, action icons, logged-in user, profile/user icon, key icon, overflow menu.
- Icons are grey/black, minimal.
- Height around 40–44px.
- Separate from dark context header.

```css
.top-toolbar {
  height: var(--aisp-top-toolbar-height);
  background: #ffffff;
  border-bottom: 1px solid var(--aisp-border-soft);
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.toolbar-left {
  flex: 1;
}

.toolbar-button {
  border: 0;
  background: transparent;
  color: var(--aisp-topbar-icon);
  height: 32px;
  min-width: 32px;
  cursor: pointer;
}

.toolbar-button:hover {
  background: var(--aisp-muted-bg);
}

.toolbar-user {
  font-size: var(--font-size-xs);
  line-height: 1.1;
  color: var(--aisp-text);
  text-align: right;
}
```

---

## 6. Dark Context Header

The dark header appears at the top of the active workspace.

Examples observed:

- “Welcome to AISP”
- “#230000045 - Occurrence IR guided entry form”
- “BURRIS, DAVID”
- “Occurrence report”

Characteristics:

- Dark charcoal background.
- White title.
- Optional subtitle below title.
- Optional left icon.
- Optional right collapse/scroll arrows.
- Height approximately 48–56px.

```css
.context-header {
  height: var(--aisp-context-header-height);
  background: var(--aisp-charcoal);
  color: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 18px;
}

.context-header-icon {
  width: 26px;
  margin-right: 12px;
  opacity: 0.9;
}

.context-title {
  font-size: var(--font-size-xl);
  font-weight: 500;
  line-height: 1.1;
}

.context-subtitle {
  font-size: var(--font-size-sm);
  color: rgba(255,255,255,0.72);
  margin-top: 2px;
}

.context-actions {
  margin-left: auto;
  display: flex;
  gap: 18px;
  color: rgba(255,255,255,0.55);
}
```

---

## 7. Main Workspace

```css
.main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  overflow: hidden;
}

.workspace {
  flex: 1;
  overflow-y: auto;
  padding: 14px 18px 28px 18px;
  background: #ffffff;
}
```

Workspace density:

| Property | Value |
|---|---:|
| Main horizontal padding | 16–20px |
| Section gap | 12–16px |
| Card padding | 12–14px |
| Border radius | 0px or 2px |
| Shadows | None |
| Borders | Thin grey lines |

---

## 8. Search Pattern

### 8.1 Desktop Search Bar

Observed on home page:

- Dropdown selector on left, e.g. “Person”.
- Long input field: “Name DOB OR ID”.
- Advanced link on right.
- Blue square search button.

```css
.search-strip {
  display: grid;
  grid-template-columns: 110px 1fr auto 44px;
  height: 38px;
  border: 1px solid var(--aisp-border);
  background: #ffffff;
  margin-bottom: 12px;
}

.search-type {
  border: 0;
  border-right: 1px solid var(--aisp-border);
  padding: 0 10px;
  font-size: var(--font-size-sm);
  color: var(--aisp-text);
  background: #ffffff;
}

.search-input {
  border: 0;
  padding: 0 12px;
  font-size: var(--font-size-sm);
}

.search-advanced {
  align-self: center;
  padding: 0 12px;
  color: var(--aisp-link);
  font-size: var(--font-size-sm);
  text-decoration: none;
}

.search-button {
  border: 0;
  background: var(--aisp-btn-primary);
  color: #ffffff;
}
```

---

### 8.2 Mobile Search

Observed mobile characteristics:

- Top blue app bar.
- Hamburger menu at top-left.
- Search form centered in white page.
- Page title: “Person search”.
- Underlined input fields.
- Blue rectangular search button aligned to the right of input.
- Text links below: “Scan and search DL”, “Advanced search”.
- Active Items list below.

```css
.mobile-shell {
  max-width: 480px;
  min-height: 100vh;
  background: #ffffff;
  font-family: var(--font-ui);
}

.mobile-appbar {
  height: 56px;
  background: linear-gradient(90deg, #1f63b7, #537cc7);
  color: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 18px;
}

.mobile-appbar .hamburger {
  width: 24px;
  height: 24px;
}

.mobile-content {
  padding: 28px 32px;
}

.mobile-page-title {
  font-size: 18px;
  font-weight: 400;
  color: #2d2f34;
  padding-bottom: 8px;
  border-bottom: 1px solid #9fa4ac;
}

.mobile-search-row {
  display: grid;
  grid-template-columns: 1fr 72px;
  align-items: end;
  gap: 0;
  margin-top: 24px;
}

.mobile-search-input {
  height: 42px;
  border: 0;
  border-bottom: 1px solid #b8bcc4;
  font-size: 16px;
  padding: 0 8px;
}

.mobile-search-button {
  height: 40px;
  border: 0;
  border-radius: 3px;
  background: #5477bd;
  color: white;
}

.mobile-links {
  display: flex;
  justify-content: space-between;
  margin-top: 22px;
  font-size: 14px;
}

.mobile-links a {
  color: #315f99;
  text-decoration: none;
  font-weight: 500;
}
```

---

## 9. Section / Accordion Pattern

Used heavily in guided forms, person records, occurrence reports, and notebooks.

Characteristics:

- Section header has very light blue-grey background.
- Title left.
- Count in parentheses.
- Optional status icon right.
- Optional sort selector right.
- Content area white.
- Thin border around section.

```css
.section {
  border: 1px solid var(--aisp-border);
  margin-bottom: 12px;
  background: #ffffff;
}

.section-header {
  min-height: 38px;
  background: var(--aisp-section-bg);
  border-bottom: 1px solid var(--aisp-border);
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: 500;
  color: var(--aisp-text);
}

.section-meta {
  margin-left: auto;
  font-size: var(--font-size-sm);
  color: var(--aisp-text-muted);
}

.section-body {
  padding: 12px;
  background: #ffffff;
}
```

Status icons:

```css
.status-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: white;
  margin-left: auto;
}

.status-dot.ok {
  background: var(--aisp-status-ok);
}

.status-dot.warning {
  background: var(--aisp-status-warning);
  color: #ffffff;
}

.status-dot.error {
  background: var(--aisp-status-error);
}
```

---

## 10. Guided Entry Form Pattern

Observed in occurrence guided entry screens.

Key traits:

- Assistant panel lists sections with green/yellow status.
- Main content is vertical sequence of sections.
- Required/incomplete sections show yellow warning icon.
- Complete sections show green check.
- Each section may have:
  - summary record
  - edit pencil on right
  - “Add new”
  - “Not required”
- Buttons are compact.
- Primary action blue.
- Secondary/dismissive action dark grey.

```css
.guided-section {
  border: 1px solid var(--aisp-border);
  margin-bottom: 14px;
}

.guided-section-header {
  height: 40px;
  background: var(--aisp-section-bg);
  display: flex;
  align-items: center;
  padding: 0 14px;
  border-bottom: 1px solid var(--aisp-border);
}

.guided-section-title {
  font-size: 16px;
  font-weight: 500;
}

.guided-card {
  position: relative;
  padding: 14px 46px 14px 58px;
  min-height: 72px;
  background: #ffffff;
}

.guided-card-icon {
  position: absolute;
  left: 18px;
  top: 20px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--aisp-border-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--aisp-blue);
}

.guided-edit {
  position: absolute;
  right: 18px;
  top: 18px;
  color: var(--aisp-blue);
  cursor: pointer;
}

.guided-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}
```

Buttons:

```css
.btn {
  height: 34px;
  padding: 0 16px;
  border: 0;
  border-radius: 0;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: var(--aisp-btn-primary);
  color: #ffffff;
}

.btn-primary:hover {
  background: var(--aisp-btn-primary-hover);
}

.btn-dark {
  background: var(--aisp-btn-dark);
  color: #ffffff;
}

.btn-dark:hover {
  background: var(--aisp-btn-dark-hover);
}

.btn-outline {
  background: #ffffff;
  color: var(--aisp-blue);
  border: 1px solid var(--aisp-blue-light);
}
```

---

## 11. Active Items List Pattern

Observed desktop active items:

- Header: “Occurrences and Case Files - Active - (3)”.
- Sort control right: “Sorted by: Created (desc)”.
- Each item has:
  - icon/avatar/status circle left
  - role label in brackets
  - bold record number and type
  - metadata inline
  - summary line
  - action buttons
  - right-side circular chevron
- Rows separated by horizontal lines.

```css
.list-header {
  height: 42px;
  background: var(--aisp-section-bg);
  border: 1px solid var(--aisp-border);
  display: flex;
  align-items: center;
  padding: 0 14px;
}

.list-title {
  font-size: 16px;
  font-weight: 500;
}

.sort-control {
  margin-left: auto;
  font-size: 13px;
  color: var(--aisp-text);
}

.record-list {
  border: 1px solid var(--aisp-border);
  border-top: 0;
}

.record-row {
  position: relative;
  display: grid;
  grid-template-columns: 44px 1fr 46px;
  gap: 8px;
  padding: 14px 0;
  border-bottom: 1px solid var(--aisp-border-soft);
}

.record-row:last-child {
  border-bottom: 0;
}

.record-icon {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8px;
}

.record-icon-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--aisp-border);
  color: var(--aisp-blue);
  display: flex;
  align-items: center;
  justify-content: center;
}

.record-role {
  font-size: 12px;
  font-weight: 600;
  color: var(--aisp-text-muted);
  margin-bottom: 4px;
}

.record-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--aisp-text);
}

.record-meta,
.record-summary {
  font-size: 13px;
  color: var(--aisp-text);
  margin-top: 3px;
}

.record-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.record-chevron {
  display: flex;
  align-items: center;
  justify-content: center;
}

.record-chevron-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--aisp-border);
  color: #a1a7b1;
}
```

---

## 12. Person Record Pattern

Observed characteristics:

- Dark context header with person name and DOB/PNC metadata.
- Main “Names, IDs” card.
- Name and alias lines left.
- Mugshot/photo block right.
- Photo carousel arrows below photo with “1/2”.
- Rows for Warnings, Flags, Info, IDs.
- Sort controls embedded in section headers.
- Add icon on some rows.

```css
.person-summary {
  border: 1px solid var(--aisp-border);
  margin-bottom: 12px;
}

.person-summary-body {
  display: grid;
  grid-template-columns: 1fr 150px;
  min-height: 190px;
}

.person-details {
  padding: 14px;
}

.person-section-title {
  color: var(--aisp-blue);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 14px;
}

.person-name-line {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.person-id-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 28px;
  font-size: 13px;
  margin-top: 16px;
}

.person-photo-panel {
  border-left: 1px solid var(--aisp-border-soft);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  padding: 8px;
}

.person-photo {
  width: 100%;
  aspect-ratio: 1 / 1.25;
  object-fit: cover;
  border: 1px solid var(--aisp-border);
  background: #e8e8e8;
}

.photo-controls {
  display: grid;
  grid-template-columns: 42px 1fr 42px;
  height: 40px;
  align-items: center;
  text-align: center;
}

.photo-controls button {
  height: 40px;
  border: 0;
  background: var(--aisp-blue);
  color: white;
}
```

---

## 13. Officer Notebook / Narrative Editor Pattern

Observed characteristics:

- Left panel title: “Officer note”.
- Active section highlighted dark blue: “Note narrative”.
- Main header: dark “Note narrative”.
- Rich text toolbar at top.
- Large white document editor bordered in grey.
- Embedded image floated right.
- Blue save button bottom-right.
- Text uses bold headings and bullet-like hyphen lines.

```css
.editor-shell {
  padding: 18px;
}

.rich-toolbar {
  height: 36px;
  display: flex;
  align-items: center;
  gap: 14px;
  border-bottom: 1px solid var(--aisp-border);
  color: #4f5560;
}

.rich-toolbar button {
  border: 0;
  background: transparent;
  height: 28px;
  min-width: 24px;
  font-weight: 600;
  cursor: pointer;
}

.note-editor {
  min-height: 560px;
  border: 1px solid var(--aisp-border-dark);
  padding: 22px;
  font-size: 15px;
  line-height: 1.45;
  background: #ffffff;
}

.note-editor h3 {
  font-size: 15px;
  margin: 0 0 8px;
  font-weight: 700;
}

.note-editor p {
  margin: 0 0 8px;
}

.note-image {
  float: right;
  width: 280px;
  margin: 10px 0 18px 28px;
  border: 1px solid var(--aisp-border);
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
```

---

## 14. Form Pattern

Observed occurrence report form:

- Label above or inline.
- Inputs are thin bordered rectangles.
- Required sections validated with green/yellow status icons.
- Some fields have right-side pencil edit icons.
- Tab-like buttons appear as dark grey horizontal actions.

```css
.form-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(140px, 1fr));
  gap: 12px 18px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 12px;
  color: var(--aisp-text-muted);
}

.form-input,
.form-select,
.form-textarea {
  border: 1px solid var(--aisp-border);
  background: #ffffff;
  min-height: 30px;
  padding: 5px 8px;
  font-size: 13px;
  font-family: var(--font-ui);
}

.form-textarea {
  min-height: 72px;
  resize: vertical;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: 1px solid var(--aisp-blue-light);
  border-color: var(--aisp-blue-light);
}
```

---

## 15. Quick Links / Home Pattern

Observed home page:

- Search bar at top.
- “Quick links” section.
- Each quick link row has left icon, text, and right chevron.
- Person quick link has bold name, supervisor, unit.
- Tasks section below with counts.
- Bottom-right action buttons: “View”, “View active items”.

```css
.quick-links {
  border: 1px solid var(--aisp-border);
  margin-top: 12px;
}

.quick-link-row {
  min-height: 42px;
  display: grid;
  grid-template-columns: 34px 1fr 28px;
  align-items: center;
  padding: 0 12px;
  border-bottom: 1px solid var(--aisp-border-soft);
  cursor: pointer;
}

.quick-link-row:last-child {
  border-bottom: 0;
}

.quick-link-row:hover {
  background: var(--aisp-muted-bg);
}

.quick-link-icon {
  color: var(--aisp-charcoal);
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-link-text {
  font-size: 14px;
  color: var(--aisp-text);
}

.quick-link-chevron {
  color: #aab0ba;
  font-size: 22px;
}

.task-summary {
  border: 1px solid var(--aisp-border);
  margin-top: 14px;
}

.task-body {
  padding: 12px;
  font-size: 13px;
}

.bottom-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 18px;
}
```

---

## 16. Mobile Layout

Mobile UI is not a responsive clone of desktop. It is simplified and vertically stacked.

### Mobile Characteristics

| Area | Mobile behavior |
|---|---|
| Navigation | Collapsed into hamburger |
| Header | Blue gradient app bar |
| Main content | Single-column |
| Text size | Larger than desktop |
| Forms | Underlined Material-style inputs |
| Buttons | Wider touch targets |
| Lists | Full-width rows with dividers |
| Active items | Simple link list |

```css
@media (max-width: 767px) {
  .aisp-app {
    display: block;
    height: 100vh;
  }

  .icon-rail,
  .side-panel,
  .top-toolbar,
  .context-header {
    display: none;
  }

  .mobile-only {
    display: block;
  }

  .workspace {
    padding: 24px 30px;
    overflow-y: auto;
  }
}
```

Mobile list pattern:

```css
.mobile-section-title {
  font-size: 17px;
  font-weight: 500;
  color: #3d5f87;
  padding: 16px 0 8px;
  border-bottom: 1px solid var(--aisp-border);
}

.mobile-list {
  border-top: 1px solid var(--aisp-border-soft);
}

.mobile-list-item {
  min-height: 46px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--aisp-border-soft);
  font-size: 16px;
  color: #315f89;
}
```

---

## 17. Login Screen Pattern

Observed login page:

- Very sparse.
- Left blue rail still visible.
- Main background white.
- Thin dark header bar across top.
- Login form top-left.
- Labels appear in French in one screenshot.
- Small rectangular blue sign-in button.
- Inputs plain bordered rectangles.

```css
.login-page {
  display: grid;
  grid-template-columns: var(--aisp-icon-rail-width) 1fr;
  height: 100vh;
  background: #ffffff;
}

.login-main {
  background: #ffffff;
}

.login-header {
  height: 28px;
  background: var(--aisp-charcoal);
  color: white;
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-size: 13px;
  font-weight: 600;
}

.login-form {
  width: 220px;
  margin: 14px 0 0 18px;
}

.login-field {
  margin-bottom: 8px;
}

.login-field label {
  display: block;
  font-size: 11px;
  margin-bottom: 3px;
}

.login-field input {
  width: 100%;
  height: 24px;
  border: 1px solid var(--aisp-border-dark);
  padding: 2px 5px;
  font-size: 12px;
}

.login-button {
  height: 26px;
  padding: 0 12px;
  background: var(--aisp-btn-primary);
  color: white;
  border: 0;
  font-size: 12px;
}
```

---

## 18. Iconography

Use simple line icons, not filled illustrative icons.

Recommended icon set:

- Material Icons Outlined
- Lucide with stroke width reduced
- Font Awesome regular/solid, if matching legacy feel

Required icon mappings:

| UI Function | Icon |
|---|---|
| Menu | hamburger |
| Home | house |
| Active items | list |
| History | clock / circular arrow |
| Favourite | star |
| Messages | envelope |
| Notebook/report | document |
| Person | user |
| Occurrence | asterisk / incident burst |
| Edit | pencil |
| Add | plus |
| Save | floppy disk |
| Print | printer |
| Search | magnifying glass |
| More | vertical ellipsis |
| Status complete | check in green circle |
| Warning/incomplete | exclamation in yellow circle |
| Navigate row | chevron right |

Icon sizing:

```css
.icon-sm { width: 14px; height: 14px; }
.icon-md { width: 18px; height: 18px; }
.icon-lg { width: 22px; height: 22px; }
```

---

## 19. Interaction States

```css
.clickable {
  cursor: pointer;
}

.clickable:hover {
  background: var(--aisp-muted-bg);
}

.selected {
  background: var(--aisp-blue-dark);
  color: white;
}

.disabled {
  opacity: 0.45;
  pointer-events: none;
}

.validation-warning {
  color: var(--aisp-status-warning);
}

.validation-error {
  color: var(--aisp-status-error);
}

.validation-ok {
  color: var(--aisp-status-ok);
}
```

---

## 20. Deterministic Layout Tokens

Use these exact values for consistency.

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;

  --row-height-sm: 30px;
  --row-height-md: 34px;
  --row-height-lg: 42px;

  --border-radius-none: 0;
  --border-radius-sm: 2px;
  --border-radius-pill: 999px;

  --z-rail: 100;
  --z-toolbar: 90;
  --z-panel: 80;
}
```

---

## 21. Page Templates

### 21.1 Home Page

```text
Desktop:
[Icon Rail] [Side Panel]
             [Top Toolbar]
             [Dark Header: Welcome to AISP]
             [Search Strip]
             [Quick Links Section]
             [Tasks Section]
             [Bottom-right buttons]
```

Required components:

- `icon-rail`
- `side-panel`
- `top-toolbar`
- `context-header`
- `search-strip`
- `quick-links`
- `task-summary`

---

### 21.2 Guided Entry Page

```text
[Icon Rail] [Assistant Panel with Sections + Status]
             [Top Toolbar]
             [Dark Header: Occurrence IR guided entry form]
             [Occurrence Info Section]
             [Victim/Informant Section]
             [Suspect Section]
             [Other involved persons Section]
             [Involved property Section]
             [Occurrence reports Section]
             [Officer notes Section]
```

Required section states:

| State | Visual |
|---|---|
| Complete | Green check circle |
| Required / incomplete | Yellow exclamation circle |
| Error | Red text “Missing or invalid data” |
| Optional skipped | Dark “Not required” button |

---

### 21.3 Person Record Page

```text
[Icon Rail] [Sections Panel]
             [Top Toolbar]
             [Dark Header: PERSON NAME]
             [Names, IDs Summary]
             [Warnings]
             [Flags]
             [Info]
             [Associated addresses]
             [Involved occurrences]
```

---

### 21.4 Active Items Page

```text
[Icon Rail] [Assistant Panel]
             [Top Toolbar]
             [Dark Header: Active Items]
             [List Header with sort]
             [Record Row]
             [Record Row]
             [Record Row]
```

---

### 21.5 Officer Notebook Page

```text
[Icon Rail] [Officer note panel]
             [Top Toolbar]
             [Dark Header: Note narrative]
             [Rich Text Toolbar]
             [Large editor canvas]
             [Save button bottom-right]
```

---

## 22. Visual Fidelity Rules

To keep the recreation faithful:

1. **Do not modernize spacing.** The UI should remain compact and operationally dense.
2. **Do not use rounded cards or shadows.** Borders and flat panels define the layout.
3. **Use blue only for navigation, primary actions, links, and active states.**
4. **Use dark charcoal for active context headers and secondary action buttons.**
5. **Use grey borders liberally.** Thin separators are central to the visual language.
6. **Use compact typography.** Desktop body text should remain around 12–14px.
7. **Use section counts in parentheses.**
8. **Preserve left-side workflow navigation.**
9. **Use status icons consistently in guided-entry sections.**
10. **Mobile should simplify structure but retain blue app bar, white content, underlined inputs, and list rows.**

---

## 23. Minimal CSS Baseline

```css
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  width: 100%;
  height: 100%;
  font-family: Arial, Helvetica, "Roboto", sans-serif;
  font-size: 13px;
  color: #2b2f36;
  background: #ffffff;
}

button,
input,
select,
textarea {
  font-family: inherit;
}

a {
  color: #215f9c;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.aisp-app {
  display: grid;
  grid-template-columns: 42px 260px 1fr;
  height: 100vh;
  overflow: hidden;
}

.main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #ffffff;
}

.workspace {
  flex: 1;
  overflow-y: auto;
  padding: 14px 18px 28px;
}

.card,
.section,
.panel {
  border: 1px solid #d9dce3;
  background: #ffffff;
}

.section-header {
  min-height: 38px;
  background: #f3f4f8;
  border-bottom: 1px solid #d9dce3;
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.btn {
  height: 34px;
  padding: 0 16px;
  border: 0;
  border-radius: 0;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: #1268b3;
  color: white;
}

.btn-dark {
  background: #333333;
  color: white;
}
```

---

## 24. Implementation Assumptions

- Use anonymized placeholder data for names, photos, IDs, and police records.
- Treat exact screenshot dimensions as approximate due to perspective distortion and blur.
- Recreate the design language and layout deterministically, not the exact proprietary product behavior.
- Desktop breakpoint: `>= 768px`.
- Mobile breakpoint: `< 768px`.
- Recommended implementation stack: React components with CSS modules or design tokens; avoid heavy animation or modern material redesign.
