'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { cn, displayName, initials } from '@/lib/utils';
import { useSession } from './session-provider';

const NAV_LINKS = [
  { href: '/studio', label: 'Studio' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, loading } = useSession();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function isActive(href: string): boolean {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex shrink-0 items-baseline gap-2"
          aria-label="Growfinix Studio home"
        >
          <span className="font-serif text-[1.6rem] leading-none tracking-[-0.02em]">Growfinix</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted">Studio</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative py-1 text-[13px] transition-colors',
                isActive(link.href) ? 'text-ink' : 'text-muted hover:text-ink'
              )}
            >
              {link.label}
              {isActive(link.href) ? (
                <span className="absolute inset-x-0 -bottom-[21px] h-px bg-accent" aria-hidden="true" />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            {loading ? (
              <span className="skeleton h-9 w-28 rounded-[2px]" aria-hidden="true" />
            ) : user ? (
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-[2px] border border-line py-1 pl-1 pr-3 transition-colors hover:border-ink"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-[2px] bg-surface-strong font-mono text-[10px] text-ink">
                  {initials(user.name || user.email)}
                </span>
                <span className="max-w-[10rem] truncate text-[12px] text-ink">
                  {displayName(user)}
                </span>
                {user.isGuest ? (
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-accent">
                    guest
                  </span>
                ) : null}
              </Link>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="px-2 py-2 text-[13px] text-ink-soft transition-colors hover:text-ink"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-9 items-center gap-1.5 rounded-[2px] bg-ink px-3.5 text-[12px] font-medium text-canvas transition-colors hover:bg-ink-soft"
                >
                  Create account
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-line text-ink transition-colors hover:border-ink md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-navigation"
          className="absolute inset-x-0 top-full max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-line bg-canvas md:hidden"
        >
          <div className="container-page py-6">
            <nav className="flex flex-col" aria-label="Mobile">
              {NAV_LINKS.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between border-b border-line py-4"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono text-[10px] text-muted">0{index + 1}</span>
                    <span className="font-serif text-2xl">{link.label}</span>
                  </span>
                  <ArrowUpRight
                    className={cn('h-4 w-4', isActive(link.href) ? 'text-accent' : 'text-muted')}
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </nav>

            <div className="mt-6">
              {loading ? (
                <div className="skeleton h-10 w-full rounded-[2px]" aria-hidden="true" />
              ) : user ? (
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-[2px] border border-line px-4 py-3"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-[2px] bg-surface-strong font-mono text-[11px]">
                      {initials(user.name || user.email)}
                    </span>
                    <span>
                      <span className="block text-sm">{displayName(user)}</span>
                      <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
                        {user.isGuest ? 'Guest workspace' : 'Member workspace'}
                      </span>
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted" aria-hidden="true" />
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/signin"
                    onClick={() => setOpen(false)}
                    className="flex h-10 items-center justify-center rounded-[2px] border border-line text-[13px]"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="flex h-10 items-center justify-center rounded-[2px] bg-ink text-[13px] font-medium text-canvas"
                  >
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
