"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth, useCart } from "@/components/providers";
import { ThemeToggle } from "@/components/theme-toggle";
import { Icon } from "@/components/icon";
import { isNavActive, navLinks } from "@/lib/navigation";

/**
 * Links del menú. Al tocar uno queda marcado de inmediato (la página del catálogo se pide al servidor
 * y puede tardar), y el link muestra una barra de carga hasta que la URL realmente cambia.
 */
function NavLinks({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const categoria = useSearchParams().get("categoria");
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => { setPending(null); }, [pathname, categoria]);
  // Por si la red falla y la URL nunca cambia, no dejamos el link cargando para siempre.
  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => setPending(null), 8000);
    return () => window.clearTimeout(timer);
  }, [pending]);

  return <>{navLinks.map((link) => {
    const active = pending ? pending === link.href : isNavActive(link, pathname, categoria);
    const loading = pending === link.href;
    return <Link
      key={link.href}
      href={link.href}
      className={`nav-link${active ? " nav-active" : ""}${loading ? " nav-pending" : ""}`}
      aria-current={active && !loading ? "page" : undefined}
      aria-busy={loading || undefined}
      onClick={() => {
        onNavigate();
        if (!isNavActive(link, pathname, categoria)) setPending(link.href);
      }}
    >{link.label}</Link>;
  })}</>;
}

export function SiteHeader() {
  const { session, signOut } = useAuth();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  // Estilo de los items extra del menú mobile (cuenta, carrito). En pantallas grandes este bloque se oculta.
  const mobileItem = "border-b border-[var(--line-soft)] px-0.5 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-[.13em] text-paper-dim hover:text-paper";
  const closeMenu = () => setMenuOpen(false);
  const logout = async () => { await signOut(); setMenuOpen(false); router.push("/"); };

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return <>
    <div className="announcement"><span>Envíos a todo el país</span><i/><span>Cómics, manga y libros</span><i/><span>Compra segura · Hecho en Argentina</span></div>
    <header className="site-header">
      <div className="header-inner">
        <button className="icon-button mobile-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen} aria-controls="main-nav"><Icon name={menuOpen ? "close" : "menu"}/></button>
        <Link href="/" className="brand" aria-label="La Frikicueva, inicio"><span className="brand-mark"><Icon name="book" size={22}/></span><span>LA FRIKICUEVA<small>Cómics · Manga · Libros</small></span></Link>
        <nav id="main-nav" className={`main-nav max-h-[calc(100dvh-65px)] overflow-y-auto ${menuOpen ? "nav-open" : ""}`} aria-label="Navegación principal"><Suspense fallback={navLinks.map((link) => <Link key={link.href} href={link.href} className="nav-link">{link.label}</Link>)}><NavLinks onNavigate={() => setMenuOpen(false)}/></Suspense>
          {/* En el celular los íconos de cuenta no entran en la barra, así que van dentro del menú. */}
          <div className="mt-1 flex flex-col min-[761px]:hidden">
            <Link href="/" onClick={closeMenu} className={mobileItem}>Inicio</Link>
            <Link href="/carrito" onClick={closeMenu} className={mobileItem}>Carrito ({count})</Link>
            {session ? <>
              <Link href="/cuenta/pedidos" onClick={closeMenu} className={mobileItem}>Mis pedidos</Link>
              <Link href="/cuenta/perfil" onClick={closeMenu} className={mobileItem}>Mi perfil</Link>
              {session.isStaff && <Link href="/admin/productos" onClick={closeMenu} className={mobileItem}>Gestión de productos</Link>}
              <button type="button" onClick={logout} className={`${mobileItem} w-full bg-transparent`}>Cerrar sesión ({session.username})</button>
            </> : <>
              <Link href={`/login?next=${encodeURIComponent(pathname)}`} onClick={closeMenu} className={`${mobileItem} text-accent!`}>Iniciar sesión</Link>
              <Link href="/registro" onClick={closeMenu} className={mobileItem}>Crear cuenta</Link>
            </>}
          </div>
        </nav>
        <div className="header-actions"><ThemeToggle/>
          {session ? <div className="account-menu">{session.isStaff && <Link href="/admin/productos" className="icon-button" title="Administrar productos" aria-label="Administración"><Icon name="layers" size={18}/></Link>}<Link href="/cuenta/pedidos" className="icon-button" title={`Hola, ${session.username}`} aria-label="Mi cuenta"><Icon name="user" size={18}/></Link><button className="icon-button logout-button" onClick={logout} title="Cerrar sesión" aria-label="Cerrar sesión"><Icon name="logout" size={17}/></button></div> : <Link className="icon-button account-link" href={`/login?next=${encodeURIComponent(pathname)}`} aria-label="Ingresar"><Icon name="user" size={18}/></Link>}
          <Link href="/carrito" className="cart-link" aria-label={`Carrito, ${count} productos`}><Icon name="bag" size={19}/><span key={count} className="cart-count">{count}</span><span className="cart-copy">Carrito</span></Link>
        </div>
      </div>
    </header>
  </>;
}