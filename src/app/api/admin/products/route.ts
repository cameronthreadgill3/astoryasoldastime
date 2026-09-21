import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createProduct, listProducts } from "@/lib/store";
import { uploadFile } from "@/lib/storage";
import type { ProductType } from "@/lib/types";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const products = await listProducts({ includeInactive: true });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const form = await req.formData();
  const title = String(form.get("title") || "").trim();
  const description = String(form.get("description") || "").trim();
  const priceRaw = String(form.get("price") || "0");
  const type = String(form.get("type") || "other") as ProductType;
  const active = form.get("active") === "true" || form.get("active") === "on";
  const priceCents = Math.round(parseFloat(priceRaw) * 100);

  if (!title || !description || !Number.isFinite(priceCents) || priceCents < 0) {
    return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
  }

  let coverUrl: string | null = null;
  let fileUrl: string | null = null;
  let fileName: string | null = null;

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

  const product = await createProduct({
    title,
    description,
    priceCents,
    type,
    coverUrl,
    fileUrl,
    fileName,
    active,
  });

  return NextResponse.json({ product });
}
