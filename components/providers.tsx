"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { apiRequest, UNAUTHORIZED_EVENT } from "@/lib/api";
import type { CartLine, ProductDetails } from "@/lib/types";

type Session = { token: string; username: string; isStaff: boolean };
type AuthContextValue = {
  session: Session | null;
  ready: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (data: { username: string; email: string; password: string; telefono?: string }) => Promise<void>;
  signOut: () => Promise<void>;
};
type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (product: ProductDetails) => void;
  setQuantity: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};
type ThemeContextValue = { theme: "dark" | "light"; toggleTheme: () => void };

const AuthContext = createContext<AuthContextValue | null>(null);
const CartContext = createContext<CartContextValue | null>(null);
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function StoreProviders({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem("frikicueva-session");
      const savedLines = localStorage.getItem("frikicueva-cart");
      const savedTheme = localStorage.getItem("frikicueva-theme");
      if (savedSession) { const parsed = JSON.parse(savedSession) as Session; setSession({ ...parsed, isStaff: Boolean(parsed.isStaff) }); }
      if (savedLines) setLines(JSON.parse(savedLines) as CartLine[]);
      if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
    } catch {
      localStorage.removeItem("frikicueva-session");
      localStorage.removeItem("frikicueva-cart");
    }
    setReady(true);
  }, []);

  useEffect(() => {
    const expire = () => { localStorage.removeItem("frikicueva-session"); setSession(null); };
    window.addEventListener(UNAUTHORIZED_EVENT, expire);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, expire);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem("frikicueva-cart", JSON.stringify(lines));
  }, [lines, ready]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (ready) localStorage.setItem("frikicueva-theme", theme);
  }, [theme, ready]);

  const signIn = useCallback(async (username: string, password: string) => {
    const result = await apiRequest<{ token: string; usuario: { username: string; is_staff: boolean } }>("auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    const next = { token: result.token, username: result.usuario?.username ?? username, isStaff: Boolean(result.usuario?.is_staff) };
    localStorage.setItem("frikicueva-session", JSON.stringify(next));
    setSession(next);
  }, []);

  const signUp = useCallback(async (data: { username: string; email: string; password: string; telefono?: string }) => {
    const result = await apiRequest<{ token: string }>("auth/registro/", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const next = { token: result.token, username: data.username, isStaff: false };
    localStorage.setItem("frikicueva-session", JSON.stringify(next));
    setSession(next);
  }, []);

  const signOut = useCallback(async () => {
    const active = session;
    if (active) await apiRequest<void>("auth/logout/", { method: "POST", token: active.token }).catch(() => undefined);
    localStorage.removeItem("frikicueva-session");
    setSession(null);
  }, [session]);

  const add = useCallback((product: ProductDetails) => {
    setLines((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      if (existing) return current.map((line) => line.product.id === product.id ? { ...line, quantity: Math.min(line.quantity + 1, product.stock ?? 99) } : line);
      return [...current, { product, quantity: 1 }];
    });
  }, []);
  const setQuantity = useCallback((productId: number, quantity: number) => {
    setLines((current) => current.map((line) => line.product.id === productId ? { ...line, quantity: Math.max(1, Math.min(quantity, line.product.stock ?? 99)) } : line));
  }, []);
  const remove = useCallback((productId: number) => setLines((current) => current.filter((line) => line.product.id !== productId)), []);
  const clear = useCallback(() => setLines([]), []);

  const authValue = useMemo(() => ({ session, ready, signIn, signUp, signOut }), [session, ready, signIn, signUp, signOut]);
  const cartValue = useMemo(() => ({
    lines,
    count: lines.reduce((total, line) => total + line.quantity, 0),
    total: lines.reduce((sum, line) => sum + Number(line.product.precio) * line.quantity, 0),
    add, setQuantity, remove, clear,
  }), [lines, add, setQuantity, remove, clear]);
  const themeValue = useMemo(() => ({ theme, toggleTheme: () => setTheme((current) => current === "dark" ? "light" : "dark") }), [theme]);

  return <AuthContext.Provider value={authValue}><CartContext.Provider value={cartValue}><ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider></CartContext.Provider></AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth debe usarse dentro de StoreProviders.");
  return value;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart debe usarse dentro de StoreProviders.");
  return value;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme debe usarse dentro de StoreProviders.");
  return value;
}
