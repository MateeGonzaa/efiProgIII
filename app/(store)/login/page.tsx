import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { Icon } from "@/components/icon";

export const metadata: Metadata = { title: "Ingresar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/cuenta/pedidos" } = await searchParams;
  return <section className="auth-page page-shell"><div className="auth-aside"><span className="eyebrow">INGRESAR</span><div className="auth-aside-art"><Icon name="book" size={70}/><span>FC<br/>2026</span></div><h2>Volvé a la<br/><em>cueva.</em></h2><p>Mirá tus pedidos y guardá tus datos de envío para comprar más rápido.</p><div className="auth-side-code">LA FRIKICUEVA · CÓRDOBA</div></div><div className="auth-panel"><span className="eyebrow">INGRESAR</span><h1>Hola de <em>nuevo.</em></h1><p className="auth-subtitle">Ingresá con tu usuario para ver tus pedidos.</p><LoginForm nextPath={next}/><div className="auth-switch">¿Todavía no tenés cuenta? <Link href="/registro">Creá tu cuenta <Icon name="arrow" size={14}/></Link></div></div></section>;
}
