"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getProducts } from "@/lib/api";
import { filterProducts } from "@/lib/utils";
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

  useEffect(() => {
    if (usingDemo) return;
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (category) params.set("categoria", category);
    if (sort) params.set("ordering", sort);
    if (page > 1) params.set("page", String(page));
    const timer = window.setTimeout(() => {
      setBusy(true);
      getProducts(params).then((data) => {
        setProducts(data.results);
        setCount(data.count);
        setError("");
      }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "No se pudo actualizar el catálogo.")).finally(() => setBusy(false));
    }, query ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [query, category, sort, page, usingDemo]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (category) params.set("categoria", category);
    if (sort) params.set("ordering", sort);
    if (page > 1) params.set("page", String(page));
    router.replace(`/catalogo${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
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
    {busy ? <LoadingGrid/> : shown.length ? <ProductGrid products={shown} onAdd={add}/> : <EmptyState icon="search" title="No encontramos esa historia" body="Probá con otro título o quitá alguno de los filtros."/>}
    {!usingDemo && <div className="pagination"><button className="button button-quiet" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1 || busy}>Anterior</button><span>PÁGINA <strong>{page}</strong></span><button className="button button-quiet" onClick={() => setPage((value) => value + 1)} disabled={page * 10 >= count || busy}>Siguiente <Icon name="arrow" size={14}/></button></div>}
  </>;
}
