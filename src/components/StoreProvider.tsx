"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getProduct, type Product } from "@/data/products";
import { store } from "@/config/store";

export type CartLine = { slug: string; size: string; qty: number };
export type ResolvedLine = CartLine & { product: Product; total: number };

type QuickView = { slug: string; from?: DOMRect } | null;

type StoreState = {
  lines: ResolvedLine[];
  count: number;
  subtotal: number;
  discountCode: string;
  discountAmount: number;
  total: number;
  addToCart: (slug: string, size: string, qty?: number) => void;
  setQty: (slug: string, size: string, qty: number) => void;
  removeLine: (slug: string, size: string) => void;
  clearCart: () => void;
  applyDiscount: (code: string) => boolean;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  quickView: QuickView;
  openQuickView: (slug: string, from?: DOMRect) => void;
  closeQuickView: () => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
};

const StoreContext = createContext<StoreState | null>(null);
const CART_KEY = "rail-store-cart";

function readSaved(): { lines: CartLine[]; code: string } {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) ?? "null");
    if (saved && Array.isArray(saved.lines)) return { lines: saved.lines, code: saved.code ?? "" };
  } catch {
    // storage unavailable or corrupt — start empty
  }
  return { lines: [], code: "" };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [rawLines, setRawLines] = useState<CartLine[]>([]);
  const [discountCode, setDiscountCode] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [quickView, setQuickView] = useState<QuickView>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const saved = readSaved();
    setRawLines(saved.lines.filter((l) => getProduct(l.slug)));
    setDiscountCode(saved.code);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify({ lines: rawLines, code: discountCode }));
    } catch {
      // ignore — cart just won't survive a reload
    }
  }, [rawLines, discountCode, loaded]);

  // Lock page scroll while an overlay is open.
  useEffect(() => {
    const locked = cartOpen || !!quickView || searchOpen;
    document.documentElement.classList.toggle("scroll-locked", locked);
  }, [cartOpen, quickView, searchOpen]);

  const addToCart = useCallback((slug: string, size: string, qty = 1) => {
    setRawLines((lines) => {
      const existing = lines.find((l) => l.slug === slug && l.size === size);
      if (existing) return lines.map((l) => (l === existing ? { ...l, qty: l.qty + qty } : l));
      return [...lines, { slug, size, qty }];
    });
  }, []);

  const setQty = useCallback((slug: string, size: string, qty: number) => {
    setRawLines((lines) =>
      qty <= 0
        ? lines.filter((l) => !(l.slug === slug && l.size === size))
        : lines.map((l) => (l.slug === slug && l.size === size ? { ...l, qty } : l)),
    );
  }, []);

  const removeLine = useCallback((slug: string, size: string) => {
    setRawLines((lines) => lines.filter((l) => !(l.slug === slug && l.size === size)));
  }, []);

  const applyDiscount = useCallback((code: string) => {
    const normalised = code.trim().toUpperCase();
    if (!normalised) {
      setDiscountCode("");
      return true;
    }
    if (!(normalised in store.discountCodes)) return false;
    setDiscountCode(normalised);
    return true;
  }, []);

  const value = useMemo<StoreState>(() => {
    const lines = rawLines.flatMap((l) => {
      const product = getProduct(l.slug);
      return product ? [{ ...l, product, total: product.price * l.qty }] : [];
    });
    const subtotal = lines.reduce((sum, l) => sum + l.total, 0);
    const percent = store.discountCodes[discountCode] ?? 0;
    const discountAmount = Math.round(subtotal * percent) / 100;
    return {
      lines,
      count: lines.reduce((sum, l) => sum + l.qty, 0),
      subtotal,
      discountCode,
      discountAmount,
      total: subtotal - discountAmount,
      addToCart,
      setQty,
      removeLine,
      clearCart: () => setRawLines([]),
      applyDiscount,
      cartOpen,
      setCartOpen,
      quickView,
      openQuickView: (slug, from) => setQuickView({ slug, from }),
      closeQuickView: () => setQuickView(null),
      searchOpen,
      setSearchOpen,
    };
  }, [rawLines, discountCode, cartOpen, quickView, searchOpen, addToCart, setQty, removeLine, applyDiscount]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
