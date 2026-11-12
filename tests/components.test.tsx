import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { StoreProviders } from "@/components/providers";
import { ThemeToggle } from "@/components/theme-toggle";
import { FormField } from "@/components/form-field";
import { ProductCard } from "@/components/product-card";
import { CategoryTile } from "@/components/category-tile";
import { mockProducts } from "@/lib/mock-data";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

const wrap = (node: ReactNode) => render(<StoreProviders>{node}</StoreProviders>);

describe("tema claro/oscuro (Context API)", () => {
  it("el botón cambia el tema de toda la página", () => {
    wrap(<ThemeToggle />);
    expect(document.documentElement.dataset.theme).toBe("dark");
    fireEvent.click(screen.getByRole("button", { name: "Activar tema claro" }));
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(screen.getByRole("button", { name: "Activar tema oscuro" })).toBeInTheDocument();
  });
});

describe("campo de formulario", () => {
  it("muestra el error de validación debajo del input", () => {
    render(<FormField label="TÍTULO" error="Ingresá un título."><input /></FormField>);
    expect(screen.getByText("Ingresá un título.")).toBeInTheDocument();
  });
});

describe("tarjeta de producto", () => {
  it("agrega al carrito con el botón +", () => {
    const onAdd = vi.fn();
    render(<ProductCard product={mockProducts[0]} onAdd={onAdd} />);
    fireEvent.click(screen.getByRole("button", { name: /Agregar Spider-Man/ }));
    expect(onAdd).toHaveBeenCalledWith(mockProducts[0]);
  });

  it("deshabilita el botón y marca Agotado cuando no hay stock", () => {
    render(<ProductCard product={{ ...mockProducts[0], stock: 0 }} onAdd={vi.fn()} />);
    expect(screen.getByText("Agotado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Agregar/ })).toBeDisabled();
  });
});

describe("tarjeta de categoría del inicio", () => {
  const props = { kind: "manga" as const, seed: 1, href: "/catalogo?categoria=manga", tag: "Manga", title: "Un tomo más", description: "Series de Japón.", cta: "Ver manga" };

  it("enlaza al catálogo filtrado y muestra el precio más bajo", () => {
    const manga = mockProducts.filter((item) => item.categoria.nombre === "Manga");
    render(<CategoryTile {...props} products={manga} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/catalogo?categoria=manga");
    expect(screen.getByText(/Desde/)).toHaveTextContent("7.200");
  });

  it("funciona sin productos: queda la ilustración y no hay precio", () => {
    render(<CategoryTile {...props} products={[]} />);
    expect(screen.getByText("Un tomo más")).toBeInTheDocument();
    expect(screen.queryByText(/Desde/)).toBeNull();
  });
});
