import Link from "next/link";
import { Icon } from "@/components/icon";

// Página 404 hecha solo con utilidades de Tailwind (sin clases propias en globals.css).
export default function NotFound() {
  return <main className="flex min-h-[74vh] flex-col items-center justify-center px-5 py-14 text-center">
    <span className="eyebrow">ERROR 404 · PÁGINA NO ENCONTRADA</span>
    <div className="-mt-3 -mb-1 font-[Impact,sans-serif] text-[clamp(120px,24vw,250px)] leading-none text-accent opacity-15">404</div>
    <h1 className="-mt-[50px] mb-2.5 font-[Impact,sans-serif] text-[clamp(43px,6vw,68px)] leading-[.9] uppercase [&_em]:text-accent [&_em]:not-italic">Uy, esta página<br/><em>no está.</em></h1>
    <p className="mb-5 text-xs text-paper-dim">Puede que el link esté mal o que la hayamos movido. Probá desde el catálogo.</p>
    <Link href="/catalogo" className="button button-primary">Volver al catálogo <Icon name="arrow" size={17}/></Link>
  </main>;
}
