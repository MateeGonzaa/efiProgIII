import type { ReactNode } from "react";
import Link from "next/link";
import { AuthGate } from "@/components/auth-gate";
import { Icon } from "@/components/icon";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AuthGate admin><section className="admin-page page-shell"><div className="admin-intro"><span className="eyebrow">CONTROL DE ARCHIVO · ACCESO DE STAFF</span><h1>Backstage <em>de la cueva.</em></h1><p>Administrá las ediciones del catálogo. La API aplica los permisos de staff al guardar.</p></div><nav className="admin-nav"><Link href="/admin/productos"><Icon name="layers" size={16}/> Productos</Link><Link href="/catalogo"><Icon name="book" size={16}/> Ver tienda</Link></nav><div className="account-content">{children}</div></section></AuthGate>;
}
