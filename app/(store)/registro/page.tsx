import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/register-form";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return <section className="auth-page register-page page-shell"><div className="auth-aside"><span className="eyebrow">CREAR CUENTA</span><div className="auth-aside-art register-art"><span className="portal-ring"/><span className="portal-ring portal-ring-two"/><strong>SUMATE<br/>A LA<br/>CUEVA</strong></div><h2>Registrate<br/><em>en un minuto.</em></h2><p>Con tu cuenta guardás tus datos de envío y seguís el estado de cada pedido.</p><div className="auth-side-code">BIENVENIDO A LA FRIKICUEVA</div></div><div className="auth-panel"><span className="eyebrow">NUEVA CUENTA</span><h1>Creá tu <em>cuenta.</em></h1><p className="auth-subtitle">Unos datos rápidos y ya estás adentro.</p><RegisterForm/><div className="auth-switch">¿Ya tenés cuenta? <Link href="/login">Iniciá sesión <span>→</span></Link></div></div></section>;
}
