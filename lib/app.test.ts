import { describe, expect, it } from "vitest";
import { loginSchema, productSchema, registerSchema } from "@/lib/schemas";
import { extractApiError } from "@/lib/api";
import { filterProducts, matchCategory, formatCurrency, getApiMessage } from "@/lib/utils";
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
  });
  it("también acepta el id y devuelve undefined si no existe", () => {
    expect(matchCategory(cats, "8")?.nombre).toBe("Manga");
    expect(matchCategory(cats, "terror")).toBeUndefined();
  });
});