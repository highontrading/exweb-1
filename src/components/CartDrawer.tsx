"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { formatPriceExact, store } from "@/config/store";
import { useStore } from "./StoreProvider";
import { ProductVisual } from "./ProductVisual";
import { CloseIcon, MinusIcon, PlusIcon, TrashIcon } from "./Icons";

export function CartDrawer() {
  const { cartOpen, setCartOpen, lines, count, subtotal, discountCode, discountAmount, total, setQty, removeLine, applyDiscount } =
    useStore();
  const [discountOpen, setDiscountOpen] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, setCartOpen]);

  const submitCode = (e: FormEvent) => {
    e.preventDefault();
    if (applyDiscount(code)) {
      setCodeError("");
      setCode("");
    } else setCodeError("That code isn't valid.");
  };

  return (
    <div className={`drawer-root${cartOpen ? " open" : ""}`} aria-hidden={!cartOpen} inert={!cartOpen}>
      <div className="drawer-scrim" onClick={() => setCartOpen(false)} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Cart">
        <div className="drawer-head">
          <h2>
            Cart <span className="count-pill">{count}</span>
          </h2>
          <button className="icon-btn round" onClick={() => setCartOpen(false)} aria-label="Close cart">
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="drawer-empty">
            <p>Your cart is empty.</p>
            <Link href="/#rail" className="btn-outline" onClick={() => setCartOpen(false)}>
              Browse the rail
            </Link>
          </div>
        ) : (
          <ul className="cart-lines">
            {lines.map((l) => (
              <li key={`${l.slug}-${l.size}`}>
                <Link href={`/products/${l.slug}`} className="cart-thumb" onClick={() => setCartOpen(false)}>
                  <ProductVisual product={l.product} view="front" />
                </Link>
                <div className="cart-line-info">
                  <p className="cart-line-name">{l.product.name}</p>
                  <p className="muted">{l.size}</p>
                  <p className="muted">{formatPriceExact(l.product.price)}</p>
                  <div className="qty-row">
                    <div className="stepper">
                      <button onClick={() => setQty(l.slug, l.size, l.qty - 1)} aria-label="Decrease quantity">
                        <MinusIcon />
                      </button>
                      <span>{l.qty}</span>
                      <button onClick={() => setQty(l.slug, l.size, l.qty + 1)} aria-label="Increase quantity">
                        <PlusIcon />
                      </button>
                    </div>
                    <button className="icon-btn" onClick={() => removeLine(l.slug, l.size)} aria-label={`Remove ${l.product.name}`}>
                      <TrashIcon />
                    </button>
                  </div>
                </div>
                <p className="cart-line-total">{formatPriceExact(l.total)}</p>
              </li>
            ))}
          </ul>
        )}

        {lines.length > 0 && (
          <div className="drawer-foot">
            <button className="discount-toggle" onClick={() => setDiscountOpen((o) => !o)} aria-expanded={discountOpen}>
              Discount {discountCode && <span className="muted">({discountCode})</span>}
              <PlusIcon style={{ transform: discountOpen ? "rotate(45deg)" : undefined, transition: "transform .2s" }} />
            </button>
            {discountOpen && (
              <form className="discount-form" onSubmit={submitCode}>
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Discount code" aria-label="Discount code" />
                <button type="submit">Apply</button>
                {codeError && <p className="error">{codeError}</p>}
              </form>
            )}
            {discountAmount > 0 && (
              <div className="sum-row muted">
                <span>Subtotal</span>
                <span>{formatPriceExact(subtotal)}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="sum-row muted">
                <span>Discount</span>
                <span>−{formatPriceExact(discountAmount)}</span>
              </div>
            )}
            <div className="sum-row total">
              <span>Estimated total</span>
              <span>
                {formatPriceExact(total)} {store.currency}
              </span>
            </div>
            <p className="muted small">Taxes and shipping calculated at checkout.</p>
            <Link href="/checkout" className="btn-primary square" onClick={() => setCartOpen(false)}>
              Check out
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
