"use client";

import { useState } from "react";
import type { PointerEvent } from "react";
import type { ProductDetails } from "@/lib/types";
import { CoverArt, coverKind } from "@/components/cover-art";
import { categoryLabel, imageSrc } from "@/lib/utils";

type CoverProduct = Pick<ProductDetails, "id" | "titulo" | "categoria"> & { isbn?: string; imagen_url?: string | null };

/**
 * Portada: ilustración SVG por categoría de fondo. Si el producto tiene `imagen_url` (un enlace o una ruta
 * de /public como /portadas/berserk-1.jpg), la tapa se superpone con un fundido al terminar de cargar.
 * Si no hay imagen o el enlace falla, queda la ilustración.
 */
export function ProductCover({ product, className = "", priority = false }: { product: CoverProduct; className?: string; priority?: boolean }) {
  const [loadedUrl, setLoadedUrl] = useState("");
  const [failed, setFailed] = useState<string[]>([]);
  const name = typeof product.categoria === "object" ? product.categoria.nombre : "";
  const category = name ? categoryLabel(name) : "Edición";
  const src = imageSrc(product.imagen_url);
  const photo = src && !failed.includes(src) ? src : "";
  const loaded = Boolean(photo) && loadedUrl === photo;
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

  return <div className={`product-cover has-art ${className}`} data-state={photo && loaded ? "ok" : "art"} role="img" aria-label={`Portada de ${product.titulo}`} onPointerMove={tilt} onPointerLeave={untilt}>
    <CoverArt kind={coverKind(name)} seed={product.id} />
    <span className="cover-frame" />
    <span className="cover-kicker">FRIKICUEVA · Nº {String(product.id).padStart(2, "0")}</span>
    <span className="cover-title">{product.titulo}</span>
    <span className="cover-category">{category}</span>
    <span className="cover-edition">LA FRIKICUEVA</span>
    {photo && (
      // eslint-disable-next-line @next/next/no-img-element
      <img key={photo} className="cover-photo" data-ready={loaded} src={photo} alt="" loading={priority ? "eager" : "lazy"} decoding="async" referrerPolicy="no-referrer"
        ref={(el) => { if (el?.complete && el.naturalWidth > 1) setLoadedUrl(photo); }}
        onLoad={(event) => (event.currentTarget.naturalWidth > 1 ? setLoadedUrl(photo) : setFailed((list) => [...list, photo]))} onError={() => setFailed((list) => [...list, photo])} />
    )}
    <span className="cover-spine" aria-hidden="true" />
    <span className="cover-shine" aria-hidden="true" />
  </div>;
}