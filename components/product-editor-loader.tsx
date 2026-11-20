"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ApiError, getAuthors, getProduct, getPublishers, getStock, getStoreCategories } from "@/lib/api";
import type { StockInfo } from "@/lib/api";
import type { Author, Category, ProductDetails, Publisher } from "@/lib/types";
import { ProductEditor } from "@/components/product-editor";
import { ErrorNotice } from "@/components/status";

type EditorData = { categories: Category[]; publishers: Publisher[]; authors: Author[]; product?: ProductDetails; inventory?: StockInfo | null };

/**
 * Carga desde el navegador todo lo que necesita el formulario de producto (categorías, editoriales, autores y,
 * si se está editando, el producto con su inventario). Se hace en el cliente a propósito: si estas llamadas se
 * hacen desde el servidor de Vercel, el firewall de la API puede pedir una verificación de seguridad y bloquearlas.
 */
export function ProductEditorLoader({ productId }: { productId?: string }) {
  const [data, setData] = useState<EditorData | null>(null);
  const [error, setError] = useState("");
  const [missing, setMissing] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => { setError(""); setData(null); setAttempt((value) => value + 1); }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [categories, publishers, authors, product] = await Promise.all([
          getStoreCategories(), getPublishers(), getAuthors(),
          productId ? getProduct(productId) : Promise.resolve(undefined),
        ]);
        // El stock vive en otro endpoint (inventario); si falla, el formulario arranca con el stock del producto.
        const inventory = product ? await getStock(product.id).catch(() => null) : undefined;
        if (!cancelled) setData({ categories, publishers, authors, product, inventory });
      } catch (reason) {
        if (cancelled) return;
        if (reason instanceof ApiError && reason.status === 404) setMissing(true);
        else setError(reason instanceof Error ? reason.message : "No pudimos cargar los datos del formulario.");
      }
    })();
    return () => { cancelled = true; };
  }, [productId, attempt]);

  if (missing) return <div><ErrorNotice message="No encontramos ese producto. Puede que ya haya sido eliminado."/><p className="account-intro"><Link className="text-link" href="/admin/productos">Volver a los productos</Link></p></div>;
  if (error) return <ErrorNotice message={error} onRetry={retry}/>;
  if (!data) return <div className="account-loading"><span className="loading-orbit"/>CARGANDO FORMULARIO…</div>;
  return <ProductEditor key={productId ?? "nuevo"} {...data}/>;
}
