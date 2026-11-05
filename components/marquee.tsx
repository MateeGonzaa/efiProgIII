import type { ProductDetails } from "@/lib/types";

/** Server Component: no necesita estado ni eventos; la animación es solo CSS. */
export function Marquee({ products }: { products: ProductDetails[] }) {
  const items = products.map((product) => product.titulo);
  return <div className="marquee flex overflow-hidden border-y py-4" aria-hidden="true">
    {[0, 1].map((copy) => <div key={copy} className="marquee-track flex shrink-0 items-center gap-10 pr-10">
      {items.map((title, index) => <span key={`${copy}-${index}`} className="flex items-center gap-10 whitespace-nowrap">{title}<i>✳</i></span>)}
    </div>)}
  </div>;
}
