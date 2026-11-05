import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return <><SiteHeader/><main className="store-main">{children}</main><SiteFooter/></>;
}
