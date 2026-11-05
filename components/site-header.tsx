"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, useCart } from "@/components/providers";
import { ThemeToggle } from "@/components/theme-toggle";
import { Icon } from "@/components/icon";

const links = [{ href: "/catalogo", label: "Catálogo" }, { href: "/catalogo?categoria=2", label: "Manga" }, { href: "/catalogo?categoria=1", label: "Cómics" }, { href: "/catalogo?categoria=3", label: "Fantasía" }];

export function SiteHeader() {
  const { session, signOut } = useAuth();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const logout = async () => { await signOut(); setMenuOpen(false); router.push("/"); };
  return <>
    <div className="announcement"><span>ENVÍOS A TODO EL PAÍS</span><i/><span>UN UNIVERSO NUEVO EN CADA PÁGINA</span><i/><span>COMPRA SEGURA · HECHO EN ARGENTINA</span></div>
    <header className="site-header">
      <div className="header-inner">
        <button className="icon-button mobile-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}><Icon name={menuOpen ? "close" : "menu"}/></button>
        <Link href="/" className="brand" aria-label="La Frikicueva, inicio"><span className="brand-mark"><Icon name="book" size={22}/></span><span>LA FRIKICUEVA<small>ARCHIVO DE MUNDOS</small></span></Link>
        <nav className={`main-nav ${menuOpen ? "nav-open" : ""}`} aria-label="Navegación principal">{links.map((link) => <Link key={link.href} href={link.href} className={pathname.startsWith("/catalogo") && link.href === "/catalogo" ? "nav-active" : ""} onClick={() => setMenuOpen(false)}>{link.label}</Link>)}</nav>
        <div className="header-actions"><ThemeToggle/>
          {session ? <div className="account-menu">{session.isStaff && <Link href="/admin/productos" className="icon-button" title="Administrar productos" aria-label="Administración"><Icon name="layers" size={18}/></Link>}<Link href="/cuenta/pedidos" className="icon-button" title={`Hola, ${session.username}`} aria-label="Mi cuenta"><Icon name="user" size={18}/></Link><button className="icon-button logout-button" onClick={logout} title="Cerrar sesión" aria-label="Cerrar sesión"><Icon name="logout" size={17}/></button></div> : <Link className="icon-button account-link" href={`/login?next=${encodeURIComponent(pathname)}`} aria-label="Ingresar"><Icon name="user" size={18}/></Link>}
<<<<<<< HEAD
          <Link href="/carrito" className="cart-link" aria-label={`Carrito, ${count} productos`}><Icon name="bag" size={19}/><span className="cart-count">{count}</span><span className="cart-copy">CARRITO</span></Link>
=======
          <Link href="/carrito" className="cart-link" aria-label={`Carrito, ${count} productos`}><Icon name="bag" size={19}/><span key={count} className="cart-count">{count}</span><span className="cart-copy">CARRITO</span></Link>
>>>>>>> 49101bf (mejoras efi)
        </div>
      </div>
    </header>
  </>;
}
