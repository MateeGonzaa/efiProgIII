import { slugify } from "@/lib/utils";

export type NavLink = { href: string; label: string; match: "all" | "comics" | "manga" | "libros" };

export const navLinks: NavLink[] = [
  { href: "/catalogo", label: "Catálogo", match: "all" },
  { href: "/catalogo?categoria=manga", label: "Manga", match: "manga" },
  { href: "/catalogo?categoria=comics", label: "Cómics", match: "comics" },
  { href: "/catalogo?categoria=libros", label: "Libros", match: "libros" },
];

/** Dice si un link del menú corresponde a la página actual (ruta + ?categoria=). */
export function isNavActive(link: NavLink, pathname: string, categoria: string | null | undefined): boolean {
  if (!pathname.startsWith("/catalogo")) return false;
  const current = slugify(categoria ?? "");
  if (link.match === "all") return current === "";
  if (link.match === "comics") return current.startsWith("comic");
  if (link.match === "manga") return current.startsWith("manga");
  return current.startsWith("libro") || current.startsWith("fant");
}
