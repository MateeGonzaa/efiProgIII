# La Frikicueva — Archivo de mundos

Frontend para **La Frikicueva**, una tienda argentina de cómics, manga y fantasía épica. El proyecto consume el backend del grupo, una API REST desarrollada con Django y Django REST Framework. Documentación de la API en local: `http://localhost:8000/api/docs/swagger/` (agregar el enlace del repositorio del grupo antes de entregar).

La experiencia mezcla una estética de archivo editorial y cómic: negro tinta, papel cálido, acento naranja, portadas conceptuales creadas con CSS, texturas, órbitas y microanimaciones. Los datos del catálogo se cargan desde la API; si todavía no está disponible, se muestra una vista de muestra para poder recorrer el diseño.

## Stack

- Next.js 16 con App Router y TypeScript.
- React Server Components para el inicio, fichas y carga inicial del catálogo; Client Components para filtros, sesión, carrito y formularios.
- Tailwind CSS 4 y CSS modular de aplicación.
- React Hook Form + Zod para formularios validados.
- Context API para sesión, tema y carrito.
- Vitest para pruebas unitarias.

## Requisitos cubiertos

- Rutas principales para inicio, catálogo, fichas de producto, carrito, login, registro, cuenta, pedidos y gestión.
- Rutas dinámicas para `/catalogo/[id]`, `/cuenta/pedidos/[id]` y `/admin/productos/[id]/editar`; la sección cuenta y gestión usa layouts anidados.
- CRUD de productos conectado a `GET`, `POST`, `PATCH` y `DELETE /api/productos/`. La API permite escribir solo a usuarios staff.
- Búsqueda, categoría, ordenamiento y paginación conectados a los filtros del backend.
- Login, registro, logout y envío del token `Authorization: Token …` en operaciones protegidas.
- Gestión de perfil de cliente, checkout básico y listado/detalle/cancelación de pedidos.
- Estados de carga y error, página 404, y manejo de errores en la sección de catálogo.

## Ejecutar en local

1. Instalar Node.js 20.9 o superior.
2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Copiar `.env.example` como `.env.local` y ajustar la URL del backend:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

4. Iniciar Django en `http://localhost:8000` y ejecutar la app:

   ```bash
   npm run dev
   ```

5. Abrir `http://localhost:3000`.

El backend debe tener CORS habilitado para `http://localhost:3000`. El repositorio del backend incluye el usuario de prueba `cliente_demo` / `demo1234`; completar su perfil desde **Mi perfil** antes de confirmar un pedido.

## Pruebas

```bash
npm run test
```

Vitest incluye pruebas de validaciones Zod, formato de moneda, búsqueda local y lectura de errores de API.

## Despliegue

La guía detallada está en [DEPLOYMENT.md](DEPLOYMENT.md). Resume cómo publicar la API Django con PostgreSQL y el frontend en Vercel, configurar CORS y comprobar los flujos antes de entregar.

Aplicación desplegada: **pendiente de publicar**.  
Tablero Kanban: **pendiente de enlazar**.

## Equipo

- Lucas Aruza
- Mateo Gonzalez

## Capturas

Portada conectada a la API local:

![Portada de La Frikicueva](outputs/portada.png)
