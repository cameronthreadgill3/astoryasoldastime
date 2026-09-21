"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function StripeSuccessClient({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/checkout/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) setError(data.error || "Could not confirm purchase");
          return;
        }
        if (!cancelled) {
          router.replace(
            `/success?token=${encodeURIComponent(data.token)}&purchaseId=${encodeURIComponent(data.purchaseId)}`
          );
        }
      } catch {
        if (!cancelled) setError("Network error confirming purchase");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, router]);

  if (error) {
    return <p className="text-wine" role="alert">{error}</p>;
  }
  return <p className="text-ink-muted">Preparing your download link…</p>;
}
