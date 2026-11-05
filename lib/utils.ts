import type { ProductDetails } from "@/lib/types";

export function formatCurrency(value: number | string): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function categoryName(value: ProductDetails["categoria"] | number | undefined) {
  return typeof value === "object" && value ? value.nombre : "Edición especial";
}

export function getApiMessage(payload: unknown): string {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.detail === "string") return record.detail;
    const first = Object.values(record)[0];
    if (Array.isArray(first) && typeof first[0] === "string") return first[0];
    if (typeof first === "string") return first;
  }
  return "No pudimos completar la operación. Intentá de nuevo.";
}

export function filterProducts(products: ProductDetails[], search: string) {
  const normalized = search.trim().toLocaleLowerCase("es-AR");
  if (!normalized) return products;
  return products.filter((product) =>
    [product.titulo, product.categoria.nombre, product.editorial.nombre, ...product.autores.map((author) => author.nombre)]
      .join(" ")
      .toLocaleLowerCase("es-AR")
      .includes(normalized),
  );
}


export function slugify(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Acepta un id ("2") o un nombre/slug ("manga", "comics", "fantasia") y devuelve la categoría que corresponde. */
export function matchCategory<T extends { id: number; nombre: string }>(categories: T[], value: string): T | undefined {
  const v = slugify(value);
  if (!v) return undefined;
  return categories.find((c) => String(c.id) === value.trim() || slugify(c.nombre) === v || slugify(c.nombre).startsWith(v) || `${slugify(c.nombre)}s` === v);
}

/** Fuentes directas de portada, en orden de prioridad: URL cargada en el admin y portada de Open Library por ISBN. */
export function coverCandidates(product: { isbn?: string; imagen_url?: string | null }): string[] {
  const list: string[] = [];
  if (product.imagen_url) list.push(product.imagen_url);
  const isbn = product.isbn?.replace(/[^0-9X]/gi, "");
  if (isbn && isbn.length >= 10) list.push(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`);
  return list;
}

/** Limpia un título ("One Piece Vol. 1: Romance Dawn") para buscarlo en Open Library. */
export function coverSearchQuery(title: string): string {
  return title.replace(/\b(vol(umen)?|tomo|n[º°])\.?\s*\d+/gi, " ").replace(/[:·–—-]/g, " ").replace(/\s+/g, " ").trim();
}

