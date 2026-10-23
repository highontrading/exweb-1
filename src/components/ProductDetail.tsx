"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/data/products";
import { formatPriceExact } from "@/config/store";
import { useStore } from "./StoreProvider";
import { ProductVisual } from "./ProductVisual";
import type { View } from "./GarmentArt";

const views: { id: View; label: string }[] = [
  { id: "front", label: "Front" },
  { id: "back", label: "Back" },
  { id: "side", label: "Side" },
];

export function ProductDetail({ product }: { product: Product }) {
  const { addToCart, setCartOpen } = useStore();
  const [view, setView] = useState<View>("front");
  const [size, setSize] = useState(product.sizes[0]);

  return (
    <section className="page pdp">
      <nav className="crumbs muted small" aria-label="Breadcrumb">
        <Link href="/">Home</Link> / <Link href="/#shop">{product.category}</Link> / <span>{product.name}</span>
      </nav>
      <div className="pdp-layout">
        <div className="pdp-gallery">
          <div className="pdp-main">
            <ProductVisual product={product} view={view} />
          </div>
          <div className="pdp-thumbs">
            {views.map((v) => (
              <button key={v.id} className={view === v.id ? "on" : ""} onClick={() => setView(v.id)} aria-label={`${v.label} view`}>
                <ProductVisual product={product} view={v.id} />
              </button>
            ))}
          </div>
        </div>

        <div className="pdp-info">
          <p className="eyebrow">
            <span>{product.category}</span>
          </p>
          <h1>{product.name}</h1>
          <p className="qv-price">
            {formatPriceExact(product.price)}
            {product.compareAt && <s>{formatPriceExact(product.compareAt)}</s>}
          </p>
          <p className="pdp-desc">{product.description}</p>

          <p className="qv-label">Size</p>
          <div className="size-row" role="radiogroup" aria-label="Size">
            {product.sizes.map((s) => (
              <button key={s} role="radio" aria-checked={size === s} className={`size-pill${size === s ? " on" : ""}`} onClick={() => setSize(s)}>
                {s}
              </button>
            ))}
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              addToCart(product.slug, size);
              setCartOpen(true);
            }}
          >
            Add to cart
          </button>

          <h2 className="qv-label">Details</h2>
          <ul className="pdp-details">
            {product.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
