"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/components/providers";

export function AuthGate({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { session, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (admin && !session.isStaff) router.replace("/cuenta/pedidos");
  }, [ready, session, router, pathname, admin]);
  if (!ready || !session || (admin && !session.isStaff)) return <div className="auth-loading"><span className="loading-orbit"/><span>{admin ? "VERIFICANDO ACCESO…" : "CARGANDO TU CUENTA…"}</span></div>;
  return <>{children}</>;
}
