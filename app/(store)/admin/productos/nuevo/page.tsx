import type { Metadata } from "next";
import { ProductEditorLoader } from "@/components/product-editor-loader";
import { Icon } from "@/components/icon";

export const metadata: Metadata = { title: "Nuevo producto" };

export default function NewProductPage() {
  return <div className="account-card editor-card"><div className="account-card-head"><div><span className="eyebrow">NUEVO PRODUCTO</span><h2>Nueva edición.</h2></div><span className="account-head-icon"><Icon name="plus" size={22}/></span></div><p className="account-intro">Completá los datos de la edición. Se validan antes de guardar y el backend confirma el guardado.</p><ProductEditorLoader/></div>;
}