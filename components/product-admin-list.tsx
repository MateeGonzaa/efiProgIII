"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest, getProducts } from "@/lib/api";
import { useAuth } from "@/components/providers";
import type { ProductDetails } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { ErrorNotice } from "@/components/status";
import { Icon } from "@/components/icon";

export function ProductAdminList() {
  const { session } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<ProductDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const load = () => getProducts().then((page) => { setProducts(page.results); setError(""); }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "No se pudo cargar el catálogo.")).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const remove = async (product: ProductDetails) => {
    if (!session || !window.confirm(`¿Eliminar “${product.titulo}” del catálogo?`)) return;
    setDeleting(product.id); setError("");
    try { await apiRequest(`productos/${product.id}/`, { method: "DELETE", token: session.token }); setProducts((current) => current.filter((item) => item.id !== product.id)); router.refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo eliminar el producto."); }
    finally { setDeleting(null); }
  };
  return <div className="account-card admin-products-card"><div className="account-card-head"><div><span className="eyebrow">CATÁLOGO · CRUD</span><h2>Productos.</h2></div><Link href="/admin/productos/nuevo" className="button button-primary"><Icon name="plus" size={16}/> NUEVO PRODUCTO</Link></div>
    <p className="account-intro">Alta, edición y baja de productos. El backend valida los permisos de staff.</p>
    {error && <ErrorNotice message={error} onRetry={load}/>}
    {loading ? <div className="account-loading"><span className="loading-orbit"/>CARGANDO PRODUCTOS…</div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>PRODUCTO</th><th>CATEGORÍA</th><th>PRECIO</th><th>STOCK</th><th>ACCIONES</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><strong>{product.titulo}</strong><small>ISBN {product.isbn}</small></td><td>{typeof product.categoria === "object" ? product.categoria.nombre : "—"}</td><td>{formatCurrency(product.precio)}</td><td>{product.stock ?? "—"}</td><td><div className="table-actions"><Link href={`/admin/productos/${product.id}/editar`} className="icon-button" aria-label={`Editar ${product.titulo}`} title="Editar"><Icon name="layers" size={16}/></Link><button className="icon-button delete-action" aria-label={`Eliminar ${product.titulo}`} title="Eliminar" disabled={deleting === product.id} onClick={() => remove(product)}><Icon name="trash" size={16}/></button></div></td></tr>)}</tbody></table>{!products.length && !error && <p className="admin-empty">El catálogo está vacío. Agregá la primera edición.</p>}</div>}
  </div>;
}
