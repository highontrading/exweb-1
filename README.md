# Rail Store

A standalone clothing storefront built around an animated **clothing rail**: garments hang side-on from a curved rail that slowly scrolls; hovering a piece turns it to face you, clicking it opens a full-screen product view, and the cart slides in from the right.

Built with Next.js (React + TypeScript). No Shopify / WooCommerce.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build: `npm run build && npm start`.

## Where to change things

| What | File |
| --- | --- |
| Brand name, logo, currency, menu, hero text, tagline, contact details, discount codes | `src/config/store.ts` |
| Products (name, price, sizes, description, photos) | `src/data/products.ts` |
| Colours, fonts, spacing | `src/app/globals.css` (tokens at the top) |
| Rail behaviour (speed, spacing, curve) | `src/components/Rail.tsx` |

## Product photos

Until real photos are added, every product shows a drawn placeholder. To use photos, put them in `public/products/` and set `images` on the product:

```ts
images: {
  side: "/products/varsity-hoodie-side.png",   // on the rail
  front: "/products/varsity-hoodie-front.png", // hover + product view
  back: "/products/varsity-hoodie-back.png",   // "Back" tab
},
```

For the rail effect to look right, every photo should be:

- **Transparent background** PNG or WebP
- **3:4 portrait** canvas (e.g. 1200 × 1600 px)
- Garment **on a hanger**, hook at the **top-centre** of the canvas
- **Same camera distance / scale** for every product
- `side` = garment turned 90° (as on a real shop rail), `front` = facing camera, `back` = from behind

## What's built

- Header with utility bar, menu, search, account and cart icons (mobile menu included)
- Hero with animated headline
- Curved, infinitely-scrolling rail — slows on hover, stops on the hovered piece, drag / swipe to scroll, gentle sway, price tags
- Hover turn (side → front), live name/price readout, progress bar
- Full-screen quick view that grows out of the rail, Front/Back, sizes, add to cart, ←/→ keys to browse
- Cart drawer with quantity, remove, discount codes, saved between visits
- Product grid, product pages, search, contact page, checkout form

## Not yet connected

- **Payments** — the checkout collects details but no payment provider is connected yet (`src/app/checkout/page.tsx`).
- **Orders / stock / admin** — products live in `src/data/products.ts`; there is no admin panel or order storage yet.

## Deploy

Push to GitHub and import the repo on [Vercel](https://vercel.com/new) (free tier works). Connect your domain in the Vercel project settings.
