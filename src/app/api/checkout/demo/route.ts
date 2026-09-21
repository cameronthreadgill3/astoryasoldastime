import { NextResponse } from "next/server";
import { createPurchase, getProduct } from "@/lib/store";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const productId = String(body.productId || "");
  const email = String(body.email || "").trim().toLowerCase();
  if (!productId || !email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const product = await getProduct(productId);
  if (!product || !product.active) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (!product.fileUrl) {
    return NextResponse.json(
      { error: "Product has no downloadable file" },
      { status: 400 }
    );
  }

  const purchase = await createPurchase({
    productId: product.id,
    email,
    amountCents: product.priceCents,
    demo: true,
  });

  return NextResponse.json({
    successUrl: `/success?token=${purchase.downloadToken}&purchaseId=${purchase.id}`,
    purchaseId: purchase.id,
    token: purchase.downloadToken,
  });
}
