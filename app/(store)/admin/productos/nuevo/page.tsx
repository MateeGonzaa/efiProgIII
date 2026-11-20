import type { Metadata } from "next";
import { getAuthors, getStoreCategories, getPublishers } from "@/lib/api";
import type { Author, Category, Publisher } from "@/lib/types";
import { ProductEditor } from "@/components/product-editor";
import { ErrorNotice } from "@/components/status";
import { Icon } from "@/components/icon";

export const metadata: Metadata = { title: "Nuevo producto" };

export default async function NewProductPage() {
  // Las opciones de los selects vienen de la API. Si falla, mostramos el error en vez de usar datos inventados.
  let categories: Category[], publishers: Publisher[], authors: Author[];
  try { [categories, publishers, authors] = await Promise.all([getStoreCategories(), getPublishers(), getAuthors()]); }
  catch (reason) { return <div className="account-card editor-card"><ErrorNotice message={reason instanceof Error ? reason.message : "No pudimos cargar las opciones del formulario."}/></div>; }
  return <div className="account-card editor-card"><div className="account-card-head"><div><span className="eyebrow">NUEVO PRODUCTO</span><h2>Nueva edición.</h2></div><span className="account-head-icon"><Icon name="plus" size={22}/></span></div><p className="account-intro">Completá los datos de la edición. Se validan antes de guardar y el backend confirma el guardado.</p><ProductEditor categories={categories} publishers={publishers} authors={authors}/></div>;
}
