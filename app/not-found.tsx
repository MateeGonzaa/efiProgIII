import Link from "next/link";
import { Icon } from "@/components/icon";

export default function NotFound() {
  return <main className="not-found"><span className="eyebrow">ERROR 404 · PÁGINA NO ENCONTRADA</span><div className="not-found-code">404</div><h1>Uy, esta página<br/><em>no está.</em></h1><p>Puede que el link esté mal o que la hayamos movido. Probá desde el catálogo.</p><Link href="/catalogo" className="button button-primary">Volver al catálogo <Icon name="arrow" size={17}/></Link></main>;
}
