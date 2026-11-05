"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, getCustomerProfile } from "@/lib/api";
import { useAuth, useCart } from "@/components/providers";
import { ProductCover } from "@/components/product-cover";
import { Icon } from "@/components/icon";
import { EmptyState, ErrorNotice } from "@/components/status";
import { formatCurrency } from "@/lib/utils";

export function CartPage() {
  const { session } = useAuth();
  const { lines, total, setQuantity, remove, clear } = useCart();
  const router = useRouter();
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  const checkout = async () => {
    if (!session) { router.push(`/login?next=${encodeURIComponent("/carrito")}`); return; }
    setWorking(true); setError("");
    try {
      const profile = await getCustomerProfile(session.token);
      if (!profile) { router.push("/cuenta/perfil"); return; }
      const order = await apiRequest<{ id: number }>("pedidos/", { method: "POST", token: session.token, body: JSON.stringify({}) });
      try {
        for (const line of lines) {
          await apiRequest("detalles/", { method: "POST", token: session.token, body: JSON.stringify({ pedido: order.id, producto: line.product.id, cantidad: line.quantity }) });
        }
      } catch (reason) {
        // Si una línea falla (ej. sin stock) se cancela el pedido a medio armar para devolver el stock reservado.
        await apiRequest(`pedidos/${order.id}/cancelar/`, { method: "POST", token: session.token }).catch(() => undefined);
        throw reason;
      }
      clear();
      router.push(`/cuenta/pedidos/${order.id}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No pudimos completar el pedido."); }
    finally { setWorking(false); }
  };

  return <section className="cart-page page-shell"><div className="cart-page-head"><div><span className="eyebrow">TU ESTANTERÍA EN CAMINO</span><h1>La <em>bolsa.</em></h1></div><Link href="/catalogo" className="text-link"><Icon name="arrow" size={15} className="back-arrow"/> Seguir explorando</Link></div>
    {error && <ErrorNotice message={error}/>}
    {!lines.length ? <div className="cart-empty"><EmptyState icon="bag" title="Tu bolsa está vacía" body="Hay un universo entero esperando a que lo descubras." action={<Link className="button button-primary" href="/catalogo">Volver al catálogo <Icon name="arrow" size={16}/></Link>}/></div> : <div className="cart-layout"><div className="cart-lines">{lines.map(({ product, quantity }) => <article className="cart-line" key={product.id}><Link href={`/catalogo/${product.id}`} className="cart-line-cover"><ProductCover product={product}/></Link><div className="cart-line-info"><span className="eyebrow">{typeof product.categoria === "object" ? product.categoria.nombre : "EDICIÓN"}</span><Link href={`/catalogo/${product.id}`}><h2>{product.titulo}</h2></Link><span className="cart-unit-price">{formatCurrency(product.precio)} · C/U</span><div className="quantity-control"><button onClick={() => setQuantity(product.id, quantity - 1)} aria-label="Restar una unidad"><Icon name="minus" size={15}/></button><span>{quantity}</span><button onClick={() => setQuantity(product.id, quantity + 1)} aria-label="Sumar una unidad"><Icon name="plus" size={15}/></button><button className="remove-line" onClick={() => remove(product.id)} aria-label={`Quitar ${product.titulo}`}><Icon name="trash" size={15}/> Quitar</button></div></div><strong className="cart-line-total">{formatCurrency(Number(product.precio) * quantity)}</strong></article>)}</div>
      <aside className="cart-summary"><span className="eyebrow">RESUMEN DE EXPEDICIÓN</span><h2>Tu pedido.</h2><div><span>SUBTOTAL</span><strong>{formatCurrency(total)}</strong></div><div><span>ENVÍO</span><strong>Se calcula al preparar</strong></div><div className="summary-total"><span>TOTAL</span><strong>{formatCurrency(total)}</strong></div><button className="button button-primary checkout-button" onClick={checkout} disabled={working}>{working ? "PREPARANDO PEDIDO…" : "CONFIRMAR PEDIDO"}<Icon name="arrow" size={17}/></button><p><Icon name="shield" size={15}/> Compra segura · pago coordinado al recibir confirmación.</p></aside></div>}
  </section>;
}
