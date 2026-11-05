import type { Metadata } from "next";
import { getAuthors, getCategories, getPublishers } from "@/lib/api";
import { mockCategories } from "@/lib/mock-data";
import { ProductEditor } from "@/components/product-editor";
import { Icon } from "@/components/icon";

export const metadata: Metadata = { title: "Nuevo producto" };

export default async function NewProductPage() {
  let categories = mockCategories, publishers = [{ id: 1, nombre: "Panini Comics" }, { id: 2, nombre: "Ivrea" }, { id: 3, nombre: "Minotauro" }], authors = [{ id: 1, nombre: "Stan Lee" }, { id: 2, nombre: "Eiichiro Oda" }, { id: 3, nombre: "J. R. R. Tolkien" }, { id: 4, nombre: "Kentaro Miura" }, { id: 5, nombre: "Akira Toriyama" }];
  try { [categories, publishers, authors] = await Promise.all([getCategories(), getPublishers(), getAuthors()]); } catch { /* Demo options keep the form reviewable while the API is offline. */ }
  return <div className="account-card editor-card"><div className="account-card-head"><div><span className="eyebrow">ALTA DE OBJETO · CATÁLOGO</span><h2>Nueva edición.</h2></div><span className="account-head-icon"><Icon name="plus" size={22}/></span></div><p className="account-intro">Completá la ficha. Las validaciones corren en el formulario y el backend confirma el guardado.</p><ProductEditor categories={categories} publishers={publishers} authors={authors}/></div>;
}
