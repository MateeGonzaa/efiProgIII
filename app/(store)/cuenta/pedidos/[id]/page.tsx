import type { Metadata } from "next";
import { OrderDetail } from "@/components/order-detail";

export const metadata: Metadata = { title: "Detalle del pedido" };

export default function OrderDetailPage() { return <OrderDetail/>; }
