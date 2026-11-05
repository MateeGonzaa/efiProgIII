"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOrders } from "@/lib/api";
import { useAuth } from "@/components/providers";
import type { Order } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { EmptyState, ErrorNotice } from "@/components/status";
import { Icon } from "@/components/icon";

const stateLabel = { P: "En preparación", E: "En camino", C: "Cancelado" };

export function OrdersList() {
  const { session } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!session) return;
    getOrders(session.token).then(setOrders).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "No pudimos cargar tus pedidos.")).finally(() => setLoading(false));
  }, [session]);
  if (loading) return <div className="account-loading"><span className="loading-orbit"/>ABRIENDO TU HISTORIAL…</div>;
  return <div className="account-card"><div className="account-card-head"><div><span className="eyebrow">HISTORIAL DE VIAJE</span><h2>Tus pedidos.</h2></div><span className="account-head-icon"><Icon name="layers" size={22}/></span></div>
    {error ? <ErrorNotice message={error}/> : orders.length ? <div className="orders-list">{orders.map((order) => <Link key={order.id} href={`/cuenta/pedidos/${order.id}`} className="order-row"><div className="order-number"><span>ORDEN</span><strong>#{String(order.id).padStart(5, "0")}</strong></div><div className="order-date"><span>FECHA</span><strong>{new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(order.fecha_creacion))}</strong></div><span className={`order-status status-${order.estado.toLowerCase()}`}><i/>{stateLabel[order.estado]}</span><strong className="order-total">{formatCurrency(order.total)}</strong><Icon name="chevron" size={17}/></Link>)}</div> : <EmptyState icon="bag" title="Todavía no hay pedidos" body="Cuando una historia te encuentre, vas a verla acá." action={<Link className="button button-primary" href="/catalogo">Explorar catálogo <Icon name="arrow" size={16}/></Link>}/>}
  </div>;
}
