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
    if (ready && !session) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, session, router, pathname]);
  if (!ready || !session) return <div className="auth-loading"><span className="loading-orbit"/><span>{admin ? "VERIFICANDO ACCESO…" : "ABRIENDO TU CUENTA…"}</span></div>;
  return <>{children}</>;
}
