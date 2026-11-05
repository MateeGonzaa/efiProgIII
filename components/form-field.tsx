import type { ReactNode } from "react";

export function FormField({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return <div className={`form-field ${error ? "field-invalid" : ""}`}><label>{label}</label>{children}{error ? <small className="field-error">{error}</small> : hint ? <small className="field-hint">{hint}</small> : null}</div>;
}
