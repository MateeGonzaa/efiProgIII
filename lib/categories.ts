import type { ProductDetails } from "@/lib/types";
import { slugify } from "@/lib/utils";

export type CategoryKey = "comics" | "manga" | "libros";

/** Agrupa las categorías del backend en las tres secciones de la tienda. */
export function categoryKey(name?: string): CategoryKey {
  const n = slugify(name ?? "");
  if (n.startsWith("manga")) return "manga";
  if (n.startsWith("fant") || n.startsWith("libro")) return "libros";
  return "comics";
}

function keyOf(product: ProductDetails): CategoryKey {
  return categoryKey(typeof product.categoria === "object" ? product.categoria.nombre : "");
}

/** Hasta `limit` productos de una sección, priorizando los que tienen stock. */
export function pickForCategory(products: ProductDetails[], key: CategoryKey, limit = 3): ProductDetails[] {
  const inCategory = products.filter((product) => keyOf(product) === key);
  const available = inCategory.filter((product) => product.stock !== 0);
  const rest = inCategory.filter((product) => product.stock === 0);
  return [...available, ...rest].slice(0, limit);
}

/** Precio más bajo de una lista, o null si está vacía. */
export function startingPrice(products: ProductDetails[]): number | null {
  const prices = products.map((product) => Number(product.precio)).filter((price) => Number.isFinite(price) && price > 0);
  return prices.length ? Math.min(...prices) : null;
}

/** Nombres de autores sin repetir, en el orden en que aparecen. */
export function authorNames(products: ProductDetails[], max = 3): string[] {
  const names: string[] = [];
  for (const product of products) {
    for (const author of product.autores) {
      if (!names.includes(author.nombre)) names.push(author.nombre);
    }
  }
  return names.slice(0, max);
}
