"use client";

import { useEffect, useState } from "react";
import type { KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, createAuthor, createPublisher, saveStock } from "@/lib/api";
import type { StockInfo } from "@/lib/api";
import { productSchema, publisherSchema, type ProductValues } from "@/lib/schemas";
import { useAuth } from "@/components/providers";
import type { Author, Category, ProductDetails, Publisher } from "@/lib/types";
import { FormField } from "@/components/form-field";
import { ErrorNotice } from "@/components/status";
import { Icon } from "@/components/icon";
import { categoryLabel } from "@/lib/utils";

const idOf = (value: { id: number } | number) => (typeof value === "object" ? value.id : value);

export function ProductEditor({ categories, publishers, authors, product, inventory }: { categories: Category[]; publishers: Publisher[]; authors: Author[]; product?: ProductDetails; inventory?: StockInfo | null }) {
  const router = useRouter();
  const { session } = useAuth();
  const [apiError, setApiError] = useState("");
  const { register, handleSubmit, setValue, getValues, formState: { errors, isSubmitting } } = useForm<z.input<typeof productSchema>, unknown, ProductValues>({
    resolver: zodResolver(productSchema),
    // Los valores de selects y multiselect se cargan como texto (así los compara el navegador con el value de cada <option>).
    defaultValues: product ? {
      titulo: product.titulo,
      isbn: product.isbn,
      precio: Number(product.precio),
      categoria: String(idOf(product.categoria)),
      editorial: String(idOf(product.editorial)),
      autores: product.autores.map((author) => String(idOf(author))),
      imagen_url: product.imagen_url ?? "",
      stock: inventory?.cantidad_disponible ?? product.stock ?? 0,
      pasillo: inventory?.pasillo ?? "",
    } : { categoria: "", editorial: "", autores: [], stock: 0 },
  });

  // Autores: la lista se puede ampliar desde el mismo formulario y cada autor nuevo se guarda en la API.
  const [authorList, setAuthorList] = useState<Author[]>(authors);
  const [newAuthor, setNewAuthor] = useState("");
  const [newBio, setNewBio] = useState("");
  const [authorMsg, setAuthorMsg] = useState("");
  const [authorOk, setAuthorOk] = useState(true);
  const [authorBusy, setAuthorBusy] = useState(false);
  const [pendingAuthor, setPendingAuthor] = useState<number | null>(null);
  // El autor recién guardado se marca como elegido una vez que ya aparece en la lista.
  useEffect(() => {
    if (pendingAuthor === null) return;
    const selected = getValues("autores") as unknown;
    const current = (Array.isArray(selected) ? selected : []).map(String);
    setValue("autores", [...new Set([...current, String(pendingAuthor)])] as never);
    setPendingAuthor(null);
  }, [pendingAuthor, authorList, getValues, setValue]);
  const addAuthor = async () => {
    if (!session || !newAuthor.trim()) return;
    setAuthorBusy(true); setAuthorMsg("");
    try {
      const author = await createAuthor(session.token, newAuthor, newBio, authorList);
      const isNew = !authorList.some((item) => item.id === author.id);
      if (isNew) setAuthorList((list) => [...list, author].sort((a, b) => a.nombre.localeCompare(b.nombre, "es")));
      setPendingAuthor(author.id); setNewAuthor(""); setNewBio("");
      setAuthorOk(true); setAuthorMsg(isNew ? `Guardamos a ${author.nombre} en la API y lo dejamos elegido.` : `${author.nombre} ya existía: lo dejamos elegido.`);
    } catch (reason) { setAuthorOk(false); setAuthorMsg(reason instanceof Error ? reason.message : "No se pudo guardar el autor."); }
    finally { setAuthorBusy(false); }
  };

  // Editoriales: se agregan igual que los autores (POST /api/editoriales/) y la nueva queda elegida en el select.
  const [publisherList, setPublisherList] = useState<Publisher[]>(publishers);
  const [newPublisher, setNewPublisher] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [publisherMsg, setPublisherMsg] = useState("");
  const [publisherOk, setPublisherOk] = useState(true);
  const [publisherBusy, setPublisherBusy] = useState(false);
  const [pendingPublisher, setPendingPublisher] = useState<number | null>(null);
  // La opción nueva tiene que existir en el <select> antes de poder elegirla, por eso se espera a que se renderice la lista.
  useEffect(() => {
    if (pendingPublisher === null) return;
    setValue("editorial", String(pendingPublisher) as never, { shouldValidate: true });
    setPendingPublisher(null);
  }, [pendingPublisher, publisherList, setValue]);
  const addPublisher = async () => {
    if (!session || !newPublisher.trim()) return;
    const parsed = publisherSchema.safeParse({ nombre: newPublisher, pais: newCountry });
    if (!parsed.success) { setPublisherOk(false); setPublisherMsg(parsed.error.issues[0]?.message ?? "Revisá los datos de la editorial."); return; }
    setPublisherBusy(true); setPublisherMsg("");
    try {
      const publisher = await createPublisher(session.token, parsed.data.nombre, parsed.data.pais ?? "", publisherList);
      const isNew = !publisherList.some((item) => item.id === publisher.id);
      if (isNew) setPublisherList((list) => [...list, publisher].sort((a, b) => a.nombre.localeCompare(b.nombre, "es")));
      setPendingPublisher(publisher.id); setNewPublisher(""); setNewCountry("");
      setPublisherOk(true); setPublisherMsg(isNew ? `Guardamos la editorial ${publisher.nombre} en la API y la dejamos elegida.` : `${publisher.nombre} ya existía: la dejamos elegida.`);
    } catch (reason) { setPublisherOk(false); setPublisherMsg(reason instanceof Error ? reason.message : "No se pudo guardar la editorial."); }
    finally { setPublisherBusy(false); }
  };
  const onEnter = (action: () => Promise<void>) => (event: KeyboardEvent<HTMLInputElement>) => { if (event.key === "Enter") { event.preventDefault(); void action(); } };

  // Si la categoría del producto quedó fuera de la lista (por una categoría repetida) se conserva para no perderla al editar.
  const productCategory = product && typeof product.categoria === "object" ? product.categoria : null;
  const categoryOptions = productCategory && !categories.some((item) => item.id === productCategory.id) ? [...categories, productCategory] : categories;
  // Sirve para crear (POST) y editar (PATCH). El stock va aparte porque la API lo maneja en /inventario.
  const onSubmit = handleSubmit(async (values) => {
    if (!session) { setApiError("Tu sesión venció. Iniciá sesión de nuevo para guardar."); return; }
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
    <div className="editor-form-grid">
      <FormField label="TÍTULO" error={errors.titulo?.message}><input placeholder="Nombre de la edición" {...register("titulo")}/></FormField>
      <FormField label="CÓDIGO DE BARRAS" error={errors.isbn?.message}><input placeholder="Código de barras de la edición" {...register("isbn")}/></FormField>
      <FormField label="PRECIO (ARS)" error={errors.precio?.message}><input type="number" min="1" step="0.01" placeholder="9500" {...register("precio")}/></FormField>
      <FormField label="CATEGORÍA" error={errors.categoria?.message}><select {...register("categoria")}><option value="" disabled>Elegí una categoría</option>{categoryOptions.map((item) => <option key={item.id} value={item.id}>{categoryLabel(item.nombre)}</option>)}</select></FormField>
      <FormField label="EDITORIAL" error={errors.editorial?.message}><select {...register("editorial")}><option value="" disabled>Elegí una editorial</option>{publisherList.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></FormField>
      <FormField label="AUTORES" error={errors.autores?.message}><select multiple size={Math.min(4, Math.max(authorList.length, 2))} {...register("autores")}>{authorList.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select><small className="field-hint">Usá Ctrl / ⌘ para elegir más de una.</small></FormField>
      <div className="author-adder">
        <span className="author-adder-title">¿No está el autor? Agregalo acá</span>
        <div className="author-adder-row">
          <input value={newAuthor} onChange={(event) => setNewAuthor(event.target.value)} onKeyDown={onEnter(addAuthor)} placeholder="Nombre del autor" aria-label="Nombre del nuevo autor" maxLength={120}/>
          <input value={newBio} onChange={(event) => setNewBio(event.target.value)} onKeyDown={onEnter(addAuthor)} placeholder="Biografía corta (opcional)" aria-label="Biografía del nuevo autor"/>
          <button type="button" className="button button-quiet" onClick={() => void addAuthor()} disabled={authorBusy || !newAuthor.trim()}>{authorBusy ? "AGREGANDO…" : "AGREGAR AUTOR"}</button>
        </div>
        {authorMsg && <small className={authorOk ? "field-hint" : "field-error"} role="status">{authorMsg}</small>}
      </div>
      <div className="author-adder publisher-adder">
        <span className="author-adder-title">¿No está la editorial? Agregala acá</span>
        <div className="author-adder-row">
          <input value={newPublisher} onChange={(event) => setNewPublisher(event.target.value)} onKeyDown={onEnter(addPublisher)} placeholder="Nombre de la editorial" aria-label="Nombre de la nueva editorial" maxLength={120}/>
          <input value={newCountry} onChange={(event) => setNewCountry(event.target.value)} onKeyDown={onEnter(addPublisher)} placeholder="País (opcional)" aria-label="País de la nueva editorial" maxLength={60}/>
          <button type="button" className="button button-quiet" onClick={() => void addPublisher()} disabled={publisherBusy || !newPublisher.trim()}>{publisherBusy ? "AGREGANDO…" : "AGREGAR EDITORIAL"}</button>
        </div>
        {publisherMsg && <small className={publisherOk ? "field-hint" : "field-error"} role="status">{publisherMsg}</small>}
      </div>
      <FormField label="IMAGEN DE PORTADA (OPCIONAL)" error={errors.imagen_url?.message} hint="Link https://… directo a la imagen. Si lo dejás vacío, se usa la ilustración."><input type="text" placeholder="https://…" {...register("imagen_url")}/></FormField>
      <FormField label="STOCK DISPONIBLE" error={errors.stock?.message}><input type="number" min="0" step="1" placeholder="10" {...register("stock")}/></FormField>
      <FormField label="PASILLO" error={errors.pasillo?.message}><input placeholder="B3" {...register("pasillo")}/></FormField>
    </div>
    <div className="editor-actions"><button type="button" className="button button-quiet" onClick={() => router.push("/admin/productos")}>Cancelar</button><button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "GUARDANDO…" : product ? "GUARDAR CAMBIOS" : "CREAR PRODUCTO"}<Icon name="arrow" size={16}/></button></div>
  </form>;
}