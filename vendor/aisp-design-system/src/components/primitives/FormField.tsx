import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  help?: ReactNode;
  error?: ReactNode;
  span?: 1 | 2 | 3 | "full";
  children: ReactNode;
};

/**
 * Label + control + help/error stack (spec §14).
 *
 * Use inside a <FormGrid> so the 4-column dense layout from the spec
 * is preserved. Pass `span` to widen a field across grid columns.
 */
export function FormField({
  label,
  htmlFor,
  required,
  help,
  error,
  span,
  children,
}: FormFieldProps) {
  const cls = [
    "form-field",
    span === 2 && "form-field--span-2",
    span === 3 && "form-field--span-3",
    span === "full" && "form-field--span-full",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls}>
      <label
        className={`form-label${required ? " form-label--required" : ""}`}
        htmlFor={htmlFor}
      >
        {label}
      </label>
      {children}
      {help && !error && <span className="form-help">{help}</span>}
      {error && (
        <span className="form-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
