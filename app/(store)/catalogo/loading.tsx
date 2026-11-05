import { LoadingGrid } from "@/components/status";

export default function CatalogLoading() {
  return <section className="catalog-page page-shell"><span className="eyebrow">ABRIENDO EL ARCHIVO…</span><h1>Un momento.</h1><LoadingGrid/></section>;
}
