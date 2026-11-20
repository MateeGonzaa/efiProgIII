import { describe, expect, it } from "vitest";
import { loginSchema, productSchema, registerSchema } from "@/lib/schemas";
import { createAuthor, extractApiError, getCustomerProfile } from "@/lib/api";
import { categoryLabel, matchCategory, filterProducts, formatCurrency, getApiMessage, imageSrc, uniqueCategories } from "@/lib/utils";
import { mockProducts } from "@/lib/mock-data";

describe("validaciones de formularios", () => {
  it("acepta credenciales completas", () => {
    expect(loginSchema.safeParse({ username: "lector", password: "clave-segura" }).success).toBe(true);
  });

  it("marca los datos de registro incompletos", () => {
    expect(registerSchema.safeParse({ username: "ab", email: "no-es-email", password: "123" }).success).toBe(false);
  });

  it("rechaza un precio de producto igual a cero", () => {
    // Se incluyen stock y pasillo para que el único error posible sea el precio.
    const result = productSchema.safeParse({ titulo: "Edición", isbn: "9781234567890", precio: 0, categoria: 1, editorial: 1, autores: [1], stock: 1, pasillo: "A1" });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual(["precio"]);
  });
});

describe("utilidades de la tienda", () => {
  it("formatea precios en pesos argentinos", () => {
    expect(formatCurrency(9500)).toContain("9.500");
    expect(formatCurrency(9500)).toContain("$");
  });

  it("filtra títulos sin distinguir mayúsculas", () => {
    expect(filterProducts(mockProducts, "BERSERK").map((item) => item.id)).toEqual([4]);
  });

  it("prioriza el mensaje de detalle de la API", () => {
    expect(getApiMessage({ detail: "Sesión vencida." })).toBe("Sesión vencida.");
  });
});

describe("errores de la API", () => {
  it("muestra el login incorrecto sin el nombre del campo", () => {
    expect(extractApiError({ non_field_errors: ["No se puede iniciar sesión."] })).toBe("No se puede iniciar sesión.");
  });

  it("antepone el campo en errores de validación", () => {
    expect(extractApiError({ isbn: ["Ya existe."] })).toBe("isbn: Ya existe.");
  });

  it("no muestra el HTML cuando el servidor devuelve la verificación de Cloudflare", () => {
    const html = "<!DOCTYPE html><html><head><title>Just a moment...</title></head><body></body></html>";
    const message = extractApiError(html);
    expect(message).toContain("verificación de seguridad");
    expect(message).not.toContain("<");
  });

  it("acorta las respuestas de texto demasiado largas", () => {
    expect(extractApiError("x".repeat(500)).length).toBeLessThan(120);
  });
});

describe("categorías por nombre o id", () => {
  const cats = [{ id: 7, nombre: "Cómic" }, { id: 8, nombre: "Manga" }, { id: 9, nombre: "Fantasía Épica" }];
  it("resuelve slugs del menú aunque los ids cambien", () => {
    expect(matchCategory(cats, "comics")?.id).toBe(7);
    expect(matchCategory(cats, "manga")?.id).toBe(8);
    expect(matchCategory(cats, "fantasia")?.id).toBe(9);
    expect(matchCategory(cats, "libros")?.id).toBe(9);
  });
  it("muestra \"Libros\" en lugar de \"Fantasía Épica\" y no toca las demás", () => {
    expect(categoryLabel("Fantasía Épica")).toBe("Libros");
    expect(categoryLabel("Manga")).toBe("Manga");
  });
  it("también acepta el id y devuelve undefined si no existe", () => {
    expect(matchCategory(cats, "8")?.nombre).toBe("Manga");
    expect(matchCategory(cats, "terror")).toBeUndefined();
  });
});
describe("portada del producto", () => {
  const base = { titulo: "Edición", isbn: "9781234567890", precio: 100, categoria: 1, editorial: 1, autores: [1], stock: 1, pasillo: "A1" };
  it("acepta un link https y rechaza rutas de la carpeta public", () => {
    expect(productSchema.safeParse({ ...base, imagen_url: "https://sitio.com/tapa.jpg" }).success).toBe(true);
    expect(productSchema.safeParse({ ...base, imagen_url: "/portadas/berserk-1.jpg" }).success).toBe(false);
  });
  it("acepta la portada vacía y rechaza textos sueltos", () => {
    expect(productSchema.safeParse({ ...base, imagen_url: "" }).success).toBe(true);
    expect(productSchema.safeParse({ ...base, imagen_url: "tapa.jpg" }).success).toBe(false);
  });
});
describe("ruta de la portada", () => {
  it("normaliza rutas de public/portadas aunque vengan mal escritas", () => {
    expect(imageSrc("/portadas/berserk-1.jpg")).toBe("/portadas/berserk-1.jpg");
    expect(imageSrc("portadas/berserk-1.jpg")).toBe("/portadas/berserk-1.jpg");
    expect(imageSrc("./portadas/berserk-1.jpg")).toBe("/portadas/berserk-1.jpg");
    expect(imageSrc("public/portadas/berserk-1.jpg")).toBe("/portadas/berserk-1.jpg");
    expect(imageSrc("/public/portadas/berserk-1.jpg")).toBe("/portadas/berserk-1.jpg");
  });
  it("no toca los links ni las portadas vacías", () => {
    expect(imageSrc("https://sitio.com/tapa.jpg")).toBe("https://sitio.com/tapa.jpg");
    expect(imageSrc("")).toBe("");
    expect(imageSrc(null)).toBe("");
  });
});

describe("categorías repetidas", () => {
  const cats = [{ id: 1, nombre: "Cómic" }, { id: 2, nombre: "Fantasía Épica" }, { id: 3, nombre: "Libros" }, { id: 4, nombre: "Manga" }];
  it("deja un solo \"Libros\" (el de Fantasía Épica) cuando no hay más datos", () => {
    expect(uniqueCategories(cats).map((c) => c.id)).toEqual([1, 2, 4]);
  });
  it("se queda con la categoría que tiene productos", () => {
    expect(uniqueCategories(cats, [3]).map((c) => c.id)).toEqual([1, 3, 4]);
  });
  it("no toca las listas sin repetidas", () => {
    expect(uniqueCategories(cats.filter((c) => c.id !== 3))).toHaveLength(3);
  });
});

// Reemplaza fetch por una respuesta falsa para probar las funciones que hablan con la API sin usar la red.
async function withFakeApi<T>(reply: (url: string, init?: RequestInit) => unknown, run: (calls: Array<{ url: string; init?: RequestInit }>) => Promise<T>): Promise<T> {
  const original = globalThis.fetch;
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(reply(url, init)), { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
  try { return await run(calls); } finally { globalThis.fetch = original; }
}

describe("autores nuevos", () => {
  it("guarda el autor en la API con el token de staff", async () => {
    await withFakeApi((_url, init) => ({ id: 9, ...JSON.parse(String(init?.body)) }), async (calls) => {
      const author = await createAuthor("tok", "  Neil Gaiman ", "Escritor británico", []);
      expect(author).toEqual({ id: 9, nombre: "Neil Gaiman", biografia: "Escritor británico" });
      expect(calls).toHaveLength(1);
      expect(calls[0].url).toContain("/autores/");
      expect(calls[0].init?.method).toBe("POST");
      expect((calls[0].init?.headers as Record<string, string>).Authorization).toBe("Token tok");
    });
  });
  it("no duplica un autor que ya existe", async () => {
    await withFakeApi(() => ({}), async (calls) => {
      const author = await createAuthor("tok", "stan lee", "", [{ id: 1, nombre: "Stan Lee" }]);
      expect(author.id).toBe(1);
      expect(calls).toHaveLength(0);
    });
  });
});

describe("perfil de cliente", () => {
  const rows = { count: 2, next: null, previous: null, results: [{ id: 10, usuario: 5, direccion_envio: "A", ciudad: "B" }, { id: 11, usuario: 7, direccion_envio: "C", ciudad: "D" }] };
  it("el staff recibe todos los perfiles y se queda con el suyo", async () => {
    await withFakeApi(() => rows, async () => { expect((await getCustomerProfile("tok", 7))?.id).toBe(11); });
  });
  it("si el usuario no tiene perfil devuelve null en vez del de otra persona", async () => {
    await withFakeApi(() => rows, async () => { expect(await getCustomerProfile("tok", 99)).toBeNull(); });
  });
});
