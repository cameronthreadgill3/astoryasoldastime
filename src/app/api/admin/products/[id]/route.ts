import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { deleteProduct, getProduct, updateProduct } from "@/lib/store";
import { uploadFile } from "@/lib/storage";
import type { ProductType } from "@/lib/types";

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const existing = await getProduct(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const form = await req.formData();
  const title = String(form.get("title") || existing.title).trim();
  const description = String(
    form.get("description") || existing.description
  ).trim();
  const priceField = form.get("price");
  const priceCents = priceField
    ? Math.round(parseFloat(String(priceField)) * 100)
    : existing.priceCents;
  const type = String(form.get("type") || existing.type) as ProductType;
  const activeRaw = form.get("active");
  const active =
    activeRaw === null
      ? existing.active
      : activeRaw === "true" || activeRaw === "on";

  let coverUrl = existing.coverUrl;
  let fileUrl = existing.fileUrl;
  let fileName = existing.fileName;

  const cover = form.get("cover");
  if (cover instanceof File && cover.size > 0) {
    const uploaded = await uploadFile(cover, {
      folder: "covers",
      publicAccess: true,
    });
    coverUrl = uploaded.url;
  }

  const file = form.get("file");
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadFile(file, { folder: "products" });
    fileUrl = uploaded.url;
    fileName = uploaded.fileName;
  }

  const product = await updateProduct(id, {
    title,
    description,
    priceCents,
    type,
    active,
    coverUrl,
    fileUrl,
    fileName,
  });

  return NextResponse.json({ product });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const ok = await deleteProduct(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
