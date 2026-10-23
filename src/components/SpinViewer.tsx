"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

type Props = {
  /** Photos at equal angle steps, frame 0 = front. */
  frames: string[];
  /** Frame to rest on. Changing it (or `request`) animates there frame by frame. */
  target: number;
  /** Bump to re-run the animation to the same target (e.g. after the user dragged away). */
  request?: number;
  /** Frame shown first (defaults to `target`). */
  initial?: number;
  /** Frames form a full circle, so take the shortest way round. Off for a partial turn. */
  loop?: boolean;
  /** Milliseconds per frame while animating. */
  step?: number;
  /** Let the user drag left/right to rotate. */
  draggable?: boolean;
  /** Spin all the way round once when first shown. */
  intro?: boolean;
  onFrame?: (frame: number) => void;
  alt: string;
  className?: string;
};

const DRAG_PX_PER_FRAME = 22;
const MAX_WAIT_MS = 2500; // stop waiting for slow images after this
const mod = (a: number, n: number) => ((a % n) + n) % n;

export function SpinViewer({
  frames,
  target,
  request,
  initial,
  loop = true,
  step = 75,
  draggable = false,
  intro = false,
  onFrame,
  alt,
  className,
}: Props) {
  const n = frames.length;
  const [frame, setFrame] = useState(initial ?? target);
  const frameRef = useRef(frame);
  const timer = useRef<number | undefined>(undefined);
  const drag = useRef<{ x: number; start: number } | null>(null);
  const introPending = useRef(intro);
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;
  const loaded = useRef(new Set<number>());
  const markReady = (i: number, img: HTMLImageElement) => {
    if (loaded.current.has(i)) return;
    img
      .decode()
      .catch(() => undefined)
      .then(() => loaded.current.add(i));
  };

  const show = (next: number) => {
    frameRef.current = next;
    setFrame(next);
    onFrameRef.current?.(next);
  };

  useEffect(() => {
    window.clearTimeout(timer.current);
    if (drag.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      show(target);
      return;
    }
    let fullTurn = 0;
    const started = performance.now();
    const patient = () => performance.now() - started < MAX_WAIT_MS;
    const tick = () => {
      if (introPending.current) {
        // Only spin once every photo is in, so no blank frames flash by.
        if (loaded.current.size < n && patient()) {
          timer.current = window.setTimeout(tick, 60);
          return;
        }
        introPending.current = false;
        fullTurn = n;
      }
      const cur = frameRef.current;
      if (fullTurn <= 0 && cur === target) return;
      const dir = fullTurn > 0 ? 1 : loop ? (mod(target - cur, n) <= n / 2 ? 1 : -1) : target > cur ? 1 : -1;
      const next = loop ? mod(cur + dir, n) : cur + dir;
      if (!loaded.current.has(next) && patient()) {
        timer.current = window.setTimeout(tick, 40);
        return;
      }
      if (fullTurn > 0) fullTurn--;
      show(next);
      timer.current = window.setTimeout(tick, step);
    };
    timer.current = window.setTimeout(tick, introPending.current ? 380 : 0);
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, request, n, loop, step]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggable || e.button !== 0) return;
    window.clearTimeout(timer.current);
    drag.current = { x: e.clientX, start: frameRef.current };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    // Dragging right turns the front towards the right (back through the frame order).
    const next = mod(d.start - Math.round((e.clientX - d.x) / DRAG_PX_PER_FRAME), n);
    if (next !== frameRef.current) show(next);
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  return (
    <div
      className={`spin${draggable ? " spin-drag" : ""}${className ? ` ${className}` : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {frames.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={i === frame ? alt : ""}
          aria-hidden={i !== frame}
          className={i === frame ? "on" : undefined}
          draggable={false}
          // Hidden frames aren't decoded until first shown; decode up front so a turn never flashes blank.
          decoding="sync"
          ref={(el) => {
            if (el?.complete && el.naturalWidth) markReady(i, el);
          }}
          onLoad={(e) => markReady(i, e.currentTarget)}
        />
      ))}
    </div>
  );
}
