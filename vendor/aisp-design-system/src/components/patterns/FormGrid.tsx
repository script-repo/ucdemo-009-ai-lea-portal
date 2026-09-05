import type { ReactNode } from "react";

type FormGridProps = {
  columns?: 2 | 3 | 4;
  children: ReactNode;
};

/**
 * Dense 2/3/4-column form grid (spec §14).
 *
 * Default is 4 columns at desktop, automatically collapses to a single
 * column on mobile via `mobile.css`. Wrap each control in <FormField>.
 */
export function FormGrid({ columns = 4, children }: FormGridProps) {
  const cls =
    columns === 2 ? "form-grid form-grid--2" :
    columns === 3 ? "form-grid form-grid--3" :
    "form-grid";

  return <div className={cls}>{children}</div>;
}
