export type ProductType = "book" | "pdf" | "video" | "audio" | "media" | "other";

export interface Product {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  type: ProductType;
  coverUrl: string | null;
  fileUrl: string | null;
  fileName: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  productId: string;
  email: string;
  amountCents: number;
  downloadToken: string;
  tokenExpiresAt: string;
  stripeSessionId: string | null;
  demo: boolean;
  createdAt: string;
}

export interface StoreData {
  products: Product[];
  purchases: Purchase[];
}
