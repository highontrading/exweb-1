"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getProduct, products, type Product } from "@/data/products";
import { formatPriceExact } from "@/config/store";
import { useStore } from "./StoreProvider";
import { ProductVisual } from "./ProductVisual";
import { SpinViewer } from "./SpinViewer";
import { CloseIcon } from "./Icons";

export function QuickView() {
  const { quickView, closeQuickView } = useStore();
  const [closing, setClosing] = useState(false);
  const product = quickView ? getProduct(quickView.slug) : undefined;

  if (!quickView || !product) return null;

  const close = () => {
    setClosing(true);
    window.setTimeout(() => {
      closeQuickView();
      setClosing(false);
    }, 220);
  };

  return (
    <div className={`quickview${closing ? " closing" : ""}`} role="dialog" aria-modal="true" aria-label={product.name}>
      <Panel key={product.slug} product={product} from={quickView.from} onClose={close} />
    </div>
  );
}

function Panel({ product, from, onClose }: { product: Product; from?: DOMRect; onClose: () => void }) {
  const { addToCart, setCartOpen, openQuickView } = useStore();
  const [view, setView] = useState<"front" | "back">("front");
  const spin = product.images?.spin;
  const half = spin ? Math.round(spin.length / 2) : 0;
  const [goal, setGoal] = useState({ frame: 0, id: 0 });
  const [frame, setFrame] = useState(0);
  const shownView = spin ? (frame === 0 ? "front" : frame === half ? "back" : null) : view;
  const pick = (v: "front" | "back") =>
    spin ? setGoal({ frame: v === "front" ? 0 : half, id: Date.now() }) : setView(v);
  const [size, setSize] = useState(product.sizes[0]);
  const [adding, setAdding] = useState(false);
  const visualRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const index = products.findIndex((p) => p.slug === product.slug);

  // FLIP: grow the garment from where it hung on the rail into place.
  useLayoutEffect(() => {
    const el = visualRef.current;
    if (!el || !from || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const to = el.getBoundingClientRect();
    if (!to.width) return;
    el.animate(
      [
        { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})` },
        { transform: "none" },
      ],
      { duration: 650, easing: "cubic-bezier(.2,.8,.2,1)" },
    );
  }, [from]);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const step = e.key === "ArrowRight" ? 1 : -1;
        openQuickView(products[(index + step + products.length) % products.length].slug);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, openQuickView]);

  const add = () => {
    setAdding(true);
    window.setTimeout(() => {
      addToCart(product.slug, size);
      onClose();
      setCartOpen(true);
    }, 450);
  };

  return (
    <>
      <button ref={closeRef} className="qv-close" onClick={onClose}>
        Close <CloseIcon width={16} height={16} />
      </button>
      <div className="qv-layout">
        <div className="qv-visual-wrap">
          <div ref={visualRef} className="qv-visual">
            {spin ? (
              <SpinViewer
                frames={spin}
                target={goal.frame}
                request={goal.id}
                intro
                introDelay={650}
                draggable
                onFrame={setFrame}
                alt={product.name}
                className="qv-img"
              />
            ) : (
              <ProductVisual product={product} view={view} className="qv-img" />
            )}
          </div>
          {spin && <p className="spin-hint">Drag to rotate · 360°</p>}
        </div>

        <div className="qv-details">
          <p className="qv-index">
            {index + 1} / {products.length}
          </p>
          <h2>{product.name}</h2>
          <p className="qv-price">
            {formatPriceExact(product.price)}
            {product.compareAt && <s>{formatPriceExact(product.compareAt)}</s>}
          </p>

          <div className="qv-tabs" role="tablist" aria-label="View">
            {(["front", "back"] as const).map((v) => (
              <button key={v} role="tab" aria-selected={shownView === v} className={shownView === v ? "on" : ""} onClick={() => pick(v)}>
                {v === "front" ? "Front" : "Back"}
              </button>
            ))}
          </div>

          <p className="qv-label">Size</p>
          <div className="size-row" role="radiogroup" aria-label="Size">
            {product.sizes.map((s) => (
              <button key={s} role="radio" aria-checked={size === s} className={`size-pill${size === s ? " on" : ""}`} onClick={() => setSize(s)}>
                {s}
              </button>
            ))}
          </div>

          <button className="btn-primary" onClick={add} disabled={adding}>
            {adding ? (
              <>
                <span className="spinner" aria-hidden="true" /> Adding to cart
              </>
            ) : (
              "Add to cart"
            )}
          </button>

          <div className="qv-foot">
            <span>{product.name}</span>
            <Link href={`/products/${product.slug}`} onClick={onClose}>
              View product page
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
