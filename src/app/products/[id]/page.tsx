import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyButton } from "@/components/BuyButton";
import { formatPrice } from "@/lib/format";
import { getProduct } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product || !product.active) notFound();

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
      <div className="overflow-hidden rounded-3xl border border-ink/10 bg-cream shadow-sm">
        {product.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.coverUrl}
            alt=""
            className="aspect-[4/5] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center font-serif text-ink-muted">
            No cover
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-xs uppercase tracking-[0.2em] text-wine">{product.type}</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-ink sm:text-5xl">
          {product.title}
        </h1>
        <p className="mt-4 text-2xl text-ink">{formatPrice(product.priceCents)}</p>
        <p className="mt-6 whitespace-pre-wrap text-ink-muted leading-relaxed">
          {product.description}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <BuyButton productId={product.id} />
          <Link href="/#catalog" className="text-sm text-ink-muted underline hover:text-ink">
            Back to catalog
          </Link>
        </div>
        <p className="mt-6 text-sm text-ink-muted">
          After payment you&apos;ll receive a time-limited download link. Paid files are not exposed as public URLs.
        </p>
      </div>
    </div>
  );
}
