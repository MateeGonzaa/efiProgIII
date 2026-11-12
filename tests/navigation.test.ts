import { describe, expect, it } from "vitest";
import { isNavActive, navLinks } from "@/lib/navigation";

const link = (match: string) => navLinks.find((item) => item.match === match)!;

describe("menú principal", () => {
  it("tiene los cuatro links y todos apuntan al catálogo", () => {
    expect(navLinks.map((item) => item.label)).toEqual(["Catálogo", "Manga", "Cómics", "Libros"]);
    expect(navLinks.every((item) => item.href.startsWith("/catalogo"))).toBe(true);
  });

  it("marca Catálogo solo cuando no hay categoría elegida", () => {
    expect(isNavActive(link("all"), "/catalogo", null)).toBe(true);
    expect(isNavActive(link("all"), "/catalogo", "manga")).toBe(false);
  });

  it("marca la categoría que está en la URL", () => {
    expect(isNavActive(link("manga"), "/catalogo", "manga")).toBe(true);
    expect(isNavActive(link("comics"), "/catalogo", "comics")).toBe(true);
    expect(isNavActive(link("libros"), "/catalogo", "fantasia-epica")).toBe(true);
    expect(isNavActive(link("manga"), "/catalogo", "comics")).toBe(false);
  });

  it("no marca nada fuera del catálogo", () => {
    expect(isNavActive(link("all"), "/carrito", null)).toBe(false);
    expect(isNavActive(link("manga"), "/login", "manga")).toBe(false);
  });
});
