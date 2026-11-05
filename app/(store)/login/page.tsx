import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { Icon } from "@/components/icon";

export const metadata: Metadata = { title: "Ingresar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/cuenta/pedidos" } = await searchParams;
  return <section className="auth-page page-shell"><div className="auth-aside"><span className="eyebrow">TU PRÓXIMA HISTORIA TE ESPERA</span><div className="auth-aside-art"><Icon name="book" size={70}/><span>FC<br/>2026</span></div><h2>Volvé a la<br/><em>cueva.</em></h2><p>Tu biblioteca, tus pedidos y todos tus mundos en un mismo lugar.</p><div className="auth-side-code">ACCESO DE LECTOR · SEÑAL CIFRADA</div></div><div className="auth-panel"><span className="eyebrow">ACCESO DE LECTOR</span><h1>Hola de <em>nuevo.</em></h1><p className="auth-subtitle">Ingresá tus datos y seguí donde lo dejaste.</p><LoginForm nextPath={next}/><div className="auth-switch">¿Todavía no tenés cuenta? <Link href="/registro">Abrí tu portal <Icon name="arrow" size={14}/></Link></div></div></section>;
}
