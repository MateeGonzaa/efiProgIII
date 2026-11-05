import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/api";
import { mockProducts } from "@/lib/mock-data";
import type { ProductDetails } from "@/lib/types";
import { ProductDetailClient } from "@/components/product-detail-client";
import { BackLink } from "@/components/status";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const found = mockProducts.find((product) => product.id === Number(id));
  return { title: found?.titulo ?? "Edición" };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  let product: ProductDetails | undefined;
  try { product = await getProduct(id); }
  catch { product = mockProducts.find((item) => item.id === Number(id)); }
  if (!product) notFound();
  return <><ProductDetailClient product={product}/><div className="detail-back page-shell"><BackLink/></div></>;
}
