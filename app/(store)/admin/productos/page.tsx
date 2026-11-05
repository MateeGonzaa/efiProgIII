import type { Metadata } from "next";
import { ProductAdminList } from "@/components/product-admin-list";

export const metadata: Metadata = { title: "Gestión de productos" };

export default function AdminProductsPage() { return <ProductAdminList/>; }
