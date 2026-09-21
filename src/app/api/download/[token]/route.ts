import { NextResponse } from "next/server";
import { getProduct, getPurchaseByToken } from "@/lib/store";
import { readLocalUpload } from "@/lib/storage";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ token: string }> }
) {
  const { token } = await ctx.params;
  const purchase = await getPurchaseByToken(token);
  if (!purchase) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }
  if (new Date(purchase.tokenExpiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: "Token expired" }, { status: 410 });
  }

  const product = await getProduct(purchase.productId);
  if (!product?.fileUrl) {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }

  const fileName = product.fileName || "download";

  if (product.fileUrl.startsWith("http://") || product.fileUrl.startsWith("https://")) {
    const upstream = await fetch(product.fileUrl);
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Upstream fetch failed" }, { status: 502 });
    }
    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type":
          upstream.headers.get("Content-Type") || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const local = await readLocalUpload(product.fileUrl);
  if (!local) {
    return NextResponse.json({ error: "Local file not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(local.buffer), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
