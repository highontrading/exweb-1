// ─────────────────────────────────────────────────────────────
//  PRODUCTS — every item on the rail comes from this list.
//
//  Photos: put files in /public/products/ and fill in `images`.
//  Each photo should be a transparent PNG (or WebP), 3:4 portrait
//  (e.g. 1200×1600), with the garment on its hanger, the hook at the
//  top-centre, and every product shot at the same scale.
//    side  → shown on the rail (garment turned sideways)
//    front → shown when hovered and in the product popup
//    back  → shown on the "Back" tab
//    spin  → optional 360° turn: photos every 30° (or any equal step),
//            starting at the front and turning so the front faces left
//            (front, 30°, 60°, side, …, back, …). Enables the smooth
//            hover turn on the rail and drag-to-rotate in the product view.
//  Until photos are added, a drawn placeholder (`art`) is shown.
// ─────────────────────────────────────────────────────────────

export type GarmentKind = "hoodie" | "crewneck" | "tee" | "blazer";

export type Product = {
  slug: string;
  name: string;
  price: number;
  /** Optional original price to show as struck-through. */
  compareAt?: number;
  category: string;
  description: string;
  details: string[];
  sizes: string[];
  images?: { side?: string; front?: string; back?: string; spin?: string[] };
  /** Placeholder drawing used when there are no photos. */
  art: {
    kind: GarmentKind;
    color: string;
    print?: string;
    printColor?: string;
    /** arch = varsity curve, center = big straight text, chest = small left-chest mark */
    printStyle?: "arch" | "center" | "chest";
  };
};

const apparelSizes = ["S", "M", "L", "XL"];

const fleeceDetails = [
  "480 GSM heavyweight cotton fleece",
  "Oversized, dropped-shoulder fit",
  "Ribbed cuffs and hem",
  "Machine wash cold, hang dry",
];

export const products: Product[] = [
  {
    slug: "raglan-hoodie-cocoa",
    name: "Raglan Hoodie", // PLACEHOLDER name
    price: 199, // PLACEHOLDER price
    category: "Hoodies",
    description:
      "A cropped, relaxed hoodie in deep cocoa brown with raglan sleeves, a crossover hood and a tonal “active lab motion” chest print.",
    details: [
      "Raglan sleeves with curved side-panel seams",
      "Crossover hood",
      "Ribbed cuffs and hem",
      "Fabric & care: PLACEHOLDER",
    ],
    sizes: apparelSizes,
    images: {
      front: "/products/raglan-hoodie-cocoa/spin-00.webp",
      side: "/products/raglan-hoodie-cocoa/spin-03.webp",
      back: "/products/raglan-hoodie-cocoa/spin-06.webp",
      spin: Array.from({ length: 12 }, (_, i) => `/products/raglan-hoodie-cocoa/spin-${String(i).padStart(2, "0")}.webp`),
    },
    art: { kind: "hoodie", color: "#5b3a31" },
  },
  {
    slug: "heavyweight-hoodie-graphite",
    name: "Heavyweight Hoodie",
    price: 199,
    category: "Hoodies",
    description: "Our signature brushed-fleece hoodie with a double-layer hood. Built to keep its shape wash after wash.",
    details: fleeceDetails,
    sizes: apparelSizes,
    art: { kind: "hoodie", color: "#9b9c9e", print: "ATELIER", printColor: "#2b2b2d" },
  },
  {
    slug: "core-hoodie-midnight",
    name: "Core Hoodie",
    price: 189,
    category: "Hoodies",
    description: "A clean, logo-free hoodie in deep midnight navy. The everyday layer.",
    details: fleeceDetails,
    sizes: apparelSizes,
    art: { kind: "hoodie", color: "#1d2130" },
  },
  {
    slug: "boxy-crewneck-sand",
    name: "Boxy Crewneck",
    price: 169,
    category: "Sweatshirts",
    description: "A boxy crewneck in warm sand with a small embroidered chest mark.",
    details: fleeceDetails,
    sizes: apparelSizes,
    art: { kind: "crewneck", color: "#e2d6bd", print: "studio", printColor: "#3a3530", printStyle: "chest" },
  },
  {
    slug: "varsity-hoodie-forest",
    name: "Varsity Hoodie",
    price: 199,
    category: "Hoodies",
    description: "Forest-green hoodie with a cracked-print varsity arch. Heavy, warm, and loud in the right way.",
    details: fleeceDetails,
    sizes: apparelSizes,
    art: { kind: "hoodie", color: "#1f4a33", print: "ORIGINAL", printColor: "#efe7d4" },
  },
  {
    slug: "tailored-blazer-ink",
    name: "Tailored Blazer",
    price: 249,
    category: "Outerwear",
    description: "Single-breasted, softly structured blazer in ink black. Dresses up anything you wear under it.",
    details: ["Wool-blend twill", "Notch lapel, two-button front", "Fully lined", "Dry clean only"],
    sizes: ["46", "48", "50", "52"],
    art: { kind: "blazer", color: "#1b1c22" },
  },
  {
    slug: "graphic-tee-black",
    name: "Graphic Tee",
    price: 79,
    category: "T-Shirts",
    description: "Heavyweight boxy tee with a gothic chest graphic.",
    details: ["260 GSM cotton jersey", "Boxy fit", "Screen-printed graphic", "Machine wash cold"],
    sizes: apparelSizes,
    art: { kind: "tee", color: "#151517", print: "Reign", printColor: "#f2f2f2", printStyle: "center" },
  },
  {
    slug: "core-hoodie-ash",
    name: "Core Hoodie",
    price: 189,
    category: "Hoodies",
    description: "The everyday hoodie in light ash grey.",
    details: fleeceDetails,
    sizes: apparelSizes,
    art: { kind: "hoodie", color: "#b9babd" },
  },
  {
    slug: "boxy-crewneck-pine",
    name: "Boxy Crewneck",
    price: 169,
    category: "Sweatshirts",
    description: "The boxy crewneck in deep pine green.",
    details: fleeceDetails,
    sizes: apparelSizes,
    art: { kind: "crewneck", color: "#24503a" },
  },
  {
    slug: "statement-hoodie-heather",
    name: "Statement Hoodie",
    price: 199,
    category: "Hoodies",
    description: "Heather-grey hoodie with an oversized front slogan.",
    details: fleeceDetails,
    sizes: apparelSizes,
    art: { kind: "hoodie", color: "#a7a8ab", print: "MADE TO LAST", printColor: "#232325", printStyle: "center" },
  },
  {
    slug: "tailored-blazer-navy",
    name: "Tailored Blazer",
    price: 249,
    category: "Outerwear",
    description: "The tailored blazer in navy.",
    details: ["Wool-blend twill", "Notch lapel, two-button front", "Fully lined", "Dry clean only"],
    sizes: ["46", "48", "50", "52"],
    art: { kind: "blazer", color: "#202638" },
  },
  {
    slug: "boxy-tee-cream",
    name: "Boxy Tee",
    price: 69,
    category: "T-Shirts",
    description: "Plain heavyweight tee in off-white cream.",
    details: ["260 GSM cotton jersey", "Boxy fit", "Machine wash cold"],
    sizes: apparelSizes,
    art: { kind: "tee", color: "#ece6d8" },
  },
  {
    slug: "sweatshirt-plus-forest",
    name: "Sweatshirt Plus",
    price: 199,
    category: "Sweatshirts",
    description: "Forest-green crewneck with a vintage arch print across the chest.",
    details: fleeceDetails,
    sizes: apparelSizes,
    art: { kind: "crewneck", color: "#1f4a33", print: "ORIGINAL", printColor: "#efe7d4" },
  },
  {
    slug: "core-hoodie-black",
    name: "Core Hoodie",
    price: 189,
    category: "Hoodies",
    description: "The everyday hoodie in washed black.",
    details: fleeceDetails,
    sizes: apparelSizes,
    art: { kind: "hoodie", color: "#1a1a1c" },
  },
  {
    slug: "boxy-crewneck-oat",
    name: "Boxy Crewneck",
    price: 169,
    category: "Sweatshirts",
    description: "The boxy crewneck in oat.",
    details: fleeceDetails,
    sizes: apparelSizes,
    art: { kind: "crewneck", color: "#d8ccb3" },
  },
  {
    slug: "core-hoodie-pine",
    name: "Core Hoodie",
    price: 189,
    category: "Hoodies",
    description: "The everyday hoodie in pine green.",
    details: fleeceDetails,
    sizes: apparelSizes,
    art: { kind: "hoodie", color: "#24503a" },
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
