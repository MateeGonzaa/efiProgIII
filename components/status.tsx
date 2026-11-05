import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";

export function ApiBanner({ children = "Vista de muestra · conectá la API para ver el catálogo en vivo" }: { children?: ReactNode }) {
  return <div className="api-banner flex items-center gap-2"><span className="api-pulse" />{children}</div>;
}

export function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="error-notice flex items-center justify-between gap-4" role="alert"><div><strong>Se cortó la señal.</strong><p>{message}</p></div>{onRetry && <button className="button button-secondary" onClick={onRetry}>Reintentar</button>}</div>;
}

export function EmptyState({ icon = "book", title, body, action }: { icon?: "book" | "bag" | "search"; title: string; body: string; action?: ReactNode }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name={icon} size={25}/></span><h3>{title}</h3><p>{body}</p>{action}</div>;
}

export function LoadingGrid() {
  return <div className="product-grid loading-grid" aria-label="Cargando catálogo">{Array.from({ length: 6 }, (_, index) => <div className="product-skeleton" key={index}><div/><i/><i/></div>)}</div>;
}

export function BackLink({ href = "/catalogo", children = "Volver al catálogo" }: { href?: string; children?: ReactNode }) {
  return <Link className="text-link" href={href}><Icon name="chevron" size={16} className="back-arrow"/>{children}</Link>;
}
