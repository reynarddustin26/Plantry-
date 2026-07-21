import Link from 'next/link';
import { CartBadgeLink } from './CartBadgeLink';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 lg:max-w-5xl lg:px-8 xl:max-w-7xl">
        <Link
          href="/"
          className="flex min-h-[44px] items-center rounded-lg text-lg font-extrabold text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          🌱 Plantry
        </Link>
        <nav className="flex items-center gap-0.5 text-sm font-medium sm:gap-3">
          <Link
            href="/shop"
            className="flex min-h-[44px] items-center rounded-lg px-1 text-foreground hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-2"
          >
            Shop
          </Link>
          <Link
            href="/cookbook"
            className="flex min-h-[44px] items-center rounded-lg px-1 text-foreground hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-2"
          >
            Cookbook
          </Link>
          <Link
            href="/demo-profile"
            className="flex min-h-[44px] items-center rounded-lg px-1 text-foreground hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-2"
          >
            Profile
          </Link>
          <CartBadgeLink />
        </nav>
      </div>
    </header>
  );
}
