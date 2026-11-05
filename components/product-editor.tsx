"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, saveStock } from "@/lib/api";
import type { StockInfo } from "@/lib/api";
import { productSchema, type ProductValues } from "@/lib/schemas";
import { useAuth } from "@/components/providers";
import type { Author, Category, ProductDetails, Publisher } from "@/lib/types";
import { FormField } from "@/components/form-field";
import { ErrorNotice } from "@/components/status";
import { Icon } from "@/components/icon";

export function ProductEditor({ categories, publishers, authors, product, inventory }: { categories: Category[]; publishers: Publisher[]; authors: Author[]; product?: ProductDetails; inventory?: StockInfo | null }) {
  const router = useRouter();
  const { session } = useAuth();
  const [apiError, setApiError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.input<typeof productSchema>, unknown, ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      titulo: product.titulo,
      isbn: product.isbn,
      precio: Number(product.precio),
      categoria: Number(typeof product.categoria === "object" ? product.categoria.id : product.categoria),
      editorial: Number(typeof product.editorial === "object" ? product.editorial.id : product.editorial),
      autores: product.autores.map((author) => Number(typeof author === "object" ? author.id : author)),
      imagen_url: product.imagen_url ?? "",
<<<<<<< HEAD
=======
      imagen_url: product.imagen_url ?? "",
>>>>>>> 5897f30 (mejoras efi)
      stock: inventory?.cantidad_disponible ?? product.stock ?? 0,
      pasillo: inventory?.pasillo ?? "",
    } : { autores: [], stock: 0 },
  });
  const onSubmit = handleSubmit(async (values) => {
    if (!session) return;
    setApiError("");
    try {
      const { stock, pasillo, ...data } = values;
      const saved = await apiRequest<{ id: number }>(product ? `productos/${product.id}/` : "productos/", { method: product ? "PATCH" : "POST", token: session.token, body: JSON.stringify(data) });
      // Sin inventario el backend rechaza cualquier compra del producto, por eso se guarda junto con él.
      await saveStock(session.token, saved.id, stock, pasillo);
      router.push("/admin/productos"); router.refresh();
    } catch (reason) { setApiError(reason instanceof Error ? reason.message : "No se pudo guardar el producto."); }
  });
  return <form className="product-editor-form" onSubmit={onSubmit} noValidate>
    {apiError && <ErrorNotice message={apiError}/>}
    <div className="editor-form-grid"><FormField label="TÍTULO" error={errors.titulo?.message}><input placeholder="Nombre de la edición" {...register("titulo")}/></FormField><FormField label="ISBN" error={errors.isbn?.message}><input placeholder="978-..." {...register("isbn")}/></FormField><FormField label="PRECIO (ARS)" error={errors.precio?.message}><input type="number" min="1" step="0.01" placeholder="9500" {...register("precio")}/></FormField><FormField label="CATEGORÍA" error={errors.categoria?.message}><select defaultValue={product ? String(typeof product.categoria === "object" ? product.categoria.id : product.categoria) : ""} {...register("categoria")}><option value="" disabled>Elegí una categoría</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></FormField><FormField label="EDITORIAL" error={errors.editorial?.message}><select defaultValue={product ? String(typeof product.editorial === "object" ? product.editorial.id : product.editorial) : ""} {...register("editorial")}><option value="" disabled>Elegí una editorial</option>{publishers.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></FormField><FormField label="AUTORÍA" error={errors.autores?.message}><select multiple size={Math.min(4, Math.max(authors.length, 2))} {...register("autores")}>{authors.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select><small className="field-hint">Usá Ctrl / ⌘ para elegir más de una.</small></FormField><FormField label="URL DE PORTADA" error={errors.imagen_url?.message} hint="Opcional · si la dejás vacía se busca por ISBN"><input type="url" placeholder="https://…/portada.jpg" {...register("imagen_url")}/></FormField><FormField label="URL DE PORTADA (OPCIONAL)" error={errors.imagen_url?.message} hint="Si la dejás vacía, la tienda busca la portada sola."><input type="url" placeholder="https://…/portada.jpg" {...register("imagen_url")}/></FormField><FormField label="STOCK DISPONIBLE" error={errors.stock?.message}><input type="number" min="0" step="1" placeholder="10" {...register("stock")}/></FormField><FormField label="PASILLO" error={errors.pasillo?.message}><input placeholder="B3" {...register("pasillo")}/></FormField></div>
    <div className="editor-actions"><button type="button" className="button button-quiet" onClick={() => router.back()}>Cancelar</button><button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "GUARDANDO…" : product ? "GUARDAR CAMBIOS" : "CREAR PRODUCTO"}<Icon name="arrow" size={16}/></button></div>
  </form>;
}
