"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, ProductType } from "@/lib/types";
import { formatPrice } from "@/lib/format";

const TYPES: ProductType[] = ["book", "pdf", "video", "audio", "media", "other"];

export function AdminDashboard({ products: initial }: { products: Product[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initial);
  const [editing, setEditing] = useState<Product | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sorted = useMemo(
    () => [...products].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [products]
  );

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  async function refreshList() {
    const res = await fetch("/api/admin/products");
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products);
    }
    router.refresh();
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const activeBox = form.elements.namedItem("active") as HTMLInputElement | null;
    fd.set("active", activeBox?.checked ? "true" : "false");
    try {
      const url = editing
        ? `/api/admin/products/${editing.id}`
        : "/api/admin/products";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Save failed");
        setBusy(false);
        return;
      }
      setMessage(editing ? "Product updated." : "Product created.");
      setEditing(null);
      form.reset();
      await refreshList();
    } catch {
      setError("Network error");
    }
    setBusy(false);
  }

  async function toggleActive(product: Product) {
    const fd = new FormData();
    fd.set("active", product.active ? "false" : "true");
    fd.set("title", product.title);
    fd.set("description", product.description);
    fd.set("priceCents", String(product.priceCents));
    fd.set("type", product.type);
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PUT",
      body: fd,
    });
    if (res.ok) await refreshList();
  }

  async function remove(product: Product) {
    if (!confirm(`Delete “${product.title}”?`)) return;
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      if (editing?.id === product.id) setEditing(null);
      await refreshList();
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-ink">Admin</h1>
          <p className="text-ink-muted">Create, edit, and publish digital products.</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-full border border-ink/20 px-4 py-2 text-sm text-ink-muted hover:text-ink"
        >
          Sign out
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-ink/10 bg-cream p-6 space-y-4"
          encType="multipart/form-data"
        >
          <h2 className="font-serif text-2xl text-ink">
            {editing ? "Edit product" : "New product"}
          </h2>
          {editing ? (
            <button
              type="button"
              className="text-sm text-wine underline"
              onClick={() => setEditing(null)}
            >
              Cancel edit
            </button>
          ) : null}

          <label className="block text-sm">
            Title
            <input
              name="title"
              required
              defaultValue={editing?.title || ""}
              key={`title-${editing?.id || "new"}`}
              className="mt-1 w-full rounded-xl border border-ink/20 bg-parchment px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Description
            <textarea
              name="description"
              required
              rows={4}
              defaultValue={editing?.description || ""}
              key={`desc-${editing?.id || "new"}`}
              className="mt-1 w-full rounded-xl border border-ink/20 bg-parchment px-3 py-2"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              Price (USD)
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={
                  editing ? (editing.priceCents / 100).toFixed(2) : "9.99"
                }
                key={`price-${editing?.id || "new"}`}
                className="mt-1 w-full rounded-xl border border-ink/20 bg-parchment px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              Type
              <select
                name="type"
                defaultValue={editing?.type || "pdf"}
                key={`type-${editing?.id || "new"}`}
                className="mt-1 w-full rounded-xl border border-ink/20 bg-parchment px-3 py-2"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="active"
              defaultChecked={editing ? editing.active : true}
              key={`active-${editing?.id || "new"}`}
              value="true"
            />
            Active (visible in storefront)
          </label>
          <label className="block text-sm">
            Cover image
            <input name="cover" type="file" accept="image/*,.svg" className="mt-1 block w-full text-sm" />
          </label>
          <label className="block text-sm">
            Sellable file (PDF, audio, video, zip…)
            <input name="file" type="file" className="mt-1 block w-full text-sm" />
          </label>
          {error ? <p className="text-sm text-wine">{error}</p> : null}
          {message ? <p className="text-sm text-leaf">{message}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-wine px-5 py-2.5 text-parchment hover:bg-ink disabled:opacity-60"
          >
            {busy ? "Saving…" : editing ? "Update product" : "Create product"}
          </button>
        </form>

        <div className="space-y-3">
          <h2 className="font-serif text-2xl text-ink">Products ({sorted.length})</h2>
          {sorted.length === 0 ? (
            <p className="text-ink-muted">No products yet.</p>
          ) : (
            sorted.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-ink/10 bg-cream p-4"
              >
                <div className="flex gap-3">
                  {p.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.coverUrl} alt="" className="h-16 w-12 rounded object-cover" />
                  ) : (
                    <div className="flex h-16 w-12 items-center justify-center rounded bg-parchment text-xs text-ink-muted">
                      —
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{p.title}</p>
                    <p className="text-sm text-ink-muted">
                      {formatPrice(p.priceCents)} · {p.type} ·{" "}
                      {p.active ? "active" : "inactive"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm">
                      <button
                        type="button"
                        className="underline"
                        onClick={() => setEditing(p)}
                      >
                        Edit
                      </button>
                      <button type="button" className="underline" onClick={() => toggleActive(p)}>
                        {p.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        className="text-wine underline"
                        onClick={() => remove(p)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
