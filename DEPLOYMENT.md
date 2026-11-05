# Guía de despliegue público

La aplicación tiene dos servicios: **Next.js en Vercel** y **Django REST Framework en Render**, conectados a **PostgreSQL**. Primero se publica la API; después se configura el frontend con su URL pública.

```text
Navegador ──HTTPS──> Next.js (Vercel) ──API/HTTPS──> Django (Render) ──> PostgreSQL
```

## Antes de empezar

Necesitás una cuenta en GitHub, Vercel y Render. Tanto Vercel como Render despliegan automáticamente a partir de un repositorio Git; subí el frontend y el backend a repositorios privados o públicos según el acuerdo del grupo. El ZIP del frontend no incluye el backend.

## 1. Preparar el backend

**No publiques el backend original sin configurarlo para producción.** El ZIP recibido tiene `DEBUG=True` por defecto, una clave secreta de desarrollo, SQLite sin persistencia configurada y un Dockerfile que ejecuta `runserver`. Así puede funcionar localmente, pero no es una configuración adecuada para un servicio público.

En el repositorio del backend, agregá los paquetes que se necesitan para PostgreSQL, archivos estáticos y el servidor de producción:

```bash
uv add dj-database-url 'psycopg[binary]' gunicorn whitenoise
```

En `core/settings.py`:

1. Agregá `import dj_database_url` junto a los imports.
2. Reemplazá el bloque actual de `SECRET_KEY`, `DEBUG` y `ALLOWED_HOSTS` por:

```python
DEBUG = os.getenv("DEBUG", "False").lower() in ("1", "true", "yes")
SECRET_KEY = os.getenv("SECRET_KEY", "")
if not SECRET_KEY:
    if not DEBUG:
        raise RuntimeError("Definí SECRET_KEY en el entorno de producción")
    SECRET_KEY = "solo-desarrollo-local-no-publicar"

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1,0.0.0.0").split(",")
    if host.strip()
]
render_host = os.getenv("RENDER_EXTERNAL_HOSTNAME")
if render_host and render_host not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(render_host)
```

3. Reemplazá el bloque actual de `DATABASES` por:

```python
database_url = os.getenv("DATABASE_URL")
if database_url:
    DATABASES = {
        "default": dj_database_url.parse(database_url, conn_max_age=600)
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": os.getenv("SQLITE_PATH") or BASE_DIR / "db.sqlite3",
        }
    }
```

4. En `MIDDLEWARE`, agregá WhiteNoise justo después de `SecurityMiddleware`:

```python
"django.middleware.security.SecurityMiddleware",
"whitenoise.middleware.WhiteNoiseMiddleware",
```

5. Cambiá la configuración de archivos estáticos por:

```python
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"
    },
}
```

El backend ya lee `CORS_ALLOWED_ORIGINS` desde el entorno. No hace falta cambiar ese bloque: se completará con el dominio de Vercel cuando exista.

En el `Dockerfile`, reemplazá el `CMD` de desarrollo por:

```dockerfile
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py collectstatic --noinput && gunicorn core.wsgi:application --bind 0.0.0.0:${PORT:-8000}"]
```

Guardá estos cambios, incluyendo `pyproject.toml` y el `uv.lock` regenerado por `uv add`, en el repositorio del backend.

## 2. Publicar la API y la base de datos en Render

1. En Render, creá una base **PostgreSQL** y un servicio **Web Service** conectado al repositorio del backend. Elegí **Docker** para que use el Dockerfile. Si frontend y backend están en un monorepo, indicá el directorio del backend como *Root Directory*.
2. Asociá la base al servicio usando su URL interna como `DATABASE_URL`.
3. En **Environment**, agregá estas variables:

   | Variable | Valor |
   |---|---|
   | `DEBUG` | `False` |
   | `SECRET_KEY` | Generá un valor aleatorio desde Render; no lo guardes en Git ni lo pongas en Vercel. |
   | `DATABASE_URL` | URL interna de PostgreSQL de Render. |
   | `ALLOWED_HOSTS` | Host del backend, sin `https://`, por ejemplo `la-frikicueva-api.onrender.com`. |
   | `CORS_ALLOWED_ORIGINS` | Por ahora, el dominio de Vercel se agrega en el paso 4. |

4. Desplegá. El Dockerfile aplica las migraciones al arrancar. En la consola del servicio, ejecutá `python manage.py createsuperuser` para habilitar la gestión de productos desde `/admin/`.
5. Para cargar el catálogo de muestra del trabajo, ejecutá `python populate.py` desde la consola del servicio. Eso crea también `cliente_demo` con clave `demo1234` y un pedido de ejemplo. Esas credenciales son públicas en el código de muestra: usalas solo para la defensa y cambialas o eliminá ese usuario si el sitio va a quedar abierto.
6. Confirmá que la API responde en `https://TU-API.onrender.com/api/productos/` y que Swagger abre en `https://TU-API.onrender.com/api/docs/swagger/`.

Usá PostgreSQL para conservar usuarios, productos y pedidos entre reinicios y despliegues; no apuntes la base pública a SQLite. Revisá el plan y la política de retención de la base que elijas: la documentación actual de Render indica que las bases gratuitas expiran a los 30 días.

## 3. Publicar el frontend en Vercel

1. Subí el contenido de este proyecto a un repositorio GitHub. No subas `.env.local`, `.env.production`, claves ni tokens. `.env.example` solo contiene la URL local de ejemplo.
2. En Vercel, elegí **Add New → Project** e importá ese repositorio. Vercel detecta Next.js; dejá el directorio raíz en `./` si el repositorio contiene solamente el frontend.
3. Antes del primer despliegue, agregá esta variable en **Settings → Environment Variables** para **Production**:

   ```text
   NEXT_PUBLIC_API_URL=https://TU-API.onrender.com/api
   ```

   No lleva una barra final. Es una URL pública, no un secreto. Next.js incorpora las variables `NEXT_PUBLIC_` durante el build, así que si la cambiás después, iniciá un nuevo despliegue.

4. Desplegá y anotá el dominio asignado, por ejemplo `https://la-frikicueva.vercel.app`.

## 4. Permitir que el frontend use la API

Volvé a Render y establecé `CORS_ALLOWED_ORIGINS` con el origen de Vercel, sin barra final:

```text
https://la-frikicueva.vercel.app
```

Si tenés un dominio propio, incluí también ese origen, separados por coma:

```text
https://la-frikicueva.vercel.app,https://www.tudominio.com
```

Guardá y desplegá de nuevo el backend. Si probás URLs de preview de Vercel, cada origen de preview también debe estar autorizado por CORS; para la defensa, probá el dominio de producción.

## 5. Verificación antes de entregar

- Abrí `https://TU-API.onrender.com/api/productos/`: debe devolver JSON con productos.
- Abrí `https://TU-FRONTEND.vercel.app/catalogo`: los productos deben venir de la API publicada.
- Probá búsqueda, filtros y una ficha de producto.
- Registrá una cuenta de prueba, completá **Mi perfil**, creá un pedido y confirmá que aparece en **Mis pedidos**.
- Ingresá a `/admin/` con el superusuario y comprobá que los cambios de productos se reflejan en el catálogo.
- Revisá la consola del navegador. Un error CORS suele indicar que falta el origen exacto de Vercel en `CORS_ALLOWED_ORIGINS`; un `404` suele indicar que `NEXT_PUBLIC_API_URL` no termina en `/api`.

El checkout actual crea pedidos en la API; no procesa pagos ni cobra tarjetas porque todavía no tiene una pasarela de pago.

## Documentación oficial

- [Deploy de Django en Render](https://render.com/docs/deploy-django)
- [PostgreSQL en Render](https://render.com/docs/postgresql)
- [Variables de entorno en Render](https://render.com/docs/configure-environment-variables)
- [Desplegar Next.js en Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Variables de entorno de Next.js](https://nextjs.org/docs/app/guides/environment-variables)
- [Checklist de despliegue de Django](https://docs.djangoproject.com/en/6.1/howto/deployment/checklist/)
