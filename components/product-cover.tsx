"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { ProductDetails } from "@/lib/types";
import { coverCandidates, coverSearchQuery } from "@/lib/utils";

const art = ["cover-art-one", "cover-art-two", "cover-art-three", "cover-art-four", "cover-art-five", "cover-art-six"];

type CoverProduct = Pick<ProductDetails, "id" | "titulo" | "categoria"> & { isbn?: string; imagen_url?: string | null };

// Cache en memoria: una sola búsqueda por título aunque la misma portada se muestre en varios lugares.
const searchCache = new Map<string, Promise<string>>();
function searchCover(title: string): Promise<string> {
  const query = coverSearchQuery(title);
  if (!searchCache.has(query)) {
    searchCache.set(query, fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=1&fields=cover_i`)
      .then((response) => response.json())
      .then((data: { docs?: Array<{ cover_i?: number }> }) => data.docs?.[0]?.cover_i ? `https://covers.openlibrary.org/b/id/${data.docs[0].cover_i}-L.jpg?default=false` : "")
      .catch(() => ""));
  }
  return searchCache.get(query)!;
}

/**
 * Client Component: maneja estado (carga/error de la imagen) y el efecto 3D del puntero.
 * Prioridad de portada: URL cargada en el admin → Open Library por ISBN → Open Library por título → portada ilustrada.
 */
export function ProductCover({ product, className = "" }: { product: CoverProduct; className?: string }) {
  const direct = coverCandidates(product);
  const [attempt, setAttempt] = useState(0);
  const [searched, setSearched] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const img = useRef<HTMLImageElement>(null);
  const variant = art[(product.id - 1) % art.length];
  const category = typeof product.categoria === "object" ? product.categoria.nombre : "Edición de colección";
  const src = attempt < direct.length ? direct[attempt] : searched;

  useEffect(() => {
    if (attempt < direct.length || searched !== null) return;
    let alive = true;
    searchCover(product.titulo).then((url) => { if (!alive) return; setSearched(url); if (!url) setState("error"); });
    return () => { alive = false; };
  }, [attempt, direct.length, searched, product.titulo]);

  useEffect(() => {
    const el = img.current;
    if (el?.complete && el.naturalWidth > 0) setState(el.naturalWidth > 1 ? "ok" : "error");
  }, [src]);

  const failed = () => {
    if (attempt < direct.length) setAttempt((value) => value + 1);
    else setState("error");
  };
  const tilt = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    event.currentTarget.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--ry", `${(x * 12).toFixed(2)}deg`);
  };
  const untilt = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--rx", "0deg");
    event.currentTarget.style.setProperty("--ry", "0deg");
  };

  return <div className={`product-cover ${variant} ${className}`} data-state={state} role="img" aria-label={`Portada de ${product.titulo}`} onPointerMove={tilt} onPointerLeave={untilt}>
    {state !== "ok" && <>
      <span className="cover-frame" />
      <span className="cover-kicker">FRIKICUEVA · ARCHIVO {String(product.id).padStart(2, "0")}</span>
      <span className="cover-art-mark" aria-hidden="true">{product.id % 2 ? "✳" : "◈"}</span>
      <span className="cover-title">{product.titulo}</span>
      <span className="cover-category">{category}</span>
      <span className="cover-edition">EDICIÓN DE COLECCIÓN</span>
    </>}
    {src && state !== "error" && (
      // eslint-disable-next-line @next/next/no-img-element
      <img key={src} ref={img} className="cover-photo" data-ready={state === "ok"} src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer"
        onLoad={(event) => setState(event.currentTarget.naturalWidth > 1 ? "ok" : "error")} onError={failed} />
    )}
    <span className="cover-spine" aria-hidden="true" />
    <span className="cover-shine" aria-hidden="true" />
  </div>;
}
