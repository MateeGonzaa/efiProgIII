import { coverSearchQuery } from "@/lib/utils";

type CoverQuery = { titulo: string; isbn?: string };

const STORAGE_PREFIX = "frikicueva-cover:";
const pending = new Map<string, Promise<string | null>>();

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url);
    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}

type GoogleBooks = { items?: Array<{ volumeInfo?: { imageLinks?: { thumbnail?: string; smallThumbnail?: string } } }> };

/** Google Books devuelve la tapa real; se fuerza https y un zoom mayor para que no se vea chica. */
async function fromGoogleBooks(q: string): Promise<string | null> {
  const data = await getJson<GoogleBooks>(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=1&printType=books&fields=items(volumeInfo(imageLinks))`);
  const links = data?.items?.[0]?.volumeInfo?.imageLinks;
  const url = links?.thumbnail ?? links?.smallThumbnail;
  return url ? url.replace(/^http:/, "https:").replace("&edge=curl", "").replace("zoom=1", "zoom=2") : null;
}

type OpenLibrary = { docs?: Array<{ cover_i?: number }> };

async function fromOpenLibrary(title: string): Promise<string | null> {
  const data = await getJson<OpenLibrary>(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=1&fields=cover_i`);
  const id = data?.docs?.[0]?.cover_i;
  return id ? `https://covers.openlibrary.org/b/id/${id}-L.jpg` : null;
}

/**
 * Busca la tapa real de una edición cuando el admin no cargó `imagen_url`.
 * Orden: Google Books por ISBN → Google Books por título → Open Library por título.
 * El resultado (incluso "no hay") se recuerda en sessionStorage para no repetir pedidos.
 */
export function findCover(product: CoverQuery): Promise<string | null> {
  const isbn = product.isbn?.replace(/[^0-9X]/gi, "") ?? "";
  const title = coverSearchQuery(product.titulo);
  const key = `${STORAGE_PREFIX}${isbn || title}`;
  try {
    const saved = sessionStorage.getItem(key);
    if (saved !== null) return Promise.resolve(saved || null);
  } catch { /* sin storage: se sigue sin cache */ }
  const inFlight = pending.get(key);
  if (inFlight) return inFlight;
  const job = (async () => {
    let url: string | null = null;
    if (isbn.length >= 10) url = await fromGoogleBooks(`isbn:${isbn}`);
    if (!url && title) url = await fromGoogleBooks(`intitle:${title}`);
    if (!url && title) url = await fromOpenLibrary(title);
    try { sessionStorage.setItem(key, url ?? ""); } catch { /* ignorar */ }
    return url;
  })().finally(() => pending.delete(key));
  pending.set(key, job);
  return job;
}
