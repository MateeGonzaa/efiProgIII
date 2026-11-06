import type { ReactNode } from "react";
import Link from "next/link";
import { AuthGate } from "@/components/auth-gate";
import { Icon } from "@/components/icon";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <AuthGate><section className="account-page page-shell"><div className="account-title"><span className="eyebrow">MI CUENTA</span><h1>Tu <em>cuenta.</em></h1><p>Tus pedidos y tus datos de envío, en un solo lugar.</p></div><nav className="account-nav"><Link href="/cuenta/pedidos"><Icon name="bag" size={16}/> Mis pedidos</Link><Link href="/cuenta/perfil"><Icon name="user" size={16}/> Mi perfil</Link><Link href="/catalogo"><Icon name="book" size={16}/> Ir al catálogo</Link></nav><div className="account-content">{children}</div></section></AuthGate>;
}
