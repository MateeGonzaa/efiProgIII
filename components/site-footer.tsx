import Link from "next/link";
import { Icon } from "@/components/icon";

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="footer-top"><div><Link href="/" className="brand footer-brand"><span className="brand-mark"><Icon name="book" size={21}/></span><span>LA FRIKICUEVA<small>CÓMICS · MANGA · LIBROS</small></span></Link><p>Cómics, manga y libros<br/>desde Córdoba para todo el país.</p></div>
      <div className="footer-links"><div><span>EXPLORAR</span><Link href="/catalogo">Catálogo</Link><Link href="/catalogo?categoria=2">Manga</Link><Link href="/catalogo?categoria=1">Cómics</Link></div><div><span>LA CUEVA</span><Link href="/cuenta/pedidos">Mis pedidos</Link><Link href="/cuenta/perfil">Mi perfil</Link><Link href="/admin/productos">Gestión</Link></div></div>
    </div>
    <div className="footer-wordmark" aria-hidden="true">LA FRIKICUEVA</div>
    <div className="footer-bottom"><span>© 2026 LA FRIKICUEVA · CÓRDOBA, ARGENTINA</span><span>HECHO EN ARGENTINA <Icon name="spark" size={13}/></span></div>
  </footer>;
}
