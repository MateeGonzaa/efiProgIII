import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Ingresá tu usuario."),
  password: z.string().min(1, "Ingresá tu contraseña."),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Usá al menos 3 caracteres.").max(150, "Máximo 150 caracteres."),
  email: z.string().email("Ingresá un mail válido."),
  telefono: z.string().max(20, "Máximo 20 caracteres.").optional().or(z.literal("")),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

// Reglas de validación del alta/edición de productos (se conectan a React Hook Form con zodResolver).
export const productSchema = z.object({
  titulo: z.string().min(2, "El título debe tener al menos 2 caracteres.").max(200),
  // El campo se llama "isbn" porque así lo definió el backend; en pantalla se muestra como "código".
  isbn: z.string().min(10, "Ingresá el código de barras completo (mínimo 10 caracteres).").max(20),
  precio: z.coerce.number().positive("El precio debe ser mayor a 0."),
  categoria: z.coerce.number().int().positive("Elegí una categoría."),
  editorial: z.coerce.number().int().positive("Elegí una editorial."),
  autores: z.array(z.coerce.number().int().positive()).min(1, "Elegí al menos un autor."),
  // La portada se carga por link directo a la imagen (no usamos archivos en /public).
  imagen_url: z.string().refine((value) => value === "" || /^https?:\/\/\S+$/.test(value), "Ingresá un link directo a la imagen (https://…).").optional(),
  stock: z.coerce.number().int("Ingresá un número entero.").min(0, "El stock no puede ser negativo."),
  pasillo: z.string().min(1, "Indicá el pasillo.").max(10, "Máximo 10 caracteres."),
});

// Alta rápida de una editorial desde el formulario de producto (el país es opcional).
export const publisherSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre de la editorial debe tener al menos 2 caracteres.").max(120, "Máximo 120 caracteres."),
  pais: z.string().trim().max(60, "Máximo 60 caracteres.").optional().or(z.literal("")),
});

export const profileSchema = z.object({
  direccion_envio: z.string().min(5, "Ingresá una dirección más completa."),
  ciudad: z.string().min(2, "Ingresá tu ciudad."),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ProductValues = z.infer<typeof productSchema>;
export type PublisherValues = z.infer<typeof publisherSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;