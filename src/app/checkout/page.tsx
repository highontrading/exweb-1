"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { formatPriceExact, store } from "@/config/store";
import { useStore } from "@/components/StoreProvider";
import { ProductVisual } from "@/components/ProductVisual";

const fields = [
  { name: "name", label: "Full name", autoComplete: "name", wide: true },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
  { name: "address", label: "Address", autoComplete: "street-address", wide: true },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "postcode", label: "Postcode / PIN", autoComplete: "postal-code" },
  { name: "country", label: "Country", autoComplete: "country-name", wide: true },
];

export default function CheckoutPage() {
  const { lines, subtotal, discountAmount, discountCode, total } = useStore();
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: connect a payment provider (Razorpay / Stripe) here and create the order.
    setSubmitted(true);
  };

  if (lines.length === 0) {
    return (
      <section className="page narrow center">
        <h1 className="page-title">Your cart is empty.</h1>
        <Link href="/#rail" className="btn-outline">
          Back to the rail
        </Link>
      </section>
    );
  }

  return (
    <section className="page checkout">
      <form className="checkout-form" onSubmit={onSubmit}>
        <h1 className="page-title">Checkout</h1>
        <h2 className="qv-label">Contact &amp; delivery</h2>
        <div className="field-grid">
          {fields.map((f) => (
            <label key={f.name} className={f.wide ? "wide" : ""}>
              <span>{f.label}</span>
              <input name={f.name} type={f.type ?? "text"} autoComplete={f.autoComplete} required />
            </label>
          ))}
        </div>
        {submitted ? (
          <p className="notice">
            Details received. <strong>Online payment isn&apos;t connected yet</strong> — this is where the payment step
            will go once a payment provider is set up.
          </p>
        ) : (
          <button className="btn-primary square" type="submit">
            Continue to payment · {formatPriceExact(total)}
          </button>
        )}
      </form>

      <aside className="checkout-summary">
        <h2 className="qv-label">Order summary</h2>
        <ul>
          {lines.map((l) => (
            <li key={`${l.slug}-${l.size}`}>
              <span className="cart-thumb">
                <ProductVisual product={l.product} view="front" />
                <span className="qty-badge">{l.qty}</span>
              </span>
              <span>
                <strong>{l.product.name}</strong>
                <span className="muted small">Size {l.size}</span>
              </span>
              <span>{formatPriceExact(l.total)}</span>
            </li>
          ))}
        </ul>
        <div className="sum-row muted">
          <span>Subtotal</span>
          <span>{formatPriceExact(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="sum-row muted">
            <span>Discount ({discountCode})</span>
            <span>−{formatPriceExact(discountAmount)}</span>
          </div>
        )}
        <div className="sum-row muted">
          <span>Shipping</span>
          <span>Calculated next</span>
        </div>
        <div className="sum-row total">
          <span>Total</span>
          <span>
            {formatPriceExact(total)} {store.currency}
          </span>
        </div>
      </aside>
    </section>
  );
}
