import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError, getAuthors, getStoreCategories, getProduct, getPublishers, getStock } from "@/lib/api";
import type { Author, Category, ProductDetails, Publisher } from "@/lib/types";
import { ProductEditor } from "@/components/product-editor";
import { ErrorNotice } from "@/components/status";
import { Icon } from "@/components/icon";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Editar producto" };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  let product: ProductDetails, categories: Category[], publishers: Publisher[], authors: Author[];
  try {
    product = await getProduct(id);
    [categories, publishers, authors] = await Promise.all([getStoreCategories(), getPublishers(), getAuthors()]);
  } catch (reason) {
    // Si el producto no existe mostramos la 404; cualquier otro error se muestra en pantalla.
    if (reason instanceof ApiError && reason.status === 404) notFound();
    return <div className="account-card editor-card"><ErrorNotice message={reason instanceof Error ? reason.message : "No pudimos cargar el producto."}/></div>;
  }
  // El stock vive en otro endpoint (inventario); si falla, el formulario arranca con el stock del producto.
  const inventory = await getStock(product.id).catch(() => null);
  return <div className="account-card editor-card"><div className="account-card-head"><div><span className="eyebrow">EDITAR PRODUCTO · {String(product.id).padStart(3, "0")}</span><h2>Editar edición.</h2></div><span className="account-head-icon"><Icon name="layers" size={22}/></span></div><p className="account-intro">Actualizá los datos de esta edición y guardá los cambios en el catálogo.</p><ProductEditor categories={categories} publishers={publishers} authors={authors} product={product} inventory={inventory}/></div>;
}
