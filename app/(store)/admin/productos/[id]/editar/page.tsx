import type { Metadata } from "next";
import { ProductEditorLoader } from "@/components/product-editor-loader";
import { Icon } from "@/components/icon";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Editar producto" };

// Ruta dinámica /admin/productos/[id]/editar. La página solo arma el marco: los datos los pide ProductEditorLoader desde el navegador.
export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  return <div className="account-card editor-card"><div className="account-card-head"><div><span className="eyebrow">EDITAR PRODUCTO · {id.padStart(3, "0")}</span><h2>Editar edición.</h2></div><span className="account-head-icon"><Icon name="pencil" size={22}/></span></div><p className="account-intro">Actualizá los datos de esta edición y guardá los cambios en el catálogo.</p><ProductEditorLoader productId={id}/></div>;
}