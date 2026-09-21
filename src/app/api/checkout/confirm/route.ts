import { NextResponse } from "next/server";
import Stripe from "stripe";
import { hasStripe } from "@/lib/config";
import {
  createPurchase,
  getProduct,
  getPurchaseByStripeSession,
} from "@/lib/store";

/** Fallback when webhook hasn't fired yet: confirm a Checkout session and mint download token. */
export async function POST(req: Request) {
  if (!hasStripe()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }
  const body = await req.json().catch(() => ({}));
  const sessionId = String(body.sessionId || "");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const existing = await getPurchaseByStripeSession(sessionId);
  if (existing) {
    return NextResponse.json({
      token: existing.downloadToken,
      purchaseId: existing.id,
    });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not complete" }, { status: 402 });
  }

  const productId = session.metadata?.productId;
  if (!productId) {
    return NextResponse.json({ error: "Missing product metadata" }, { status: 400 });
  }
  const product = await getProduct(productId);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const email =
    session.metadata?.email ||
    session.customer_details?.email ||
    session.customer_email ||
    "buyer@unknown";

  const purchase = await createPurchase({
    productId,
    email,
    amountCents: session.amount_total ?? product.priceCents,
    stripeSessionId: session.id,
    demo: false,
  });

  return NextResponse.json({
    token: purchase.downloadToken,
    purchaseId: purchase.id,
  });
}
