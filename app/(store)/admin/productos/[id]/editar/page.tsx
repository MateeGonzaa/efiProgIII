import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuthors, getCategories, getProduct, getPublishers } from "@/lib/api";
import { mockCategories, mockProducts } from "@/lib/mock-data";
import { ProductEditor } from "@/components/product-editor";
import { Icon } from "@/components/icon";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Editar producto" };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  let product;
  try { product = await getProduct(id); }
  catch { product = mockProducts.find((item) => item.id === Number(id)); }
  if (!product) notFound();
  let categories = mockCategories, publishers = [{ id: 1, nombre: "Panini Comics" }, { id: 2, nombre: "Ivrea" }, { id: 3, nombre: "Minotauro" }], authors = [{ id: 1, nombre: "Stan Lee" }, { id: 2, nombre: "Eiichiro Oda" }, { id: 3, nombre: "J. R. R. Tolkien" }, { id: 4, nombre: "Kentaro Miura" }, { id: 5, nombre: "Akira Toriyama" }];
  try { [categories, publishers, authors] = await Promise.all([getCategories(), getPublishers(), getAuthors()]); } catch { /* Demo options keep the form reviewable while the API is offline. */ }
  return <div className="account-card editor-card"><div className="account-card-head"><div><span className="eyebrow">EDITAR OBJETO · {String(product.id).padStart(3, "0")}</span><h2>Editar edición.</h2></div><span className="account-head-icon"><Icon name="layers" size={22}/></span></div><p className="account-intro">Actualizá los datos de esta edición y guardá los cambios en el catálogo.</p><ProductEditor categories={categories} publishers={publishers} authors={authors} product={product}/></div>;
}
