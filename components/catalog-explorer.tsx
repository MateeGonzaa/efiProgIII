"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getProducts } from "@/lib/api";
import { filterProducts, slugify } from "@/lib/utils";
import type { Category, ProductDetails } from "@/lib/types";
import { useCart } from "@/components/providers";
import { ProductGrid } from "@/components/product-grid";
import { Icon } from "@/components/icon";
import { ApiBanner, EmptyState, ErrorNotice, LoadingGrid } from "@/components/status";

export function CatalogExplorer({ initialProducts, categories, demo, initialQuery = "", initialCategory = "", initialSort = "", initialPage = 1 }: { initialProducts: ProductDetails[]; categories: Category[]; demo: boolean; initialQuery?: string; initialCategory?: string; initialSort?: string; initialPage?: number }) {
  const router = useRouter();
  const { add } = useCart();
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);
  const [count, setCount] = useState(initialProducts.length);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [usingDemo, setUsingDemo] = useState(demo);
  const filteredDemo = useMemo(() => {
    let result = filterProducts(products, query);
    if (category) result = result.filter((product) => typeof product.categoria === "object" && product.categoria.id === Number(category));
    if (sort === "precio") result = [...result].sort((a, b) => Number(a.precio) - Number(b.precio));
    if (sort === "-precio") result = [...result].sort((a, b) => Number(b.precio) - Number(a.precio));
    if (sort === "titulo") result = [...result].sort((a, b) => a.titulo.localeCompare(b.titulo, "es-AR"));
    return result;
  }, [products, query, category, sort]);

  const apiKey = (q: string, c: string, o: string, p: number) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("search", q.trim());
    if (c) params.set("categoria", c);
    if (o) params.set("ordering", o);
    if (p > 1) params.set("page", String(p));
    return params;
  };
  // La URL lleva el nombre de la categoría (?categoria=manga); a la API se le manda el id.
  const urlKey = (q: string, c: string, o: string, p: number) => {
    const params = apiKey(q, "", o, p);
    const name = categories.find((item) => String(item.id) === c)?.nombre;
    if (name) params.set("categoria", slugify(name));
    return params.toString();
  };
  const loaded = useRef(apiKey(initialQuery, initialCategory, initialSort, initialPage).toString());
  const written = useRef<string[]>([urlKey(initialQuery, initialCategory, initialSort, initialPage)]);

  // Si la URL cambia desde afuera (por ejemplo, al tocar Manga en el menú), el estado la sigue.
  useEffect(() => {
    const incoming = urlKey(initialQuery, initialCategory, initialSort, initialPage);
    const at = written.current.indexOf(incoming);
    if (at >= 0) { written.current.splice(0, at + 1); return; }
    written.current = [];
    setQuery(initialQuery); setCategory(initialCategory); setSort(initialSort); setPage(initialPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, initialCategory, initialSort, initialPage]);

  useEffect(() => {
    if (usingDemo) return;
    const params = apiKey(query, category, sort, page);
    const key = params.toString();
    if (key === loaded.current) return; // ya vino resuelto desde el servidor: no recargamos ni parpadea
    const timer = window.setTimeout(() => {
      loaded.current = key;
      setBusy(true);
      getProducts(params).then((data) => {
        setProducts(data.results);
        setCount(data.count);
        setError("");
      }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "No se pudo actualizar el catálogo.")).finally(() => setBusy(false));
    }, query ? 300 : 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, sort, page, usingDemo]);

  useEffect(() => {
    const key = urlKey(query, category, sort, page);
    if (written.current[written.current.length - 1] === key) return;
    if (key === new URLSearchParams(window.location.search).toString()) return;
    written.current.push(key);
    router.replace(`/catalogo${key ? `?${key}` : ""}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, sort, page, router]);

  const shown = usingDemo ? filteredDemo : products;
  return <>
    <div className="catalog-controls">
      <label className="catalog-search"><Icon name="search" size={18}/><input type="search" placeholder="Buscá un título, autor o mundo…" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }}/><kbd>⌘ K</kbd></label>
      <div className="mt-4 flex w-full flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">{[{ id: 0, nombre: "Todo" }, ...categories].map((item) => { const active = String(item.id || "") === category; return <button key={item.id} type="button" aria-pressed={active} className={`category-chip ${active ? "is-active" : ""}`} onClick={() => { setCategory(item.id ? String(item.id) : ""); setPage(1); }}>{item.nombre}</button>; })}</div>
      <label className="catalog-sort"><span>ORDENAR</span><select aria-label="Ordenar catálogo" value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}><option value="">Recomendados</option><option value="precio">Precio: menor a mayor</option><option value="-precio">Precio: mayor a menor</option><option value="titulo">Título A — Z</option></select></label>
    </div>
    {usingDemo && <ApiBanner/>}
    {error && <ErrorNotice message={error} onRetry={() => setUsingDemo(false)}/>}
    <div className="catalog-meta"><span>{usingDemo ? shown.length : count} EDICIONES EN EL ARCHIVO</span><span>{query || category ? "FILTROS ACTIVOS" : "ACTUALIZADO EN TIEMPO REAL"}</span></div>
    {busy && !shown.length ? <LoadingGrid/> : shown.length ? <div className={busy ? "grid-busy" : ""}><ProductGrid products={shown} onAdd={add}/></div> : <EmptyState icon="search" title="No encontramos esa historia" body="Probá con otro título o quitá alguno de los filtros."/>}
    {!usingDemo && <div className="pagination"><button className="button button-quiet" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1 || busy}>Anterior</button><span>PÁGINA <strong>{page}</strong></span><button className="button button-quiet" onClick={() => setPage((value) => value + 1)} disabled={page * 10 >= count || busy}>Siguiente <Icon name="arrow" size={14}/></button></div>}
  </>;
}