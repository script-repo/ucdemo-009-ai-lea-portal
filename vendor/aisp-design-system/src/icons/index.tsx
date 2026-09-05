/**
 * AISP Design System — Icon set.
 *
 * Simple line icons matching the spec's legacy enterprise feel
 * (section 18). Stroke-based, 1.8 stroke width, 24x24 viewBox.
 * Do NOT introduce filled illustrative icons.
 *
 * Usage:
 *   import { Icon } from "@/icons";
 *   <Icon name="search" className="icon-md" />
 */

import type { SVGProps } from "react";

export type IconName =
  | "menu"
  | "home"
  | "list"
  | "clock"
  | "star"
  | "mail"
  | "document"
  | "user"
  | "occurrence"
  | "edit"
  | "plus"
  | "save"
  | "print"
  | "search"
  | "more"
  | "check"
  | "alert"
  | "info"
  | "x"
  | "chevron-right"
  | "chevron-left"
  | "chevron-down"
  | "chevron-up"
  | "sparkles"
  | "shield"
  | "send"
  | "copy"
  | "thumbs-up"
  | "thumbs-down"
  | "settings"
  | "key"
  | "back"
  | "forward"
  | "filter"
  | "folder";

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
  title?: string;
};

const paths: Record<IconName, JSX.Element> = {
  menu: (
    <>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </>
  ),
  home: (
    <>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  list: (
    <>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="4" cy="6" r="1" />
      <circle cx="4" cy="12" r="1" />
      <circle cx="4" cy="18" r="1" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 16 14" />
    </>
  ),
  star: <polygon points="12 3 14.9 9 21 9.5 16 14 17.6 20 12 16.8 6.4 20 8 14 3 9.5 9.1 9" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <polyline points="3 7 12 13 21 7" />
    </>
  ),
  document: (
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <polyline points="15 3 15 7 19 7" />
      <line x1="9" y1="12" x2="16" y2="12" />
      <line x1="9" y1="16" x2="16" y2="16" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6" />
    </>
  ),
  occurrence: (
    <>
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4l11-11-4-4L4 16z" />
      <line x1="14" y1="5" x2="18" y2="9" />
    </>
  ),
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  save: (
    <>
      <path d="M5 3h11l3 3v15H5z" />
      <polyline points="8 3 8 8 14 8 14 3" />
      <rect x="8" y="13" width="8" height="6" />
    </>
  ),
  print: (
    <>
      <polyline points="6 9 6 3 18 3 18 9" />
      <rect x="4" y="9" width="16" height="8" rx="1" />
      <rect x="7" y="15" width="10" height="6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </>
  ),
  more: (
    <>
      <circle cx="12" cy="5" r="1.3" />
      <circle cx="12" cy="12" r="1.3" />
      <circle cx="12" cy="19" r="1.3" />
    </>
  ),
  check: <polyline points="4 12 10 18 20 6" />,
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="7" x2="12" y2="13" />
      <circle cx="12" cy="17" r="0.7" fill="currentColor" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <circle cx="12" cy="8" r="0.7" fill="currentColor" />
    </>
  ),
  x: (
    <>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </>
  ),
  "chevron-right": <polyline points="9 6 15 12 9 18" />,
  "chevron-left": <polyline points="15 6 9 12 15 18" />,
  "chevron-down": <polyline points="6 9 12 15 18 9" />,
  "chevron-up": <polyline points="6 15 12 9 18 15" />,
  sparkles: (
    <>
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
      <path d="M19 14l.7 1.8L21 16.5l-1.3.7L19 19l-.7-1.8L17 16.5l1.3-.7z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V6z" />
      <line x1="9" y1="12" x2="15" y2="12" />
    </>
  ),
  send: (
    <>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="1" />
      <path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
    </>
  ),
  "thumbs-up": (
    <>
      <path d="M7 11v9H4v-9z" />
      <path d="M7 11l4-8c1.5 0 2.5 1 2.5 2.5V9h5.5c1 0 1.7.9 1.5 1.9L19 19c-.2.9-1 1.5-1.9 1.5H7" />
    </>
  ),
  "thumbs-down": (
    <>
      <path d="M7 13V4H4v9z" />
      <path d="M7 13l4 8c1.5 0 2.5-1 2.5-2.5V15h5.5c1 0 1.7-.9 1.5-1.9L19 5c-.2-.9-1-1.5-1.9-1.5H7" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.3 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.3l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1A2 2 0 1 1 19.7 7l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </>
  ),
  key: (
    <>
      <circle cx="7" cy="15" r="4" />
      <line x1="10" y1="13" x2="21" y2="3" />
      <line x1="17" y1="6" x2="20" y2="9" />
      <line x1="14" y1="9" x2="17" y2="12" />
    </>
  ),
  back: <polyline points="15 18 9 12 15 6" />,
  forward: <polyline points="9 6 15 12 9 18" />,
  filter: <polygon points="3 4 21 4 14 12 14 20 10 18 10 12" />,
  folder: <path d="M3 6h7l2 2h9v11H3z" />,
};

export function Icon({
  name,
  size = 18,
  title,
  className,
  ...rest
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}
