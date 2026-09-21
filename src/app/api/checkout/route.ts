import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSiteUrl, hasStripe } from "@/lib/config";
import { getProduct } from "@/lib/store";

export async function POST(req: Request) {
  if (!hasStripe()) {
    return NextResponse.json(
      { error: "Stripe is not configured. Use demo checkout." },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const productId = String(body.productId || "");
  const email = String(body.email || "").trim().toLowerCase();
  if (!productId || !email) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const product = await getProduct(productId);
  if (!product || !product.active) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const site = getSiteUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: product.priceCents,
          product_data: {
            name: product.title,
            description: product.description.slice(0, 400),
            images: product.coverUrl?.startsWith("http")
              ? [product.coverUrl]
              : undefined,
          },
        },
      },
    ],
    metadata: {
      productId: product.id,
      email,
    },
    success_url: `${site}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/checkout?productId=${product.id}`,
  });

  return NextResponse.json({ url: session.url });
}
