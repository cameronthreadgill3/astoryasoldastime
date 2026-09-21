import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-cream shadow-sm transition hover:border-wine/30 hover:shadow-md">
      <Link href={`/products/${product.id}`} className="block aspect-[4/5] overflow-hidden bg-parchment">
        {product.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.coverUrl}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-serif text-ink-muted">
            No cover
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs uppercase tracking-wider text-wine/80">{product.type}</p>
        <h2 className="font-serif text-xl leading-snug text-ink">
          <Link href={`/products/${product.id}`} className="hover:text-wine transition-colors">
            {product.title}
          </Link>
        </h2>
        <p className="line-clamp-3 text-sm text-ink-muted">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-medium text-ink">{formatPrice(product.priceCents)}</span>
          <Link
            href={`/products/${product.id}`}
            className="rounded-full bg-ink px-3 py-1.5 text-sm text-parchment hover:bg-wine transition-colors"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
