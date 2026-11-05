"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProductDetails } from "@/lib/types";
import { useCart } from "@/components/providers";
import { ProductCover } from "@/components/product-cover";
import { Icon } from "@/components/icon";
import { formatCurrency } from "@/lib/utils";

export function ProductDetailClient({ product }: { product: ProductDetails }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const category = typeof product.categoria === "object" ? product.categoria.nombre : "Edición de colección";
  const authors = Array.isArray(product.autores) ? product.autores.map((author) => typeof author === "object" ? author.nombre : "").filter(Boolean).join(", ") : "";
  return <section className="product-detail page-shell">
    <div className="detail-crumb"><Link href="/catalogo">CATÁLOGO</Link><Icon name="chevron" size={13}/><span>FICHA DE OBJETO · {String(product.id).padStart(3, "0")}</span></div>
    <div className="detail-layout"><div className="detail-art"><span className="detail-art-id">OBJETO DE COLECCIÓN / FC—{product.id}</span><ProductCover product={product}/><span className="detail-art-caption">ARCHIVO FRIKICUEVA · CÓRDOBA, AR</span></div>
      <div className="detail-copy"><span className="eyebrow">{category} · EDICIÓN EN PAPEL</span><h1>{product.titulo}</h1><div className="detail-rating"><span aria-label="5 estrellas">★★★★★</span><span>LECTURA RECOMENDADA</span></div><p className="detail-lede">Una historia que merece un lugar propio en tu estantería. Descubrí esta edición y encontrá tu próximo mundo favorito.</p>
        <div className="detail-rule"/><div className="detail-price">{formatCurrency(product.precio)}<small>PRECIO FINAL · ARS</small></div><div className="detail-availability"><i className={product.stock === 0 ? "stock-off" : ""}/>{product.stock === 0 ? "Agotado por ahora" : product.stock == null ? "Consultá disponibilidad" : `${product.stock} ejemplares disponibles`}</div>
        <button className="button button-primary detail-add" disabled={product.stock === 0} onClick={() => { add(product); setAdded(true); window.setTimeout(() => setAdded(false), 1800); }}>{added ? <><Icon name="check" size={18}/> Agregado a tu bolsa</> : <>Sumar a la bolsa <Icon name="bag" size={18}/></>}</button>
        <div className="detail-specs"><div><span>AUTORÍA</span><strong>{authors || "Archivo abierto"}</strong></div><div><span>EDITORIAL</span><strong>{typeof product.editorial === "object" ? product.editorial.nombre : "Edición independiente"}</strong></div><div><span>ISBN</span><strong>{product.isbn}</strong></div><div><span>ENVÍOS</span><strong>A todo el país</strong></div></div>
        <div className="detail-note"><Icon name="shield" size={18}/><span><strong>Compra protegida.</strong> Cada pedido se prepara con cuidado y viaja hasta tu puerta.</span></div>
      </div>
    </div>
  </section>;
}
