"use client";

import { useState } from "react";
import type { ProductDetails } from "@/lib/types";
import { useCart } from "@/components/providers";
import { ProductGrid } from "@/components/product-grid";
import { Icon } from "@/components/icon";

export function ProductShelf({ products }: { products: ProductDetails[] }) {
  const { add } = useCart();
  const [notice, setNotice] = useState("");
  const handleAdd = (product: ProductDetails) => {
    add(product);
    setNotice(`${product.titulo} ya está en tu bolsa.`);
    window.setTimeout(() => setNotice(""), 2400);
  };
  return <><ProductGrid products={products} onAdd={handleAdd}/>{notice && <div className="toast" role="status"><Icon name="check" size={17}/>{notice}<button aria-label="Cerrar aviso" onClick={() => setNotice("")}><Icon name="close" size={15}/></button></div>}</>;
}
