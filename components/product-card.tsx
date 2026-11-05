import Link from "next/link";
import type { ProductDetails } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { ProductCover } from "@/components/product-cover";
import { Icon } from "@/components/icon";

export function ProductCard({ product, onAdd }: { product: ProductDetails; onAdd?: (product: ProductDetails) => void }) {
  const category = typeof product.categoria === "object" ? product.categoria.nombre : "Colección";
  return <article className="product-card">
    <Link href={`/catalogo/${product.id}`} className="product-card-art" aria-label={`Ver ${product.titulo}`}>
      <span className="product-card-index">FC / {String(product.id).padStart(2, "0")}</span>
      <ProductCover product={product} />
      <span className="product-card-quick">Ver edición <Icon name="arrow" size={15}/></span>
    </Link>
    <div className="product-card-info">
      <span className="product-category">{category}</span>
      <Link href={`/catalogo/${product.id}`}><h3>{product.titulo}</h3></Link>
      <div className="product-card-bottom"><strong>{formatCurrency(product.precio)}</strong><span className="stock-label">{product.stock === 0 ? "Agotado" : "En stock"}</span></div>
    </div>
    {onAdd && <button className="product-add" onClick={() => onAdd(product)} aria-label={`Agregar ${product.titulo} al carrito`} disabled={product.stock === 0}><Icon name="plus" size={17}/></button>}
  </article>;
}
