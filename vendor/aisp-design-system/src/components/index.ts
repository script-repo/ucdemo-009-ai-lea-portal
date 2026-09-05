/**
 * AISP Design System — public component API.
 *
 * Use cases should import only from this barrel:
 *   import { AppShell, Section, AIResponseCard } from "@/components";
 *
 * Adding a new export here is a design-system change — propose it in
 * the design system PR, not inside a use-case PR.
 */

// Layout
export { AppShell } from "./layout/AppShell";
export { IconRail, type IconRailItem } from "./layout/IconRail";
export {
  SidePanel,
  NavGroup,
  NavItem,
  type NavItemProps,
} from "./layout/SidePanel";
export { TopToolbar, type ToolbarAction } from "./layout/TopToolbar";
export { ContextHeader } from "./layout/ContextHeader";
export { Workspace } from "./layout/Workspace";

// Primitives
export {
  Button,
  type ButtonVariant,
  type ButtonSize,
} from "./primitives/Button";
export { StatusDot, type StatusVariant } from "./primitives/StatusDot";
export { Badge, type BadgeVariant } from "./primitives/Badge";
export { Input, Select, Textarea } from "./primitives/Input";
export { FormField } from "./primitives/FormField";

// Patterns
export { Section } from "./patterns/Section";
export { SearchStrip, type SearchType } from "./patterns/SearchStrip";
export {
  RecordRow,
  RecordList,
  type RecordRowProps,
} from "./patterns/RecordRow";
export { QuickLink, QuickLinks, type QuickLinkProps } from "./patterns/QuickLink";
export { FormGrid } from "./patterns/FormGrid";

// AI extensions
export { DisclaimerBar } from "./ai/DisclaimerBar";
export { HumanReviewBanner } from "./ai/HumanReviewBanner";
export { ConfidenceBadge } from "./ai/ConfidenceBadge";
export {
  CitationChip,
  CitationSources,
  type Citation,
} from "./ai/CitationChip";
export {
  RedactionToken,
  type RedactionCategory,
} from "./ai/RedactionToken";
export { StreamingIndicator } from "./ai/StreamingIndicator";
export { AIPromptBar } from "./ai/AIPromptBar";
export { AIResponseCard } from "./ai/AIResponseCard";
export { SourceSelector, type Source } from "./ai/SourceSelector";
export { AuditTrail, type AuditEntry } from "./ai/AuditTrail";
export { AISuggestion } from "./ai/AISuggestion";

// Icons
export { Icon, type IconName } from "@/icons";
