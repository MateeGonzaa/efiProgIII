"use client";

import { useEffect } from "react";
import { ErrorNotice } from "@/components/status";

export default function CatalogError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <section className="catalog-page page-shell"><span className="eyebrow">SEÑAL PERDIDA</span><h1>Algo se torció <em>en el portal.</em></h1><ErrorNotice message="No pudimos cargar esta parte del catálogo." onRetry={reset}/></section>;
}