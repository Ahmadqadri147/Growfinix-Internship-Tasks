import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { SignInForm } from '@/components/auth/sign-in-form';
import { LEGACY_IMAGES } from '@/lib/legacy-data';
import { truncateText } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your Growfinix Studio workspace.',
  robots: { index: false, follow: false },
};

interface SignInPageProps {
  searchParams: Promise<{ next?: string | string[] }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const redirectTo =
    typeof rawNext === 'string' && rawNext.startsWith('/') && !rawNext.startsWith('//')
      ? rawNext
      : '/studio';
  const image = LEGACY_IMAGES[1];

  return (
    <AuthShell
      eyebrow="Account — 04"
      title="Welcome back."
      subtitle="Sign in to reach your workspace, favorites and render history. A guest workspace will be merged into your account."
      imageUrl={image.imageUrl}
      imageAlt={truncateText(image.prompt, 140)}
      quote="Direct the light, the surface, the frame. The rest is patience."
      footer={
        <>
          New here?{' '}
          <Link
            href="/signup"
            className="border-b border-ink pb-0.5 text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Create an account
          </Link>
        </>
      }
    >
      <SignInForm redirectTo={redirectTo} />
    </AuthShell>
  );
}
