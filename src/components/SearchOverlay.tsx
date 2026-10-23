"use client";

import { useEffect, useRef, useState } from "react";
import { products } from "@/data/products";
import { formatPrice } from "@/config/store";
import { useStore } from "./StoreProvider";
import { ProductVisual } from "./ProductVisual";
import { CloseIcon, SearchIcon } from "./Icons";

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, openQuickView } = useStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchOpen) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSearchOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, setSearchOpen]);

  if (!searchOpen) return null;

  const q = query.trim().toLowerCase();
  const results = q
    ? products.filter((p) => `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q))
    : products.slice(0, 6);

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search">
      <div className="search-scrim" onClick={() => setSearchOpen(false)} />
      <div className="search-panel">
        <div className="search-input">
          <SearchIcon />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search hoodies, tees, blazers…" />
          <button className="icon-btn" onClick={() => setSearchOpen(false)} aria-label="Close search">
            <CloseIcon />
          </button>
        </div>
        <p className="muted small">{q ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Popular right now"}</p>
        <ul className="search-results">
          {results.map((p) => (
            <li key={p.slug}>
              <button
                onClick={(e) => {
                  const rect = e.currentTarget.querySelector(".search-thumb")?.getBoundingClientRect();
                  setSearchOpen(false);
                  setQuery("");
                  openQuickView(p.slug, rect);
                }}
              >
                <span className="search-thumb">
                  <ProductVisual product={p} view="front" />
                </span>
                <span>
                  <strong>{p.name}</strong>
                  <span className="muted">{p.category}</span>
                </span>
                <span>{formatPrice(p.price)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
