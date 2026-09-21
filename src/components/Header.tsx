import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-ink/10 bg-parchment/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="group">
          <span className="font-serif text-xl tracking-tight text-ink sm:text-2xl group-hover:text-wine transition-colors">
            A Story As Old As Time
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm sm:gap-6">
          <Link
            href="/#catalog"
            className="text-ink-muted hover:text-ink transition-colors"
          >
            Catalog
          </Link>
          <Link
            href="/admin"
            className="rounded-full border border-ink/20 px-3 py-1.5 text-ink-muted hover:border-ink/40 hover:text-ink transition-colors"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
