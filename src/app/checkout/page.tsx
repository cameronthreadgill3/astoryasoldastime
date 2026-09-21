import { CheckoutClient } from "./CheckoutClient";
import { getProduct } from "@/lib/store";
import { hasStripe } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const { productId } = await searchParams;
  if (!productId) notFound();
  const product = await getProduct(productId);
  if (!product || !product.active) notFound();
  const stripe = hasStripe();

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <p className="text-sm uppercase tracking-[0.2em] text-wine">Checkout</p>
      <h1 className="mt-2 font-serif text-4xl text-ink">{product.title}</h1>
      <p className="mt-2 text-ink-muted">{formatPrice(product.priceCents)}</p>
      <div className="mt-6 rounded-2xl border border-ink/10 bg-cream p-6">
        <p className="mb-4 text-sm text-ink-muted">
          {stripe
            ? "Stripe Checkout is configured. You'll be redirected to Stripe to pay."
            : "Demo mode: no Stripe keys detected. We'll create a purchase and download token instantly."}
        </p>
        <CheckoutClient productId={product.id} demo={!stripe} />
      </div>
      <Link href={`/products/${product.id}`} className="mt-6 inline-block text-sm text-ink-muted underline">
        Cancel
      </Link>
    </div>
  );
}
