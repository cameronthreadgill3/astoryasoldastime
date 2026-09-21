import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { listProducts } from "@/lib/store";
import { hasStripe } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await listProducts();
  const demoMode = !hasStripe();

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-sm uppercase tracking-[0.2em] text-wine">Digital storefront</p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-ink sm:text-5xl md:text-6xl">
          Stories you can hold in your pocket — books, audio, and keepsakes.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-ink-muted">
          Browse the catalog, buy with a click, and download your files securely.
          {demoMode ? (
            <>
              {" "}
              <span className="rounded-full bg-gold/20 px-2 py-0.5 text-sm text-ink">
                Demo checkout is on — no Stripe keys required.
              </span>
            </>
          ) : null}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#catalog"
            className="rounded-full bg-ink px-5 py-2.5 text-parchment hover:bg-wine transition-colors"
          >
            Browse catalog
          </a>
          <Link
            href="/admin"
            className="rounded-full border border-ink/25 px-5 py-2.5 text-ink hover:border-ink/50 transition-colors"
          >
            Seller admin
          </Link>
        </div>
      </section>

      <section id="catalog" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl text-ink">Catalog</h2>
          <p className="text-sm text-ink-muted">{products.length} title{products.length === 1 ? "" : "s"}</p>
        </div>
        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/20 bg-cream p-10 text-center">
            <p className="font-serif text-2xl text-ink">The shelf is empty</p>
            <p className="mt-2 text-ink-muted">
              Sign in to admin to upload your first digital product.
            </p>
            <Link href="/admin" className="mt-4 inline-block text-wine underline">
              Go to admin
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
