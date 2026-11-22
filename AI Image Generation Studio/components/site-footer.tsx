import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { APP_NAME, APP_VERSION } from '@/lib/constants';

const COLUMNS = [
  {
    title: 'Make',
    links: [
      { href: '/studio', label: 'Studio' },
      { href: '/gallery', label: 'Gallery' },
      { href: '/gallery?favorites=1', label: 'Favorites' },
    ],
  },
  {
    title: 'Read',
    links: [
      { href: '/about', label: 'About' },
      { href: '/about#stack', label: 'Under the hood' },
      { href: '/about#faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/signin', label: 'Sign in' },
      { href: '/signup', label: 'Create account' },
      { href: '/account', label: 'Your workspace' },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-line">
      <div className="container-page">
        <div className="grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <div>
            <p className="eyebrow">Growfinix Studio</p>
            <p className="mt-5 max-w-xl font-serif text-4xl leading-[1.05] tracking-[-0.02em] sm:text-5xl">
              A studio for images that don&apos;t exist yet.
            </p>
            <Link
              href="/studio"
              className="mt-8 inline-flex items-center gap-2 border-b border-ink pb-1 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
            >
              Open the studio
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  {column.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[13px] text-ink-soft transition-colors hover:text-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-line py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            © {year} Growfinix — {APP_NAME}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            v{APP_VERSION} · FLUX.1 · Built with Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
