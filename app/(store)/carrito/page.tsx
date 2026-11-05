import type { Metadata } from "next";
import { CartPage } from "@/components/cart-page";

export const metadata: Metadata = { title: "Tu bolsa" };

export default function CartRoute() { return <CartPage/>; }
