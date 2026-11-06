import { describe, expect, it } from "vitest";
import { loginSchema, productSchema, registerSchema } from "@/lib/schemas";
import { extractApiError } from "@/lib/api";
import { categoryLabel, matchCategory, filterProducts, formatCurrency, getApiMessage, imageSrc } from "@/lib/utils";
import { mockProducts } from "@/lib/mock-data";

describe("validaciones de formularios", () => {
  it("acepta credenciales completas", () => {
    expect(loginSchema.safeParse({ username: "lector", password: "clave-segura" }).success).toBe(true);
  });

  it("marca los datos de registro incompletos", () => {
    expect(registerSchema.safeParse({ username: "ab", email: "no-es-email", password: "123" }).success).toBe(false);
  });

  it("rechaza un precio de producto igual a cero", () => {
    const result = productSchema.safeParse({ titulo: "Edición", isbn: "9781234567890", precio: 0, categoria: 1, editorial: 1, autores: [1] });
    expect(result.success).toBe(false);
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
  it("acepta un link https o una ruta de la carpeta public", () => {
    expect(productSchema.safeParse({ ...base, imagen_url: "https://sitio.com/tapa.jpg" }).success).toBe(true);
    expect(productSchema.safeParse({ ...base, imagen_url: "/portadas/berserk-1.jpg" }).success).toBe(true);
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
