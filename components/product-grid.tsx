import type { ProductDetails } from "@/lib/types";
import { ProductCard } from "@/components/product-card";

export function ProductGrid({ products, onAdd }: { products: ProductDetails[]; onAdd?: (product: ProductDetails) => void }) {
  if (!products.length) return null;
  return <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd}/>)}</div>;
}
