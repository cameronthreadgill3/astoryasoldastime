"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function CheckoutClient({
  productId,
  demo,
}: {
  productId: string;
  demo: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const endpoint = demo ? "/api/checkout/demo" : "/api/checkout";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Checkout failed");
        setLoading(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.successUrl) {
        router.push(data.successUrl);
        return;
      }
      setError("Unexpected response");
      setLoading(false);
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm text-ink">
        Email for receipt
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-ink/20 bg-parchment px-3 py-2 text-ink outline-none focus:border-wine"
          placeholder="you@example.com"
        />
      </label>
      {error ? <p className="text-sm text-wine" role="alert">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-wine px-4 py-3 font-medium text-parchment hover:bg-ink disabled:opacity-60"
      >
        {loading ? "Please wait…" : demo ? "Complete demo purchase" : "Pay with Stripe"}
      </button>
    </form>
  );
}
