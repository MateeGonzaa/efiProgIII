import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/api";
import { mockCategories, mockProducts } from "@/lib/mock-data";
import type { Category, ProductDetails } from "@/lib/types";
import { matchCategory } from "@/lib/utils";
import { CatalogExplorer } from "@/components/catalog-explorer";

export const metadata: Metadata = { title: "Catálogo" };

export default async function CatalogPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const queryParams = await searchParams;
  const initialQuery = typeof queryParams.search === "string" ? queryParams.search : "";
  const rawCategory = typeof queryParams.categoria === "string" ? queryParams.categoria : "";
  const initialSort = typeof queryParams.ordering === "string" ? queryParams.ordering : "";
  const initialPage = typeof queryParams.page === "string" ? Math.max(1, Number(queryParams.page) || 1) : 1;
  let products: ProductDetails[] = mockProducts;
  let categories: Category[] = mockCategories;
  let demo = true;
  let initialCategory = "";
  try {
    // Primero las categorías: el menú manda nombres ("manga") y acá se convierten al id real de la API.
    categories = await getCategories();
    initialCategory = String(matchCategory(categories, rawCategory)?.id ?? "");
    const params = new URLSearchParams();
    if (initialQuery.trim()) params.set("search", initialQuery.trim());
    if (initialCategory) params.set("categoria", initialCategory);
    if (initialSort) params.set("ordering", initialSort);
    if (initialPage > 1) params.set("page", String(initialPage));
    products = (await getProducts(params)).results;
    demo = false;
  } catch {
    demo = true;
    products = mockProducts;
    categories = mockCategories;
    initialCategory = String(matchCategory(mockCategories, rawCategory)?.id ?? "");
  }

  return <section className="catalog-page page-shell">
    <div className="catalog-hero"><div><span className="eyebrow">ARCHIVO CENTRAL · ESTANTE A—Z</span><h1>El <em>catálogo.</em></h1><p>Todo lo que hace vibrar la imaginación, reunido en una sola cueva.</p></div><div className="catalog-big-index"><span>INVENTARIO</span><strong>{String(products.length).padStart(2, "0")}</strong><small>HISTORIAS ACTIVAS</small></div></div>
    <div className="catalog-hairline"><span>BUSCÁ TU PRÓXIMA OBSESIÓN</span><span>FILTRO DE FRECUENCIA · ON</span></div>
    <CatalogExplorer initialProducts={products} categories={categories} demo={demo} initialQuery={initialQuery} initialCategory={initialCategory} initialSort={initialSort} initialPage={initialPage}/>
  </section>;
}