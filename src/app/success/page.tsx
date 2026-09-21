import Link from "next/link";
import { getProduct, getPurchaseById, getPurchaseByToken } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { StripeSuccessClient } from "./StripeSuccessClient";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    token?: string;
    purchaseId?: string;
    session_id?: string;
  }>;
}) {
  const { token, purchaseId, session_id } = await searchParams;

  if (session_id && !token) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <p className="text-sm uppercase tracking-[0.2em] text-leaf">Payment received</p>
        <h1 className="mt-2 font-serif text-4xl text-ink">Confirming your download…</h1>
        <div className="mt-6">
          <StripeSuccessClient sessionId={session_id} />
        </div>
      </div>
    );
  }

  let purchase = token ? await getPurchaseByToken(token) : null;
  if (!purchase && purchaseId) {
    purchase = await getPurchaseById(purchaseId);
  }

  if (!purchase) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-serif text-3xl text-ink">Purchase not found</h1>
        <p className="mt-3 text-ink-muted">
          This success link is missing or expired. If you just paid, check your email or contact the seller.
        </p>
        <Link href="/" className="mt-6 inline-block text-wine underline">
          Return home
        </Link>
      </div>
    );
  }

  const product = await getProduct(purchase.productId);
  const expired = new Date(purchase.tokenExpiresAt).getTime() < Date.now();

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <p className="text-sm uppercase tracking-[0.2em] text-leaf">Thank you</p>
      <h1 className="mt-2 font-serif text-4xl text-ink">Your story is ready</h1>
      <div className="mt-6 rounded-2xl border border-ink/10 bg-cream p-6">
        <p className="font-serif text-2xl text-ink">{product?.title ?? "Digital product"}</p>
        <p className="mt-1 text-sm text-ink-muted">
          {formatPrice(purchase.amountCents)} · {purchase.email}
          {purchase.demo ? " · Demo purchase" : ""}
        </p>
        {expired ? (
          <p className="mt-6 text-wine">
            This download token has expired. Contact the seller for a new link.
          </p>
        ) : (
          <a
            href={`/api/download/${purchase.downloadToken}`}
            className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-parchment hover:bg-wine transition-colors"
          >
            Download {product?.fileName || "file"}
          </a>
        )}
        <p className="mt-4 text-xs text-ink-muted">
          Link expires {new Date(purchase.tokenExpiresAt).toLocaleString()}.
        </p>
      </div>
      <Link href="/" className="mt-8 inline-block text-sm text-ink-muted underline">
        Back to storefront
      </Link>
    </div>
  );
}
