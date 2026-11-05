import type { ProductDetails } from "@/lib/types";

const art = ["cover-art-one", "cover-art-two", "cover-art-three", "cover-art-four", "cover-art-five", "cover-art-six"];

export function ProductCover({ product, className = "" }: { product: Pick<ProductDetails, "id" | "titulo" | "categoria">; className?: string }) {
  const variant = art[(product.id - 1) % art.length];
  const category = typeof product.categoria === "object" ? product.categoria.nombre : "Edición de colección";
  return <div className={`product-cover ${variant} ${className}`} role="img" aria-label={`Portada conceptual de ${product.titulo}`}>
    <span className="cover-frame" />
    <span className="cover-kicker">FRIKICUEVA · ARCHIVO {String(product.id).padStart(2, "0")}</span>
    <span className="cover-art-mark" aria-hidden="true">{product.id % 2 ? "✳" : "◈"}</span>
    <span className="cover-title">{product.titulo}</span>
    <span className="cover-category">{category}</span>
    <span className="cover-edition">EDICIÓN DE COLECCIÓN</span>
  </div>;
}
