'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import { ArrowRight, ArrowUpRight, Heart, Images, LogOut, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateProfileAction } from '@/app/account/actions';
import type { ProfileState } from '@/lib/types';
import { displayName, formatDate, initials } from '@/lib/utils';
import { useSession } from '../session-provider';
import { Button } from '../ui/button';
import { Field } from '../ui/field';

const INITIAL_STATE: ProfileState = { status: 'idle', message: '' };

export function AccountClient() {
  const router = useRouter();
  const { user, stats, loading, refresh, logout } = useSession();
  const [state, formAction, pending] = useActionState(updateProfileAction, INITIAL_STATE);

  useEffect(() => {
    if (state.status === 'success') {
      toast.success(state.message);
      void refresh();
    }
  }, [state, refresh]);

  async function handleSignOut() {
    try {
      await logout();
      toast.success('Signed out.');
      router.push('/');
      router.refresh();
    } catch {
      toast.error('Could not sign out. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="container-page py-14">
        <div className="skeleton h-8 w-40 rounded-[2px]" />
        <div className="skeleton mt-6 h-20 w-full rounded-[2px]" />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="skeleton h-24 rounded-[2px]" />
          <div className="skeleton h-24 rounded-[2px]" />
          <div className="skeleton h-24 rounded-[2px]" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-page py-14 sm:py-20">
        <p className="eyebrow">Account — 04</p>
        <h1 className="display mt-4 max-w-2xl text-5xl sm:text-6xl">No session yet.</h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-soft">
          Open the studio to start a guest workspace, or sign in to reach an existing one.
          Guest work is kept when you create an account.
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          <Link
            href="/studio"
            className="inline-flex h-11 items-center gap-2 rounded-[2px] bg-ink px-5 text-[13px] font-medium text-canvas transition-colors hover:bg-ink-soft"
          >
            Open studio
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/signin"
            className="inline-flex h-11 items-center rounded-[2px] border border-line px-5 text-[13px] transition-colors hover:border-ink"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const isGuest = user.isGuest;

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-[2px] border border-line bg-surface-strong font-serif text-2xl">
            {initials(user.name || user.email)}
          </span>
          <div>
            <p className="eyebrow">Account — 04</p>
            <h1 className="display mt-2 text-4xl sm:text-5xl">{displayName(user)}</h1>
            <p className="mt-1 text-sm text-muted">
              {isGuest ? 'Guest workspace' : user.email}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">{isGuest ? 'Guest' : 'Member'}</span>
          <span className="chip">Since {formatDate(user.createdAt)}</span>
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Frames"
          value={stats ? String(stats.imageCount) : '—'}
          icon={<Images className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Favorites"
          value={stats ? String(stats.favoriteCount) : '—'}
          icon={<Heart className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="This hour"
          value={stats ? `${stats.hourlyUsed} / ${stats.hourlyLimit}` : '—'}
          icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      {isGuest ? (
        <section className="mt-10 grid gap-8 border-t border-line pt-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
          <div>
            <p className="eyebrow">Keep the work</p>
            <h2 className="display mt-3 text-4xl">Make this workspace permanent.</h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-soft">
              This guest session is tied to a browser cookie. Create an account to keep
              your frames and favorites when you change device or clear your browser.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/signup"
                className="inline-flex h-11 items-center gap-2 rounded-[2px] bg-accent px-5 text-[13px] font-medium text-white transition-colors hover:bg-accent-strong"
              >
                Create account
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/signin"
                className="inline-flex h-11 items-center rounded-[2px] border border-line px-5 text-[13px] transition-colors hover:border-ink"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="border-t border-line">
            <QuickLink href="/studio" label="Open the studio" detail="Start a new render" />
            <QuickLink
              href="/gallery?scope=mine"
              label="Your frames"
              detail="Everything in this guest workspace"
            />
            <QuickLink
              href="/gallery?favorites=1"
              label="Saved frames"
              detail="Your favorites"
            />
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center justify-between border-b border-line py-4 text-left transition-colors hover:text-danger"
            >
              <span className="flex items-center gap-2 text-sm">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out of this guest session
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted" aria-hidden="true" />
            </button>
          </div>
        </section>
      ) : (
        <div className="mt-10 grid gap-10 border-t border-line pt-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <section>
            <p className="eyebrow">Profile</p>
            <h2 className="display mt-3 text-3xl">Your details.</h2>

            <form action={formAction} className="mt-6 max-w-md space-y-5">
              <Field label="Display name" htmlFor="name">
                <input
                  key={user.name ?? 'display-name'}
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={user.name ?? ''}
                  maxLength={60}
                  required
                  className="input"
                />
              </Field>

              <Field label="Email" htmlFor="account-email">
                <input
                  id="account-email"
                  type="email"
                  value={user.email ?? ''}
                  readOnly
                  disabled
                  className="input cursor-not-allowed opacity-70"
                />
              </Field>

              {state.status !== 'idle' ? (
                <p
                  role="status"
                  aria-live="polite"
                  className={
                    state.status === 'success'
                      ? 'text-xs text-success'
                      : 'text-xs text-danger'
                  }
                >
                  {state.message}
                </p>
              ) : null}

              <Button type="submit" loading={pending}>
                Save changes
              </Button>
            </form>
          </section>

          <section>
            <p className="eyebrow">Workspace</p>
            <h2 className="display mt-3 text-3xl">Quick access.</h2>

            <div className="mt-6 border-t border-line">
              <QuickLink href="/studio" label="Open the studio" detail="Start a new render" />
              <QuickLink
                href="/gallery?scope=mine"
                label="Your frames"
                detail={`${stats?.imageCount ?? 0} images in this workspace`}
              />
              <QuickLink
                href="/gallery?favorites=1"
                label="Saved frames"
                detail={`${stats?.favoriteCount ?? 0} favorites`}
              />
              <QuickLink
                href="/gallery?scope=archive"
                label="Studio archive"
                detail="The permanent collection"
              />
            </div>

            <Button variant="outline" className="mt-6" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          </section>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[2px] border border-line bg-surface px-4 py-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">{label}</p>
        <span className="text-muted">{icon}</span>
      </div>
      <p className="mt-3 font-serif text-3xl tabular-nums">{value}</p>
    </div>
  );
}

function QuickLink({
  href,
  label,
  detail,
}: {
  href: string;
  label: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between border-b border-line py-4 transition-colors hover:text-accent"
    >
      <span>
        <span className="block text-sm text-ink group-hover:text-accent">{label}</span>
        <span className="mt-0.5 block text-xs text-muted">{detail}</span>
      </span>
      <ArrowUpRight className="h-4 w-4 text-muted transition-colors group-hover:text-accent" aria-hidden="true" />
    </Link>
  );
}
