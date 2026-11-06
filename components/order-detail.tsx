"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiRequest, getAll } from "@/lib/api";
import { useAuth } from "@/components/providers";
import type { Order, ProductDetails } from "@/lib/types";
import { mockProducts } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { BackLink, ErrorNotice } from "@/components/status";
import { Icon } from "@/components/icon";

const labels = { P: "En preparación", E: "En camino", C: "Cancelado" };

export function OrderDetail() {
  const params = useParams<{ id: string }>();
  const { session } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [products, setProducts] = useState<Record<number, ProductDetails>>({});
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const load = () => {
    if (!session) return;
    setLoading(true);
    Promise.all([
      apiRequest<Order>(`pedidos/${params.id}/`, { token: session.token }),
      getAll<NonNullable<Order["detalles"]>[number]>(`detalles/?pedido=${params.id}`, session.token),
    ]).then(async ([found, rows]) => {
      setOrder({ ...found, detalles: rows });
      const loaded = await Promise.all(rows.map(async (row) => {
        try { return await apiRequest<ProductDetails>(`productos/${row.producto}/`); }
        catch { return mockProducts.find((product) => product.id === row.producto); }
      }));
      const lookup: Record<number, ProductDetails> = {};
      rows.forEach((row, index) => { const product = loaded[index]; if (product) lookup[row.producto] = product; });
      setProducts(lookup); setError("");
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "No pudimos cargar este pedido.")).finally(() => setLoading(false));
  };
  useEffect(load, [session, params.id]);

  const cancelOrder = async () => {
    if (!session || !order) return;
    setWorking(true); setError("");
    try { await apiRequest(`pedidos/${order.id}/cancelar/`, { method: "POST", token: session.token }); load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo cancelar el pedido."); }
    finally { setWorking(false); }
  };

  if (loading) return <div className="account-loading"><span className="loading-orbit"/>CARGANDO PEDIDO…</div>;
  if (error && !order) return <div className="account-card"><ErrorNotice message={error}/><BackLink href="/cuenta/pedidos"/></div>;
  if (!order) return null;
  return <div className="account-card order-detail-card"><BackLink href="/cuenta/pedidos"/><div className="order-detail-head"><div><span className="eyebrow">FECHA · {new Intl.DateTimeFormat("es-AR", { dateStyle: "long" }).format(new Date(order.fecha_creacion))}</span><h2>Pedido <em>#{String(order.id).padStart(5, "0")}</em></h2></div><span className={`order-status status-${order.estado.toLowerCase()}`}><i/>{labels[order.estado]}</span></div>
    {error && <ErrorNotice message={error}/>}
    <div className="order-items">{(order.detalles ?? []).map((line) => <div className="order-item" key={line.id}><div className="order-item-icon"><Icon name="book" size={20}/></div><div><Link href={`/catalogo/${line.producto}`}>{products[line.producto]?.titulo ?? `Edición #${line.producto}`}</Link><span>{line.cantidad} × {formatCurrency(line.precio_unitario)}</span></div><strong>{formatCurrency(Number(line.precio_unitario) * line.cantidad)}</strong></div>)}</div>
    <div className="order-summary"><span>TOTAL DEL PEDIDO</span><strong>{formatCurrency(order.total)}</strong></div>
    {order.estado === "P" && <div className="order-cancel-row"><p>¿Cambiaste de idea? Podés cancelar el pedido pendiente.</p><button className="button button-quiet cancel-order" onClick={cancelOrder} disabled={working}>{working ? "CANCELANDO…" : "Cancelar pedido"}</button></div>}
  </div>;
}
