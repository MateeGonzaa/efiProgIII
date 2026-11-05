import Link from "next/link";
import { Icon } from "@/components/icon";

export default function NotFound() {
  return <main className="not-found"><span className="eyebrow">ERROR 404 · PORTAL NO ENCONTRADO</span><div className="not-found-code">404</div><h1>Esta página<br/><em>se perdió entre mundos.</em></h1><p>La historia que buscás ya no está en este estante.</p><Link href="/catalogo" className="button button-primary">Volver al archivo <Icon name="arrow" size={17}/></Link></main>;
}
