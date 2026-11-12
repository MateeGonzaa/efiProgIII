import { describe, expect, it } from "vitest";
import { loginSchema, productSchema, profileSchema, registerSchema } from "@/lib/schemas";

/** Devuelve los campos que fallaron al validar, para comprobar una regla a la vez. */
function failedFields(result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) {
  return result.success ? [] : result.error!.issues.map((issue) => String(issue.path[0]));
}

describe("login: cada campo es obligatorio", () => {
  it("rechaza el usuario vacío", () => {
    expect(failedFields(loginSchema.safeParse({ username: "", password: "clave" }))).toEqual(["username"]);
  });
  it("rechaza la contraseña vacía", () => {
    expect(failedFields(loginSchema.safeParse({ username: "lector", password: "" }))).toEqual(["password"]);
  });
});

describe("registro: una regla por campo", () => {
  const valido = { username: "lector", email: "lector@mail.com", password: "clave-segura" };
  it("acepta datos válidos", () => {
    expect(registerSchema.safeParse(valido).success).toBe(true);
  });
  it("rechaza un usuario de menos de 3 caracteres", () => {
    expect(failedFields(registerSchema.safeParse({ ...valido, username: "ab" }))).toEqual(["username"]);
  });
  it("rechaza un mail sin formato", () => {
    expect(failedFields(registerSchema.safeParse({ ...valido, email: "no-es-email" }))).toEqual(["email"]);
  });
  it("rechaza una contraseña de menos de 8 caracteres", () => {
    expect(failedFields(registerSchema.safeParse({ ...valido, password: "1234567" }))).toEqual(["password"]);
  });
  it("rechaza un teléfono de más de 20 caracteres", () => {
    expect(failedFields(registerSchema.safeParse({ ...valido, telefono: "1".repeat(21) }))).toEqual(["telefono"]);
  });
});

describe("perfil de envío", () => {
  it("pide una dirección completa y una ciudad", () => {
    expect(failedFields(profileSchema.safeParse({ direccion_envio: "Av", ciudad: "R" })).sort()).toEqual(["ciudad", "direccion_envio"]);
    expect(profileSchema.safeParse({ direccion_envio: "Av. Sabattini 1200", ciudad: "Río Cuarto" }).success).toBe(true);
  });
});

describe("producto: reglas del alta y la edición", () => {
  const base = { titulo: "Berserk · Tomo 1", isbn: "9781234567890", precio: 9500, categoria: 2, editorial: 1, autores: [4], stock: 5, pasillo: "B3" };
  it("acepta un producto completo", () => {
    expect(productSchema.safeParse(base).success).toBe(true);
  });
  it("rechaza un stock negativo", () => {
    expect(failedFields(productSchema.safeParse({ ...base, stock: -1 }))).toEqual(["stock"]);
  });
  it("exige al menos un autor", () => {
    expect(failedFields(productSchema.safeParse({ ...base, autores: [] }))).toEqual(["autores"]);
  });
  it("rechaza un ISBN demasiado corto", () => {
    expect(failedFields(productSchema.safeParse({ ...base, isbn: "123" }))).toEqual(["isbn"]);
  });
  it("convierte el precio que llega como texto desde el input", () => {
    expect(productSchema.parse({ ...base, precio: "9500" }).precio).toBe(9500);
  });
});
