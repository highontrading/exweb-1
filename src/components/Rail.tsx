"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent } from "react";
import { products } from "@/data/products";
import { formatPrice, store } from "@/config/store";
import { useStore } from "./StoreProvider";
import { ProductVisual } from "./ProductVisual";
import { SpinViewer } from "./SpinViewer";
import { ArrowRightIcon } from "./Icons";

const BASE_SPEED = 38; // px per second at scale 1
const HOOK_TOP = 4 / 320; // where the hook's top sits inside the 240×320 canvas

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const mod = (a: number, n: number) => ((a % n) + n) % n;

function layout(width: number) {
  const scale = clamp(width / 1280, 0.6, 1.15);
  const spacing = 128 * scale;
  const boxW = 200 * scale;
  const boxH = (boxW * 4) / 3;
  const sag = clamp(width * 0.035, 14, 54);
  const railTop = 26;
  const count = products.length * Math.max(1, Math.ceil((width + spacing * 2 + boxW) / (products.length * spacing)));
  return { scale, spacing, boxW, boxH, sag, railTop, count, loop: count * spacing, height: railTop + sag + boxH + 20 };
}

export function Rail() {
  const { openQuickView, quickView, cartOpen, searchOpen } = useStore();
  const stageRef = useRef<HTMLDivElement>(null);
  const railPathRef = useRef<SVGPathElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);

  const motion = useRef({
    offset: 0,
    placed: false,
    paused: false,
    speed: 0,
    velocity: 0,
    inertia: 0,
    hovering: false,
    active: null as number | null,
    drag: null as null | { lastX: number; lastT: number; moved: number; v: number; captured: boolean },
    suppressClick: false,
  });

  const geo = layout(width || 1280);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    motion.current.active = active;
  }, [active]);

  // Nothing to animate while an overlay covers the rail — keeps the overlay smooth.
  useEffect(() => {
    motion.current.paused = !!quickView || cartOpen || searchOpen;
  }, [quickView, cartOpen, searchOpen]);

  useEffect(() => {
    if (!width) return;
    const g = layout(width);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const half = width / 2 + 40;
    const railY = (x: number) => {
      const t = clamp((x - width / 2) / half, -1, 1);
      return g.railTop + g.sag * (1 - t * t);
    };
    railPathRef.current?.setAttribute(
      "d",
      `M -40 ${g.railTop} Q ${width / 2} ${g.railTop + g.sag * 2} ${width + 40} ${g.railTop}`,
    );

    // First load: start with the first product just right of centre so it drifts through the middle.
    if (!motion.current.placed) {
      motion.current.offset = -(width / 2 + g.spacing * 1.5);
      motion.current.placed = true;
    }

    let raf = 0;
    let last = performance.now();
    let lastOffset = motion.current.offset;
    const cycle = products.length * g.spacing;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const m = motion.current;
      if (m.paused) {
        raf = requestAnimationFrame(tick);
        return;
      }

      if (!m.drag) {
        const cruise = reduced ? 0 : BASE_SPEED * g.scale;
        const target = m.active !== null ? 0 : m.hovering ? cruise * 0.25 : cruise;
        m.speed += (target - m.speed) * Math.min(1, dt * 3);
        m.offset += m.speed * dt;
        if (Math.abs(m.inertia) > 2) {
          m.offset += m.inertia * dt;
          m.inertia *= Math.pow(0.05, dt);
        } else m.inertia = 0;
      }

      const v = dt > 0 ? (m.offset - lastOffset) / dt : 0;
      lastOffset = m.offset;
      m.velocity += (v - m.velocity) * Math.min(1, dt * 6);
      const lean = clamp(-m.velocity * 0.012, -7, 7);

      for (let i = 0; i < g.count; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;
        const x = mod(i * g.spacing - m.offset, g.loop) - g.spacing;
        const y = railY(x) - g.boxH * HOOK_TOP;
        const sway = reduced ? 0 : Math.sin(now / 1100 + i * 1.7) * 0.6;
        el.style.transform = `translate3d(${x - g.boxW / 2}px, ${y}px, 0) rotate(${lean + sway}deg)`;
      }
      if (thumbRef.current) {
        thumbRef.current.style.transform = `translateX(${(mod(m.offset, cycle) / cycle) * 200}%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [width]);

  /* ── drag / swipe to scroll ── */
  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0) return;
    const m = motion.current;
    m.drag = { lastX: e.clientX, lastT: performance.now(), moved: 0, v: 0, captured: false };
    m.inertia = 0;
    m.suppressClick = false;
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    const d = motion.current.drag;
    if (!d) return;
    const now = performance.now();
    const dx = e.clientX - d.lastX;
    motion.current.offset -= dx;
    d.moved += Math.abs(dx);
    d.v = (-dx / Math.max(1, now - d.lastT)) * 1000;
    d.lastX = e.clientX;
    d.lastT = now;
    if (d.moved > 6 && !d.captured) {
      d.captured = true;
      stageRef.current?.setPointerCapture(e.pointerId);
      setActive(null);
    }
  };
  const onPointerUp = () => {
    const m = motion.current;
    if (!m.drag) return;
    if (m.drag.moved > 6) {
      m.suppressClick = true;
      m.inertia = clamp(m.drag.v, -2500, 2500);
    }
    m.drag = null;
  };
  const onWheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) motion.current.offset += e.deltaX;
  };

  const open = (i: number) => {
    if (motion.current.suppressClick) return;
    const product = products[i % products.length];
    const box = itemRefs.current[i]?.querySelector(".rail-turn")?.getBoundingClientRect();
    openQuickView(product.slug, box);
  };

  const activeProduct = active !== null ? products[active % products.length] : null;

  return (
    <section className="rail-section" id="rail" aria-label="Collection rail">
      <div
        ref={stageRef}
        className="rail-stage"
        style={{ height: width ? geo.height : undefined }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") motion.current.hovering = true;
        }}
        onPointerLeave={() => {
          motion.current.hovering = false;
          setActive(null);
        }}
        onWheel={onWheel}
      >
        <svg className="rail-bar" width="100%" height={geo.railTop + geo.sag * 2 + 10} aria-hidden="true">
          <defs>
            <linearGradient id="rail-metal" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#f4f4f5" />
              <stop offset="0.45" stopColor="#a9abb0" />
              <stop offset="1" stopColor="#5c5e63" />
            </linearGradient>
          </defs>
          <path ref={railPathRef} fill="none" stroke="url(#rail-metal)" strokeWidth={7} strokeLinecap="round" />
        </svg>

        {width > 0 &&
          Array.from({ length: geo.count }, (_, i) => {
            const product = products[i % products.length];
            const isActive = active === i;
            const spin = product.images?.spin;
            const quarter = spin ? Math.round(spin.length / 4) : 0;
            return (
              <div
                key={i}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className={`rail-item${isActive ? " is-active" : ""}`}
                style={{ width: geo.boxW, height: geo.boxH }}
              >
                <div className="rail-turn">
                  {spin ? (
                    // 90° → 0°: the garment actually turns to face you
                    <SpinViewer
                      frames={spin.slice(0, quarter + 1)}
                      initial={quarter}
                      target={isActive ? 0 : quarter}
                      loop={false}
                      msPerFrame={150}
                      alt={product.name}
                      className="face"
                    />
                  ) : (
                    <>
                      <ProductVisual product={product} view="side" className="face face-side" />
                      <ProductVisual product={product} view="front" className="face face-front" />
                    </>
                  )}
                </div>
                <span className="price-tag" style={{ fontSize: Math.max(9, 11 * geo.scale) }}>
                  {formatPrice(product.price)}
                </span>
                <button
                  className="rail-hit"
                  style={{ width: geo.spacing * 0.86 }}
                  aria-label={`${product.name}, ${formatPrice(product.price)} — view details`}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                  onPointerLeave={(e) => e.pointerType === "mouse" && setActive((a) => (a === i ? null : a))}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive((a) => (a === i ? null : a))}
                  onClick={() => open(i)}
                />
              </div>
            );
          })}
      </div>

      <div className="rail-footer">
        <div className="rail-info" aria-live="polite">
          {activeProduct ? (
            <>
              <strong>{activeProduct.name}</strong>
              <span>{formatPrice(activeProduct.price)}</span>
            </>
          ) : (
            <span className="muted">
              <span className="hint-mouse">Hover a piece · click to view details</span>
              <span className="hint-touch">Swipe the rail · tap a piece to view</span>
            </span>
          )}
        </div>
        <div className="rail-progress" aria-hidden="true">
          <span ref={thumbRef} />
        </div>
        <div className="rail-cta">
          <p>
            {store.railTagline.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          <Link href="/#shop">
            Shop the Collection <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}
