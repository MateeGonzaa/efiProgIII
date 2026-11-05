import type { ReactNode } from "react";

// A diferencia del layout, el template se vuelve a montar en cada navegación: así la transición se repite en cada ruta.
export default function StoreTemplate({ children }: { children: ReactNode }) {
  return <div className="route-fade">{children}</div>;
}
