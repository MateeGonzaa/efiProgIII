import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, title, body, action }: { eyebrow?: string; title: string; body?: string; action?: ReactNode }) {
  return <div className="section-heading flex items-end justify-between gap-6">
    <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{body && <p>{body}</p>}</div>
    {action && <div className="section-action">{action}</div>}
  </div>;
}
