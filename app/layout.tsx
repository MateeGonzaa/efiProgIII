import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { StoreProviders } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "La Frikicueva — Archivo de mundos", template: "%s · La Frikicueva" },
  description: "Cómics, manga y fantasía para quienes leen entre mundos.",
  applicationName: "La Frikicueva",
};

export const viewport: Viewport = { themeColor: "#101010", colorScheme: "dark light" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="es-AR" data-scroll-behavior="smooth" suppressHydrationWarning><body><StoreProviders>{children}</StoreProviders></body></html>;
}
