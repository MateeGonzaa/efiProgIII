import { describe, expect, it } from "vitest";
import { authorNames, categoryKey, pickForCategory, startingPrice } from "@/lib/categories";
import { mockProducts } from "@/lib/mock-data";

describe("categorías de la tienda", () => {
  it("agrupa los nombres del backend en cómics, manga y libros", () => {
    expect(categoryKey("Cómic")).toBe("comics");
    expect(categoryKey("Manga")).toBe("manga");
    expect(categoryKey("Fantasía Épica")).toBe("libros");
    expect(categoryKey(undefined)).toBe("comics");
  });

  it("elige hasta tres productos de la sección pedida", () => {
    const manga = pickForCategory(mockProducts, "manga");
    expect(manga.map((item) => item.id)).toEqual([2, 4, 5]);
    expect(pickForCategory(mockProducts, "manga", 2)).toHaveLength(2);
  });

  it("deja al final los productos agotados", () => {
    const sinStock = mockProducts.map((item) => (item.id === 2 ? { ...item, stock: 0 } : item));
    expect(pickForCategory(sinStock, "manga").map((item) => item.id)).toEqual([4, 5, 2]);
  });

  it("calcula el precio más bajo y devuelve null si no hay productos", () => {
    expect(startingPrice(pickForCategory(mockProducts, "manga"))).toBe(7200);
    expect(startingPrice([])).toBeNull();
  });

  it("junta los autores sin repetirlos", () => {
    expect(authorNames(pickForCategory(mockProducts, "comics"))).toEqual(["Stan Lee"]);
  });
});
