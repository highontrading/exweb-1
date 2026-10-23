"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

type Props = {
  /** Photos at equal angle steps, frame 0 = front. */
  frames: string[];
  /** Frame to rest on. Changing it (or `request`) turns the garment there. */
  target: number;
  /** Bump to re-run the turn to the same target (e.g. after the user dragged away). */
  request?: number;
  /** Frame shown first (defaults to `target`). */
  initial?: number;
  /** Frames form a full circle, so take the shortest way round. Off for a partial turn. */
  loop?: boolean;
  /** Milliseconds a turn takes per frame step. */
  msPerFrame?: number;
  /** Let the user drag left/right to rotate. */
  draggable?: boolean;
  /** Spin all the way round once when first shown. */
  intro?: boolean;
  /** Delay before the intro spin (lets an opening animation finish). */
  introDelay?: number;
  onFrame?: (frame: number) => void;
  alt: string;
  className?: string;
};

const INTRO_MS = 1700;
const mod = (a: number, n: number) => ((a % n) + n) % n;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Width of the garment at chest height, used to morph outlines between frames. */
async function silhouetteWidth(img: HTMLImageElement) {
  const w = 90;
  const h = 120;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return 1;
  // Downscale off the main thread where supported, so measuring doesn't stall the opening animation.
  const small = await createImageBitmap(img, { resizeWidth: w, resizeHeight: h }).catch(() => null);
  ctx.drawImage(small ?? img, 0, 0, w, h);
  small?.close();
  const data = ctx.getImageData(0, Math.round(h * 0.3), w, Math.round(h * 0.3)).data;
  let lo = w;
  let hi = 0;
  for (let p = 3; p < data.length; p += 4) {
    if (data[p] > 140) {
      const x = ((p - 3) / 4) % w;
      lo = Math.min(lo, x);
      hi = Math.max(hi, x);
    }
  }
  return Math.max(1, hi - lo);
}

/**
 * A 360° product spinner drawn on a canvas. Between two photos it cross-fades while
 * squeezing/stretching their outlines towards each other — the same foreshortening a
 * real turn shows — so 12 photos read as one continuous rotation rather than a flipbook.
 */
export function SpinViewer({
  frames,
  target,
  request,
  initial,
  loop = true,
  msPerFrame = 130,
  draggable = false,
  intro = false,
  introDelay = 400,
  onFrame,
  alt,
  className,
}: Props) {
  const n = frames.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);
  const markReady = () => {
    if (readyRef.current) return;
    readyRef.current = true;
    setReady(true);
  };
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  const s = useRef({
    imgs: [] as (HTMLImageElement | null)[],
    widths: [] as number[],
    loadedCount: 0,
    pos: initial ?? target,
    drawn: NaN,
    anim: null as null | { from: number; to: number; start: number; dur: number },
    velocity: 0,
    drag: null as null | { x: number; startPos: number; lastX: number; lastT: number },
    raf: 0,
    lastTick: 0,
    emitted: -1,
    introPending: intro,
  });

  const wrap = (k: number) => (loop ? mod(k, n) : clamp(k, 0, n - 1));

  /** Paint the current position; returns false if nothing could be drawn yet. */
  const draw = () => {
    const st = s.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !canvas.width) return false;
    const pos = loop ? st.pos : clamp(st.pos, 0, n - 1);
    const i0 = Math.floor(pos);
    const t = pos - i0;
    const a = wrap(i0);
    const b = wrap(i0 + 1);
    const imgA = st.imgs[a] ?? st.imgs[b] ?? st.imgs.find(Boolean);
    if (!imgA) return false;
    const imgB = st.imgs[b];

    const W = canvas.width;
    const H = canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const scale = Math.min(W / imgA.naturalWidth, H / imgA.naturalHeight);
    const dw = imgA.naturalWidth * scale;
    const dh = imgA.naturalHeight * scale;
    const dx = (W - dw) / 2;
    const dy = (H - dh) / 2;
    const cx = W / 2;
    const put = (img: HTMLImageElement, alpha: number, sx: number) => {
      ctx.globalAlpha = alpha;
      ctx.setTransform(sx, 0, 0, 1, cx * (1 - sx), 0);
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    if (t < 0.002 || !imgB || a === b || imgA !== st.imgs[a]) {
      put(imgA, 1, 1);
    } else {
      const r = clamp((st.widths[b] || 1) / (st.widths[a] || 1), 0.35, 2.9);
      const e = smooth(t);
      // 'lighter' on premultiplied pixels = an exact linear blend, so nothing turns see-through mid-fade.
      ctx.globalCompositeOperation = "lighter";
      put(imgA, 1 - e, 1 + (r - 1) * t);
      put(imgB, e, 1 / r + (1 - 1 / r) * t);
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.globalAlpha = 1;
    st.drawn = st.pos;

    const nearest = wrap(Math.round(pos));
    if (nearest !== st.emitted) {
      st.emitted = nearest;
      rootRef.current?.setAttribute("data-frame", String(nearest));
      onFrameRef.current?.(nearest);
    }
    return true;
  };

  const loopTick = (now: number) => {
    const st = s.current;
    st.raf = 0;
    const dt = st.lastTick ? Math.min(0.05, (now - st.lastTick) / 1000) : 1 / 60;
    st.lastTick = now;
    let busy = !!st.drag;

    if (!st.drag && st.velocity) {
      st.pos += st.velocity * dt;
      st.velocity *= Math.pow(0.04, dt); // friction
      if (!loop) st.pos = clamp(st.pos, 0, n - 1);
      if (Math.abs(st.velocity) < 1.2) {
        st.velocity = 0;
        startTurn(Math.round(st.pos), true); // settle on the nearest photo
      }
      busy = true;
    }
    if (!st.drag && !st.velocity && st.anim) {
      const k = Math.min(1, (now - st.anim.start) / st.anim.dur);
      st.pos = st.anim.from + (st.anim.to - st.anim.from) * easeInOut(k);
      if (k >= 1) {
        st.pos = loop ? mod(st.anim.to, n) : st.anim.to;
        st.anim = null;
      } else busy = true;
    }
    if (st.pos !== st.drawn && draw()) markReady();
    if (busy) st.raf = requestAnimationFrame(loopTick);
    else st.lastTick = 0;
  };

  const kick = () => {
    if (!s.current.raf) s.current.raf = requestAnimationFrame(loopTick);
  };

  /** Turn to a frame (shortest way round), or `exact` to land on that position as given. */
  const startTurn = (to: number, exact = false) => {
    const st = s.current;
    const dest = !exact && loop ? st.pos + (mod(to - st.pos + n / 2, n) - n / 2) : to;
    const dist = Math.abs(dest - st.pos);
    if (dist < 0.001) {
      st.anim = null;
      st.pos = loop ? mod(dest, n) : dest;
    } else {
      st.anim = { from: st.pos, to: dest, start: performance.now(), dur: clamp(dist * msPerFrame, 180, INTRO_MS) };
    }
    kick();
  };

  // Load + decode every frame once; measure outlines for the morph.
  useEffect(() => {
    const st = s.current;
    let cancelled = false;
    st.imgs = frames.map(() => null);
    st.widths = frames.map(() => 1);
    st.loadedCount = 0;
    frames.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      img
        .decode()
        .then(() => {
          if (cancelled) return;
          st.imgs[i] = img;
          st.loadedCount++;
          void silhouetteWidth(img).then((w) => {
            st.widths[i] = w;
          });
          st.drawn = NaN; // repaint once on the next frame, however many photos land at once
          kick();
          if (st.loadedCount === n && st.introPending) {
            st.introPending = false;
            if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
              window.setTimeout(() => {
                if (cancelled || st.drag || st.anim) return;
                st.anim = { from: st.pos, to: st.pos + n, start: performance.now(), dur: INTRO_MS };
                kick();
              }, introDelay);
            }
          }
        })
        .catch(() => undefined);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(st.raf);
      st.raf = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames.join("|")]);

  // Keep the canvas sharp at its displayed size.
  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const ro = new ResizeObserver(([entry]) => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(entry.contentRect.width * dpr);
      canvas.height = Math.round(entry.contentRect.height * dpr);
      s.current.drawn = NaN;
      if (draw()) markReady();
    });
    ro.observe(root);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Turn to the requested frame.
  useEffect(() => {
    const st = s.current;
    if (st.drag) return;
    st.velocity = 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      st.anim = null;
      st.pos = target;
      draw();
      return;
    }
    startTurn(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, request]);

  /* ── drag to rotate, with momentum ── */
  const pxPerFrame = () => Math.max(28, (rootRef.current?.clientWidth ?? 400) / 10);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggable || e.button !== 0) return;
    const st = s.current;
    st.anim = null;
    st.velocity = 0;
    st.introPending = false;
    st.drag = { x: e.clientX, startPos: st.pos, lastX: e.clientX, lastT: performance.now() };
    e.currentTarget.setPointerCapture(e.pointerId);
    kick();
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const st = s.current;
    const d = st.drag;
    if (!d) return;
    const now = performance.now();
    // Dragging right turns the front towards the right (back through the frame order).
    st.pos = d.startPos - (e.clientX - d.x) / pxPerFrame();
    if (!loop) st.pos = clamp(st.pos, 0, n - 1);
    const dt = Math.max(1, now - d.lastT) / 1000;
    const v = -(e.clientX - d.lastX) / pxPerFrame() / dt;
    st.velocity = st.velocity * 0.6 + v * 0.4; // smoothed; applied as momentum on release
    d.lastX = e.clientX;
    d.lastT = now;
    kick();
  };
  const onPointerUp = () => {
    const st = s.current;
    if (!st.drag) return;
    const stopped = performance.now() - st.drag.lastT > 90; // finger paused before lifting
    st.drag = null;
    st.velocity = stopped ? 0 : clamp(st.velocity, -40, 40);
    if (!st.velocity) startTurn(Math.round(st.pos), true);
    kick();
  };

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label={alt}
      data-ready={ready}
      className={`spin${draggable ? " spin-drag" : ""}${className ? ` ${className}` : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Shown until the canvas has its first frame (and to search engines / without JS). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="spin-still" src={frames[initial ?? target]} alt="" draggable={false} />
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
