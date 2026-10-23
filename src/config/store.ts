// ─────────────────────────────────────────────────────────────
//  STORE SETTINGS — edit this file to put in your own business.
//  Everything marked "PLACEHOLDER" should be replaced.
// ─────────────────────────────────────────────────────────────

export const store = {
  /** Brand name shown in the header, footer and browser tab. PLACEHOLDER */
  name: "Your Brand",
  /** Optional logo image in /public (e.g. "/logo.svg"). Leave empty to show the name as text. */
  logo: "",
  /** One-line description used for search engines / link previews. PLACEHOLDER */
  description: "Premium streetwear, hung right.",

  /** Prices: ISO currency code + locale used for formatting (e.g. "INR" + "en-IN"). */
  currency: "USD",
  locale: "en-US",

  /** Small links in the grey bar at the very top. */
  utilityLinks: [
    { label: "Find a Store", href: "/contact" },
    { label: "Help", href: "/contact" },
    { label: "Join Us", href: "/contact" },
  ],

  /** Main menu in the header. */
  nav: [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/#shop" },
    { label: "The Rail", href: "/#rail" },
    { label: "Contact", href: "/contact" },
  ],

  hero: {
    eyebrow: "New Collection",
    eyebrowMuted: "Premium Streetwear",
    /** Headline is split in two: the second part fades to grey. */
    headline: "Layers that",
    headlineFaded: "hang right.",
  },

  /** Text in the bottom-right corner under the rail. PLACEHOLDER */
  railTagline: ["Crafted in heavyweight fleece.", "Cut oversized. Made to last."],

  /** Discount codes accepted in the cart. PLACEHOLDER — percent off the subtotal. */
  discountCodes: {
    WELCOME10: 10,
  } as Record<string, number>,

  contact: {
    email: "hello@yourbrand.com", // PLACEHOLDER
    phone: "+00 00000 00000", // PLACEHOLDER
    address: "Your street, Your city", // PLACEHOLDER
    instagram: "https://instagram.com/", // PLACEHOLDER
    hours: "Mon–Sat, 10am–7pm", // PLACEHOLDER
  },
};

export function formatPrice(amount: number) {
  return new Intl.NumberFormat(store.locale, {
    style: "currency",
    currency: store.currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatPriceExact(amount: number) {
  return new Intl.NumberFormat(store.locale, {
    style: "currency",
    currency: store.currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
