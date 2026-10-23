"use client";

import { products } from "@/data/products";
import { formatPrice } from "@/config/store";
import { useStore } from "./StoreProvider";
import { ProductVisual } from "./ProductVisual";

export function ProductGrid() {
  const { openQuickView } = useStore();

  return (
    <section className="grid-section" id="shop">
      <div className="grid-head">
        <h2>The Collection</h2>
        <p className="muted">{products.length} pieces</p>
      </div>
      <ul className="product-grid">
        {products.map((p) => (
          <li key={p.slug}>
            <button
              className="product-card"
              onClick={(e) => openQuickView(p.slug, e.currentTarget.querySelector(".card-visual")?.getBoundingClientRect())}
            >
              <span className="card-visual">
                <ProductVisual product={p} view="front" />
              </span>
              <span className="card-meta">
                <span>
                  <strong>{p.name}</strong>
                  <span className="muted">{p.category}</span>
                </span>
                <span>{formatPrice(p.price)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
