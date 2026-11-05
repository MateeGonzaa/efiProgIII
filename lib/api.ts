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

export function extractApiError(payload: unknown): string {
  if (typeof payload === "string") return payload;
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

export async function getPublishers() {
  return getAll<Publisher>("editoriales/");
}

export async function getAuthors() {
  return getAll<Author>("autores/");
}

export async function getCustomerProfile(token: string) {
  const page = await apiRequest<ApiPage<CustomerProfile>>("clientes/", { token });
  return page.results[0] ?? null;
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
