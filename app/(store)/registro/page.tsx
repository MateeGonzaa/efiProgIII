import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/register-form";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return <section className="auth-page register-page page-shell"><div className="auth-aside"><span className="eyebrow">UN UNIVERSO CON TU NOMBRE</span><div className="auth-aside-art register-art"><span className="portal-ring"/><span className="portal-ring portal-ring-two"/><strong>ABRÍ<br/>TU<br/>PORTAL</strong></div><h2>El primer paso<br/><em>es tuyo.</em></h2><p>Creá tu cuenta, guardá tus historias y armá una estantería a tu medida.</p><div className="auth-side-code">NUEVO LECTOR · BIENVENIDO</div></div><div className="auth-panel"><span className="eyebrow">NUEVO LECTOR</span><h1>Entrá a <em>la historia.</em></h1><p className="auth-subtitle">Unos datos rápidos y ya estás adentro.</p><RegisterForm/><div className="auth-switch">¿Ya sos parte de la cueva? <Link href="/login">Iniciá sesión <span>→</span></Link></div></div></section>;
}
