import { uniqueCategories } from "@/lib/utils";
import type { ApiPage, Author, Category, CustomerProfile, Order, Product, ProductDetails, Publisher } from "@/lib/types";

export const UNAUTHORIZED_EVENT = "frikicueva:unauthorized";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function apiUrl(path: string) {
  return `${API_BASE}/${path.replace(/^\//, "")}`;
}

// Función base para hablar con la API: agrega el token si hay sesión, arma el JSON y convierte los errores en ApiError.
export async function apiRequest<T>(path: string, options: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, headers, ...rest } = options;
  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      ...rest,
      headers: {
        ...(rest.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Token ${token}` } : {}),
        ...headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiError("No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.", 0);
  }
  if (response.status === 204) return undefined as T;
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    // Token vencido o inválido: avisamos a la app para que cierre la sesión guardada.
    if (response.status === 401 && token && typeof window !== "undefined") window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    throw new ApiError(extractApiError(payload), response.status, payload);
  }
  return payload as T;
}

// Saca un mensaje legible del error que devuelve DRF para mostrarlo en el formulario.
export function extractApiError(payload: unknown): string {
  if (typeof payload === "string") {
    const text = payload.trim();
    // Si el servidor devuelve una página web (por ejemplo la verificación de seguridad de Cloudflare)
    // no mostramos el HTML: lo reemplazamos por un mensaje corto.
    if (/<\s*(!doctype|html|head|body)/i.test(text)) {
      return /just a moment|challenge-platform|cloudflare/i.test(text)
        ? "El servidor de la API pidió una verificación de seguridad y bloqueó la solicitud. Esperá unos segundos y probá de nuevo."
        : "El servidor respondió con una página en lugar de datos. Probá de nuevo en un momento.";
    }
    return text.length > 200 ? "El servidor respondió con un error inesperado. Probá de nuevo en un momento." : text;
  }
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.detail === "string") return record.detail;
    for (const [field, value] of Object.entries(record)) {
      // Errores generales de DRF (ej. login incorrecto) se muestran sin el nombre del campo.
      const prefix = field === "non_field_errors" ? "" : `${field}: `;
      if (Array.isArray(value) && typeof value[0] === "string") return `${prefix}${value[0]}`;
      if (typeof value === "string") return `${prefix}${value}`;
    }
  }
  return "No pudimos conectar con el catálogo. Revisá la API e intentá de nuevo.";
}

export async function getProducts(params?: URLSearchParams): Promise<ApiPage<ProductDetails>> {
  const query = params?.toString() ? `?${params.toString()}` : "";
  return apiRequest<ApiPage<ProductDetails>>(`productos/${query}`);
}

// El detalle necesita categoría, editorial y autores completos, por eso se piden varios endpoints en paralelo.
export async function getProduct(id: string | number): Promise<ProductDetails> {
  const product = await apiRequest<Product>(`productos/${id}/`);
  const categoryId = typeof product.categoria === "number" ? product.categoria : product.categoria.id;
  const publisherId = typeof product.editorial === "number" ? product.editorial : product.editorial.id;
  const authorIds = product.autores.map((author) => typeof author === "number" ? author : author.id);
  const [category, publisher, authorRows, matchingPage] = await Promise.all([
    apiRequest<Category>(`categorias/${categoryId}/`),
    apiRequest<Publisher>(`editoriales/${publisherId}/`),
    Promise.all(authorIds.map((authorId) => apiRequest<Author>(`autores/${authorId}/`))),
    apiRequest<ApiPage<ProductDetails>>(`productos/?search=${encodeURIComponent(product.titulo)}`).catch(() => null),
  ]);
  const listed = matchingPage?.results.find((item) => item.id === Number(id));
  return {
    ...product,
    categoria: listed?.categoria ?? category,
    editorial: listed?.editorial ?? publisher,
    autores: listed?.autores ?? authorRows,
    stock: product.stock ?? listed?.stock ?? null,
  };
}

// La API pagina de a 10: para listas completas (selects, historial) se recorren todas las páginas.
export async function getAll<T>(path: string, token?: string): Promise<T[]> {
  const rows: T[] = [];
  let page = 1;
  for (;;) {
    const sep = path.includes("?") ? "&" : "?";
    const data = await apiRequest<ApiPage<T>>(`${path}${sep}page=${page}`, { token });
    rows.push(...data.results);
    if (!data.next) return rows;
    page += 1;
  }
}

export async function getCategories() {
  return getAll<Category>("categorias/");
}

// Categorías para mostrar en la tienda: si dos se ven igual (ej. dos "Libros") queda solo la que tiene productos.
export async function getStoreCategories(): Promise<Category[]> {
  const categories = await getCategories();
  const unique = uniqueCategories(categories);
  if (unique.length === categories.length) return categories;
  const withProducts: number[] = [];
  await Promise.all(categories.map(async (category) => {
    try { if ((await getProducts(new URLSearchParams({ categoria: String(category.id) }))).count > 0) withProducts.push(category.id); } catch { /* si falla, se usa el criterio por nombre */ }
  }));
  return uniqueCategories(categories, withProducts);
}

export async function getPublishers() {
  return getAll<Publisher>("editoriales/");
}

export async function getAuthors() {
  return getAll<Author>("autores/");
}

// Un cliente solo recibe su propio perfil, pero un usuario staff recibe el de todos: por eso se busca el que le pertenece.
export async function getCustomerProfile(token: string, userId?: number) {
  const profiles = await getAll<CustomerProfile>("clientes/", token);
  if (userId !== undefined) return profiles.find((profile) => profile.usuario === userId) ?? null;
  return profiles[0] ?? null;
}

// Crea un autor nuevo en la API (solo staff). Si ya existe uno con ese nombre se devuelve ese, para no duplicarlo.
export async function createAuthor(token: string, nombre: string, biografia = "", existing: Author[] = []): Promise<Author> {
  const name = nombre.trim();
  const found = existing.find((author) => author.nombre.trim().toLocaleLowerCase("es-AR") === name.toLocaleLowerCase("es-AR"));
  if (found) return found;
  const body: Record<string, string> = { nombre: name };
  if (biografia.trim()) body.biografia = biografia.trim();
  return apiRequest<Author>("autores/", { method: "POST", token, body: JSON.stringify(body) });
}

export async function getOrders(token: string) {
  return getAll<Order>("pedidos/", token);
}

export type StockInfo = { id: number; cantidad_disponible: number; pasillo: string };

export async function getStock(productId: number): Promise<StockInfo | null> {
  const page = await apiRequest<ApiPage<StockInfo>>(`inventario/?producto=${productId}`);
  return page.results[0] ?? null;
}

/** Crea o actualiza el inventario de un producto (sin inventario el backend no deja comprarlo). */
export async function saveStock(token: string, productId: number, cantidad: number, pasillo: string) {
  const current = await getStock(productId);
  const body = JSON.stringify({ producto: productId, cantidad_disponible: cantidad, pasillo });
  return apiRequest(current ? `inventario/${current.id}/` : "inventario/", { method: current ? "PATCH" : "POST", token, body });
}