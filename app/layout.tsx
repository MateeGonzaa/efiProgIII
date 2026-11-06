import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { StoreProviders } from "@/components/providers";
import { Anton } from "next/font/google";
import "./globals.css";

const display = Anton({ subsets: ["latin"], weight: "400", variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: { default: "La Frikicueva — Cómics, manga y libros", template: "%s · La Frikicueva" },
  description: "Tienda online de cómics, manga y libros. Envíos a todo el país desde Córdoba.",
  applicationName: "La Frikicueva",
};

export const viewport: Viewport = { themeColor: "#101010", colorScheme: "dark light" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="es-AR" className={display.variable} data-scroll-behavior="smooth" suppressHydrationWarning><body><StoreProviders>{children}</StoreProviders></body></html>;
}