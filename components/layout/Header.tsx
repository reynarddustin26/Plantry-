import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex min-h-[44px] items-center rounded-lg text-lg font-extrabold text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          🌱 Plantry
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link
            href="/demo-profile"
            className="flex min-h-[44px] items-center rounded-lg px-2 text-foreground hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Demo Profile
          </Link>
        </nav>
      </div>
    </header>
  );
}
