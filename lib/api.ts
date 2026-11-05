import type { ApiPage, Author, Category, CustomerProfile, Order, Product, ProductDetails, Publisher } from "@/lib/types";

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
  const response = await fetch(apiUrl(path), {
    ...rest,
    headers: {
      ...(rest.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...headers,
    },
    cache: "no-store",
  });
  if (response.status === 204) return undefined as T;
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) throw new ApiError(extractApiError(payload), response.status, payload);
  return payload as T;
}

export function extractApiError(payload: unknown): string {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.detail === "string") return record.detail;
    for (const [field, value] of Object.entries(record)) {
      if (Array.isArray(value) && typeof value[0] === "string") return `${field}: ${value[0]}`;
      if (typeof value === "string") return `${field}: ${value}`;
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

export async function getCategories() {
  const page = await apiRequest<ApiPage<Category>>("categorias/");
  return page.results;
}

export async function getPublishers() {
  const page = await apiRequest<ApiPage<Publisher>>("editoriales/");
  return page.results;
}

export async function getAuthors() {
  const page = await apiRequest<ApiPage<Author>>("autores/");
  return page.results;
}

export async function getCustomerProfile(token: string) {
  const page = await apiRequest<ApiPage<CustomerProfile>>("clientes/", { token });
  return page.results[0] ?? null;
}

export async function getOrders(token: string) {
  const page = await apiRequest<ApiPage<Order>>("pedidos/", { token });
  return page.results;
}
