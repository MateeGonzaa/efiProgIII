import type { Author, Category, ProductDetails, Publisher } from "@/lib/types";

export const mockCategories: Category[] = [
  { id: 1, nombre: "Cómic", descripcion: "Historias que hicieron historia." },
  { id: 2, nombre: "Manga", descripcion: "Nuevos mundos, tomo a tomo." },
  { id: 3, nombre: "Libros", descripcion: "Novelas y aventuras para perderse." },
];

const ivrea: Publisher = { id: 2, nombre: "Ivrea", pais: "Argentina" };
const panini: Publisher = { id: 1, nombre: "Panini Comics", pais: "Italia" };
const minotauro: Publisher = { id: 3, nombre: "Minotauro", pais: "España" };
const authors: Author[] = [
  { id: 1, nombre: "Stan Lee" },
  { id: 2, nombre: "Eiichiro Oda" },
  { id: 3, nombre: "J. R. R. Tolkien" },
  { id: 4, nombre: "Kentaro Miura" },
  { id: 5, nombre: "Akira Toriyama" },
];

export const mockProducts: ProductDetails[] = [
  { id: 1, titulo: "Spider-Man: La última cacería", isbn: "978-84-1101-000-1", imagen_url: "https://images.cdn2.buscalibre.com/fit-in/660x660/8f/cf/8fcf42db98b8e2741cb4c2c2848d353f.jpg", precio: 15500, categoria: mockCategories[0], editorial: panini, autores: [authors[0]], stock: 10 },
  { id: 2, titulo: "One Piece · Romance Dawn", isbn: "978-84-1101-000-2", imagen_url: "https://images.cdn3.buscalibre.com/fit-in/660x660/b1/0c/b10c11bb8e79371aca5501de04da669f.jpg", precio: 8000, categoria: mockCategories[1], editorial: ivrea, autores: [authors[1]], stock: 25 },
  { id: 3, titulo: "La Comunidad del Anillo", isbn: "978-84-450-0066-3", imagen_url: "https://images.cdn2.buscalibre.com/fit-in/660x660/3f/da/3fda62db53fae681fe69ec420d11570a.jpg", precio: 28000, categoria: mockCategories[2], editorial: minotauro, autores: [authors[2]], stock: 5 },
  { id: 4, titulo: "Berserk · Tomo 1", isbn: "978-84-1101-000-4", imagen_url: "https://http2.mlstatic.com/D_NQ_NP_967411-MLU69862958341_062023-O.webp", precio: 9500, categoria: mockCategories[1], editorial: ivrea, autores: [authors[3]], stock: 12 },
  { id: 5, titulo: "Dragon Ball · Tomo 1", isbn: "978-84-1101-000-5", imagen_url: "https://http2.mlstatic.com/D_NQ_NP_747664-MLA100961771641_122025-O.webp", precio: 7200, categoria: mockCategories[1], editorial: ivrea, autores: [authors[4]], stock: 30 },
  { id: 6, titulo: "X-Men: Días del futuro pasado", isbn: "978-84-1101-000-6", imagen_url: "https://http2.mlstatic.com/D_NQ_NP_940430-MLA81328294773_122024-O.webp", precio: 18900, categoria: mockCategories[0], editorial: panini, autores: [authors[0]], stock: 3 },
];