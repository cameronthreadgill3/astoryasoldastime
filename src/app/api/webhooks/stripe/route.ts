import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  createPurchase,
  getProduct,
  getPurchaseByStripeSession,
} from "@/lib/store";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!secret || !key) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  const stripe = new Stripe(key);
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const existing = await getPurchaseByStripeSession(session.id);
    if (!existing) {
      const productId = session.metadata?.productId;
      const email =
        session.metadata?.email ||
        session.customer_details?.email ||
        session.customer_email ||
        "buyer@unknown";
      if (productId) {
        const product = await getProduct(productId);
        if (product) {
          await createPurchase({
            productId,
            email,
            amountCents: session.amount_total ?? product.priceCents,
            stripeSessionId: session.id,
            demo: false,
          });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
