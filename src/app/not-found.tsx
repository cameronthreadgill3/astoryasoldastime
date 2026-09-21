import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <h1 className="font-serif text-4xl text-ink">Page not found</h1>
      <p className="mt-3 text-ink-muted">This chapter doesn&apos;t exist in our library.</p>
      <Link href="/" className="mt-6 inline-block text-wine underline">
        Return home
      </Link>
    </div>
  );
}
