import type { Product } from "@/data/products";
import { GarmentArt, type View } from "./GarmentArt";

/** Shows the product photo for a view if one exists, otherwise the drawn placeholder. */
export function ProductVisual({ product, view, className }: { product: Product; view: View; className?: string }) {
  const photo =
    product.images?.[view] ?? (view === "back" ? undefined : product.images?.front ?? product.images?.side);

  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt={`${product.name} — ${view}`} className={className} draggable={false} />;
  }
  return <GarmentArt art={product.art} view={view} className={className} />;
}
