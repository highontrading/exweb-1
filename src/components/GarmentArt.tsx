import { useId } from "react";
import type { Product } from "@/data/products";
import { luminance, shade } from "@/lib/color";

export type View = "side" | "front" | "back";

type Art = Product["art"];

// All views share one 240×320 canvas with the hanger hook at the top centre,
// so a real photo (3:4, hook at top centre) can replace any of them 1:1.

const WOOD = "#7a4a2b";
const WIRE = "#8e9095";

function Hook() {
  return (
    <path
      d="M120 48 L120 30 C120 22 129 21 129 13 C129 6 123 3 118 4 C113 5 111 9 111 12"
      fill="none"
      stroke={WIRE}
      strokeWidth={2.6}
      strokeLinecap="round"
    />
  );
}

function Print({ art, view }: { art: Art; view: View }) {
  if (!art.print || view !== "front") return null;
  const color = art.printColor ?? "#fff";
  const outline = shade(art.color, -0.35);
  const style = art.printStyle ?? "arch";
  const top = art.kind === "tee" ? 0 : 6;

  if (style === "chest") {
    return (
      <text x={88} y={128 + top} fill={color} fontSize={12} fontFamily="Georgia, serif" fontStyle="italic" fontWeight={700}>
        {art.print}
      </text>
    );
  }
  if (style === "center") {
    const size = Math.min(30, 170 / (art.print.length * 0.62));
    return (
      <text
        x={120}
        y={150 + top}
        fill={color}
        fontSize={size}
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight={700}
        letterSpacing={0.5}
      >
        {art.print}
      </text>
    );
  }
  const size = Math.min(26, 112 / (art.print.length * 0.8));
  const pathId = `arc-${art.kind}-${art.print}`.replace(/\W/g, "");
  return (
    <g>
      <defs>
        <path id={pathId} d={`M62 ${170 + top} Q120 ${124 + top} 178 ${170 + top}`} />
      </defs>
      <text
        fill={color}
        stroke={outline}
        strokeWidth={1.2}
        paintOrder="stroke"
        fontSize={size}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight={800}
        letterSpacing={1}
        textAnchor="middle"
      >
        <textPath href={`#${pathId}`} startOffset="50%">
          {art.print}
        </textPath>
      </text>
    </g>
  );
}

/* ───────────── front / back silhouettes ───────────── */

const LONG_SLEEVE_BODY =
  "M102 56 C112 58 128 58 138 56 C152 58 170 64 182 70 C194 76 200 90 201 108 L208 262 L184 266 L178 132 L178 292 Q120 298 62 292 L62 132 L56 266 L32 262 L39 108 C40 90 46 76 58 70 C70 64 88 58 102 56 Z";

const TEE_BODY =
  "M100 56 C112 59 128 59 140 56 C152 58 166 62 180 68 L214 108 L194 126 L176 110 L176 288 Q120 294 64 288 L64 110 L46 126 L26 108 L60 68 C74 62 88 58 100 56 Z";

const BLAZER_BODY =
  "M100 54 C112 56 128 56 140 54 C156 58 172 62 186 66 C196 70 200 84 200 100 L206 268 L184 272 L180 130 L182 300 Q160 304 128 300 L120 290 L112 300 Q80 304 58 300 L60 130 L56 272 L34 268 L40 100 C40 84 44 70 54 66 C68 62 84 58 100 54 Z";

function FrontBack({ art, view, fill }: { art: Art; view: View; fill: string }) {
  const dark = shade(art.color, -0.22);
  const darker = shade(art.color, -0.4);
  const line = luminance(art.color) > 150 ? shade(art.color, -0.3) : shade(art.color, 0.18);
  const isBack = view === "back";

  if (art.kind === "tee") {
    return (
      <g>
        <path d="M70 72 Q120 40 170 72" fill="none" stroke={WOOD} strokeWidth={7} strokeLinecap="round" />
        <path d={TEE_BODY} fill={fill} />
        <path d="M176 110 L194 126 M64 110 L46 126" stroke={dark} strokeWidth={1.4} opacity={0.6} />
        {isBack ? (
          <path d="M100 56 C110 61 130 61 140 56" fill="none" stroke={dark} strokeWidth={4} />
        ) : (
          <>
            <path d="M100 56 C106 50 134 50 140 56 C134 66 106 66 100 56 Z" fill={darker} />
            <path d="M100 56 C106 68 134 68 140 56" fill="none" stroke={dark} strokeWidth={4} />
          </>
        )}
        <path d="M98 140 Q102 210 96 280 M146 150 Q140 214 146 282" fill="none" stroke={line} strokeWidth={1.2} opacity={0.35} />
        <Print art={art} view={view} />
      </g>
    );
  }

  if (art.kind === "blazer") {
    return (
      <g>
        <path d={BLAZER_BODY} fill={fill} />
        <path d="M180 130 L184 272 M60 130 L56 272" stroke={darker} strokeWidth={1.2} opacity={0.6} />
        {isBack ? (
          <>
            <path d="M100 54 C110 62 130 62 140 54" fill="none" stroke={dark} strokeWidth={5} />
            <path d="M120 220 L120 296" stroke={darker} strokeWidth={1.4} opacity={0.7} />
            <path d="M120 60 L120 220" stroke={dark} strokeWidth={1} opacity={0.5} />
          </>
        ) : (
          <>
            <path d="M104 56 L136 56 L120 152 Z" fill="#ebe8e2" />
            <path d="M108 56 L120 70 L132 56" fill="none" stroke="#d3cfc7" strokeWidth={1.5} />
            <path d="M104 56 L90 66 L84 100 L96 104 L88 112 L120 172 L120 152 Z" fill={shade(art.color, 0.06)} stroke={darker} strokeWidth={1} />
            <path d="M136 56 L150 66 L156 100 L144 104 L152 112 L120 172 L120 152 Z" fill={shade(art.color, 0.06)} stroke={darker} strokeWidth={1} />
            <path d="M120 172 L120 290" stroke={darker} strokeWidth={1.4} />
            <circle cx={125} cy={198} r={3.2} fill={darker} />
            <circle cx={125} cy={234} r={3.2} fill={darker} />
            <path d="M72 230 L106 228 L106 236 L72 238 Z M134 228 L168 230 L168 238 L134 236 Z" fill={dark} opacity={0.8} />
            <path d="M140 124 L164 122" stroke={dark} strokeWidth={2.5} />
          </>
        )}
      </g>
    );
  }

  // hoodie + crewneck share the long-sleeve body
  const isHoodie = art.kind === "hoodie";
  return (
    <g>
      {isHoodie && (
        <path d="M88 76 C84 44 100 26 120 26 C140 26 156 44 152 76 Z" fill={shade(art.color, -0.1)} />
      )}
      {!isHoodie && <path d="M62 72 Q120 38 178 72" fill="none" stroke={WOOD} strokeWidth={7} strokeLinecap="round" />}
      <path d={LONG_SLEEVE_BODY} fill={fill} />
      <path d="M178 132 L184 266 M62 132 L56 266" stroke={darker} strokeWidth={1.2} opacity={0.55} />
      {/* rib cuffs + hem */}
      <path d="M183 250 L207 246 L208 262 L184 266 Z M57 250 L33 246 L32 262 L56 266 Z" fill={dark} />
      <path d="M62 278 Q120 284 178 278 L178 292 Q120 298 62 292 Z" fill={dark} />
      <path d="M98 140 Q103 205 96 276 M146 146 Q139 210 146 276" fill="none" stroke={line} strokeWidth={1.2} opacity={0.3} />

      {isHoodie && !isBack && (
        <>
          <path d="M100 56 C104 72 112 82 120 85 C128 82 136 72 140 56 C134 48 106 48 100 56 Z" fill={darker} />
          <path d="M100 56 C104 72 112 82 120 85 C128 82 136 72 140 56" fill="none" stroke={dark} strokeWidth={3} />
          <path d="M113 82 L111 134 M127 82 L129 134" stroke={shade(art.color, luminance(art.color) > 150 ? -0.15 : 0.55)} strokeWidth={2.4} strokeLinecap="round" />
          <path d="M84 206 L156 206 L168 268 L72 268 Z" fill="none" stroke={darker} strokeWidth={1.4} opacity={0.55} />
        </>
      )}
      {isHoodie && isBack && (
        <>
          <path d="M88 58 C94 52 146 52 152 58 L154 130 C140 150 100 150 86 130 Z" fill={shade(art.color, 0.03)} stroke={dark} strokeWidth={1.4} />
          <path d="M120 56 L120 144" stroke={dark} strokeWidth={1.2} opacity={0.7} />
        </>
      )}
      {!isHoodie &&
        (isBack ? (
          <path d="M100 56 C110 61 130 61 140 56" fill="none" stroke={dark} strokeWidth={5} />
        ) : (
          <>
            <path d="M100 56 C106 50 134 50 140 56 C134 66 106 66 100 56 Z" fill={darker} />
            <path d="M100 56 C106 69 134 69 140 56" fill="none" stroke={dark} strokeWidth={5} />
          </>
        ))}
      <Print art={art} view={view} />
    </g>
  );
}

/* ───────────── side profiles ───────────── */

function Side({ art, fill, sleeveFill }: { art: Art; fill: string; sleeveFill: string }) {
  const dark = shade(art.color, -0.22);
  const darker = shade(art.color, -0.4);

  if (art.kind === "tee") {
    return (
      <g>
        <path d="M110 58 C116 54 124 54 130 58 C140 70 144 90 144 112 L146 282 Q120 288 94 282 L96 112 C96 90 100 70 110 58 Z" fill={fill} />
        <path d="M114 62 C130 64 140 80 141 98 L142 128 L118 131 L116 90 Z" fill={sleeveFill} />
        <path d="M118 124 L142 122" stroke={dark} strokeWidth={1.4} />
      </g>
    );
  }
  if (art.kind === "blazer") {
    return (
      <g>
        <path d="M106 58 C114 52 126 52 134 58 C142 64 146 80 146 100 L150 300 Q120 304 92 296 L94 100 C94 80 98 64 106 58 Z" fill={fill} />
        <path d="M112 60 C130 60 139 78 139 100 L141 270 L119 272 L116 100 Z" fill={sleeveFill} />
        <path d="M134 60 L146 122" stroke={darker} strokeWidth={1.4} />
        <path d="M141 228 L150 228" stroke={dark} strokeWidth={2.5} />
      </g>
    );
  }
  const isHoodie = art.kind === "hoodie";
  return (
    <g>
      {isHoodie && (
        <path d="M106 62 C88 66 82 88 86 112 C88 124 96 132 102 132 C100 110 104 84 112 64 Z" fill={shade(art.color, -0.12)} />
      )}
      <path d="M110 58 C116 54 124 54 130 58 C140 72 146 96 146 130 L150 286 Q120 294 90 286 L94 130 C94 96 100 72 110 58 Z" fill={fill} />
      <path d="M90 274 Q120 280 150 274 L150 286 Q120 294 90 286 Z" fill={dark} />
      <path d="M114 62 C130 64 138 84 138 112 L140 262 L118 264 L116 120 C114 98 112 80 114 62 Z" fill={sleeveFill} />
      <path d="M118 250 L140 249 L140 262 L118 264 Z" fill={dark} />
      {isHoodie && <path d="M138 72 L142 128" stroke={shade(art.color, luminance(art.color) > 150 ? -0.15 : 0.5)} strokeWidth={2} strokeLinecap="round" />}
    </g>
  );
}

export function GarmentArt({ art, view, className }: { art: Art; view: View; className?: string }) {
  const id = useId().replace(/:/g, "");
  const gradient = `g${id}`;
  const sleeveGradient = `s${id}`;

  return (
    <svg viewBox="0 0 240 320" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradient} x1="0" x2="1" y1="0" y2="0.15">
          <stop offset="0" stopColor={shade(art.color, 0.1)} />
          <stop offset="0.5" stopColor={art.color} />
          <stop offset="1" stopColor={shade(art.color, -0.16)} />
        </linearGradient>
        <linearGradient id={sleeveGradient} x1="0" x2="1">
          <stop offset="0" stopColor={shade(art.color, -0.08)} />
          <stop offset="0.6" stopColor={shade(art.color, 0.06)} />
          <stop offset="1" stopColor={shade(art.color, -0.1)} />
        </linearGradient>
      </defs>
      <Hook />
      {view === "side" ? (
        <>
          <path d="M116 46 L124 46 L124 60 L116 60 Z" fill={WOOD} />
          <Side art={art} fill={`url(#${gradient})`} sleeveFill={`url(#${sleeveGradient})`} />
        </>
      ) : (
        <FrontBack art={art} view={view} fill={`url(#${gradient})`} />
      )}
    </svg>
  );
}
