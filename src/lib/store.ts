import { put, list } from "@vercel/blob";
import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { hasBlob } from "./config";
import { DOWNLOAD_TOKEN_TTL_MS } from "./config";
import { seedStore } from "./seed";
import type { Product, Purchase, StoreData } from "./types";

const LOCAL_DIR = path.join(process.cwd(), "data");
const LOCAL_PRODUCTS = path.join(LOCAL_DIR, "products.json");
const LOCAL_PURCHASES = path.join(LOCAL_DIR, "purchases.json");
const BLOB_PRODUCTS_PREFIX = "store/products.json";
const BLOB_PURCHASES_PREFIX = "store/purchases.json";

async function ensureLocal(): Promise<void> {
  await mkdir(LOCAL_DIR, { recursive: true });
  try {
    await readFile(LOCAL_PRODUCTS, "utf8");
  } catch {
    const seed = seedStore();
    await writeFile(LOCAL_PRODUCTS, JSON.stringify(seed.products, null, 2));
    await writeFile(LOCAL_PURCHASES, JSON.stringify(seed.purchases, null, 2));
  }
}

async function readJsonLocal<T>(file: string, fallback: T): Promise<T> {
  await ensureLocal();
  try {
    const raw = await readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonLocal(file: string, data: unknown): Promise<void> {
  await ensureLocal();
  await writeFile(file, JSON.stringify(data, null, 2));
}

async function findBlobUrl(prefix: string): Promise<string | null> {
  const result = await list({ prefix });
  const hit = result.blobs.find((b) => b.pathname === prefix || b.pathname.startsWith(prefix));
  return hit?.url ?? null;
}

async function readJsonBlob<T>(prefix: string, fallback: T): Promise<T> {
  const url = await findBlobUrl(prefix);
  if (!url) return fallback;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return fallback;
  return (await res.json()) as T;
}

async function writeJsonBlob(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function getProducts(): Promise<Product[]> {
  if (hasBlob()) {
    const products = await readJsonBlob<Product[]>(BLOB_PRODUCTS_PREFIX, []);
    if (products.length === 0) {
      const seed = seedStore().products;
      await writeJsonBlob(BLOB_PRODUCTS_PREFIX, seed);
      return seed;
    }
    return products;
  }
  return readJsonLocal<Product[]>(LOCAL_PRODUCTS, seedStore().products);
}

async function saveProducts(products: Product[]): Promise<void> {
  if (hasBlob()) {
    await writeJsonBlob(BLOB_PRODUCTS_PREFIX, products);
    return;
  }
  await writeJsonLocal(LOCAL_PRODUCTS, products);
}

async function getPurchases(): Promise<Purchase[]> {
  if (hasBlob()) {
    return readJsonBlob<Purchase[]>(BLOB_PURCHASES_PREFIX, []);
  }
  return readJsonLocal<Purchase[]>(LOCAL_PURCHASES, []);
}

async function savePurchases(purchases: Purchase[]): Promise<void> {
  if (hasBlob()) {
    await writeJsonBlob(BLOB_PURCHASES_PREFIX, purchases);
    return;
  }
  await writeJsonLocal(LOCAL_PURCHASES, purchases);
}

export async function listProducts(opts?: {
  includeInactive?: boolean;
}): Promise<Product[]> {
  const products = await getProducts();
  if (opts?.includeInactive) return products;
  return products.filter((p) => p.active);
}

export async function getProduct(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.id === id) ?? null;
}

export async function createProduct(
  input: Omit<Product, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<Product> {
  const products = await getProducts();
  const now = new Date().toISOString();
  const product: Product = {
    id: input.id || randomUUID(),
    title: input.title,
    description: input.description,
    priceCents: input.priceCents,
    type: input.type,
    coverUrl: input.coverUrl,
    fileUrl: input.fileUrl,
    fileName: input.fileName,
    active: input.active,
    createdAt: now,
    updatedAt: now,
  };
  products.unshift(product);
  await saveProducts(products);
  return product;
}

export async function updateProduct(
  id: string,
  patch: Partial<Omit<Product, "id" | "createdAt">>
): Promise<Product | null> {
  const products = await getProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  products[idx] = {
    ...products[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await saveProducts(products);
  return products[idx];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const products = await getProducts();
  const next = products.filter((p) => p.id !== id);
  if (next.length === products.length) return false;
  await saveProducts(next);
  return true;
}

export async function createPurchase(input: {
  productId: string;
  email: string;
  amountCents: number;
  stripeSessionId?: string | null;
  demo?: boolean;
}): Promise<Purchase> {
  const purchases = await getPurchases();
  const now = Date.now();
  const purchase: Purchase = {
    id: randomUUID(),
    productId: input.productId,
    email: input.email,
    amountCents: input.amountCents,
    downloadToken: randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, ""),
    tokenExpiresAt: new Date(now + DOWNLOAD_TOKEN_TTL_MS).toISOString(),
    stripeSessionId: input.stripeSessionId ?? null,
    demo: Boolean(input.demo),
    createdAt: new Date(now).toISOString(),
  };
  purchases.unshift(purchase);
  await savePurchases(purchases);
  return purchase;
}

export async function getPurchaseByToken(
  token: string
): Promise<Purchase | null> {
  const purchases = await getPurchases();
  return purchases.find((p) => p.downloadToken === token) ?? null;
}

export async function getPurchaseById(id: string): Promise<Purchase | null> {
  const purchases = await getPurchases();
  return purchases.find((p) => p.id === id) ?? null;
}

export async function getPurchaseByStripeSession(
  sessionId: string
): Promise<Purchase | null> {
  const purchases = await getPurchases();
  return purchases.find((p) => p.stripeSessionId === sessionId) ?? null;
}

export async function getStoreSnapshot(): Promise<StoreData> {
  return {
    products: await getProducts(),
    purchases: await getPurchases(),
  };
}
