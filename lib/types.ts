export type Category = { id: number; nombre: string; descripcion?: string };
export type Publisher = { id: number; nombre: string; pais?: string };
export type Author = { id: number; nombre: string; biografia?: string };

export type Product = {
  id: number;
  titulo: string;
  isbn: string;
  precio: string | number;
  categoria: Category | number;
  editorial: Publisher | number;
  autores: Author[] | number[];
  stock?: number | null;
};

export type ProductDetails = Product & {
  categoria: Category;
  editorial: Publisher;
  autores: Author[];
  stock: number | null;
};

export type ApiPage<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type SessionUser = { id: number; username: string; email?: string; is_staff: boolean };
export type CartLine = { product: ProductDetails; quantity: number };
export type CustomerProfile = {
  id: number;
  direccion_envio: string;
  ciudad: string;
  usuario?: number;
};

export type Order = {
  id: number;
  estado: "P" | "E" | "C";
  total: string | number;
  fecha_creacion: string;
  detalles?: Array<{
    id: number;
    pedido: number;
    producto: number;
    cantidad: number;
    precio_unitario: string | number;
  }>;
};
