import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Ingresá tu usuario."),
  password: z.string().min(1, "Ingresá tu contraseña."),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Usá al menos 3 caracteres.").max(150, "Máximo 150 caracteres."),
  email: z.string().email("Ingresá un email válido."),
  telefono: z.string().max(20, "Máximo 20 caracteres.").optional().or(z.literal("")),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export const productSchema = z.object({
  titulo: z.string().min(2, "El título debe tener al menos 2 caracteres.").max(200),
  isbn: z.string().min(10, "Ingresá un ISBN válido.").max(20),
  precio: z.coerce.number().positive("El precio debe ser mayor a 0."),
  categoria: z.coerce.number().int().positive("Elegí una categoría."),
  editorial: z.coerce.number().int().positive("Elegí una editorial."),
  autores: z.array(z.coerce.number().int().positive()).min(1, "Elegí al menos un autor."),
  imagen_url: z.string().url("Ingresá una URL válida (https://…).").max(500).optional().or(z.literal("")),
  stock: z.coerce.number().int("Ingresá un número entero.").min(0, "El stock no puede ser negativo."),
  pasillo: z.string().min(1, "Indicá el pasillo.").max(10, "Máximo 10 caracteres."),
});

export const profileSchema = z.object({
  direccion_envio: z.string().min(5, "Ingresá una dirección más completa."),
  ciudad: z.string().min(2, "Ingresá tu ciudad."),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ProductValues = z.infer<typeof productSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
