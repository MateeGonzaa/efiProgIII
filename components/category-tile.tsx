import Link from "next/link";
import type { ProductDetails } from "@/lib/types";
import { authorNames, startingPrice } from "@/lib/categories";
import { formatCurrency } from "@/lib/utils";
import { CoverArt } from "@/components/cover-art";
import type { CoverKind } from "@/components/cover-art";
import { ProductCover } from "@/components/product-cover";
import { Icon } from "@/components/icon";

type Props = {
  kind: CoverKind;
  href: string;
  tag: string;
  title: string;
  description: string;
  cta: string;
  products: ProductDetails[];
  seed: number;
};

/**
 * Tarjeta de categoría del inicio. Es un Server Component: solo muestra datos que ya vienen del servidor
 * (las tapas de la categoría, el precio más bajo y los autores) y no necesita estado ni eventos.
 */
export function CategoryTile({ kind, href, tag, title, description, cta, products, seed }: Props) {
  const price = startingPrice(products);
  const authors = authorNames(products);
  return <Link href={href} className={`cat-tile cat-${kind}`}>
    <CoverArt kind={kind} seed={seed} className="cat-backdrop"/>
    <div className="cat-stage" aria-hidden={products.length ? undefined : true}>
      {products.length
        ? products.map((product, index) => <div key={product.id} className={`cat-cover cat-cover-${index + 1}`}><ProductCover product={product}/></div>)
        : <div className="cat-cover cat-cover-1 cat-cover-art"><CoverArt kind={kind} seed={seed + 1}/></div>}
    </div>
    <div className="cat-body">
      <span className="cat-tag">{tag}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {(price !== null || authors.length > 0) && <ul className="cat-facts">
        {price !== null && <li>Desde {formatCurrency(price)}</li>}
        {authors.length > 0 && <li>{authors.join(" · ")}</li>}
      </ul>}
      <span className="cat-cta">{cta} <Icon name="arrow" size={15}/></span>
    </div>
  </Link>;
}
