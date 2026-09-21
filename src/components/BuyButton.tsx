"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BuyButton({
  productId,
  label = "Buy now",
}: {
  productId: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        router.push(`/checkout?productId=${encodeURIComponent(productId)}`);
      }}
      className="inline-flex items-center justify-center rounded-full bg-wine px-6 py-3 text-base font-medium text-parchment shadow-sm transition hover:bg-ink disabled:opacity-60"
    >
      {loading ? "Opening checkout…" : label}
    </button>
  );
}
