import Link from "next/link";
import { Icon } from "@/components/icon";

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="footer-top"><div><Link href="/" className="brand footer-brand"><span className="brand-mark"><Icon name="book" size={21}/></span><span>LA FRIKICUEVA<small>Cómics · Manga · Libros</small></span></Link><p>Cómics, manga y libros<br/>desde Rio Cuarto para todo el país.</p></div>
      <div className="footer-links"><div><span>Tienda</span><Link href="/catalogo">Catálogo</Link><Link href="/catalogo?categoria=comics">Cómics</Link><Link href="/catalogo?categoria=manga">Manga</Link><Link href="/catalogo?categoria=libros">Libros</Link></div><div><span>Mi cuenta</span><Link href="/cuenta/pedidos">Mis pedidos</Link><Link href="/cuenta/perfil">Mi perfil</Link><Link href="/admin/productos">Gestión</Link></div></div>
    </div>
    <div className="footer-wordmark" aria-hidden="true">LA FRIKICUEVA</div>
    <div className="footer-bottom"><span>© 2026 La Frikicueva · Rio Cuarto, Argentina</span><span>Hecho en Argentina</span></div>
  </footer>;
}