import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { LEGACY_IMAGES } from '@/lib/legacy-data';
import { truncateText } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Create a Growfinix Studio account and keep your generated work.',
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  const image = LEGACY_IMAGES[2];

  return (
    <AuthShell
      eyebrow="Account — 04"
      title="Keep the work."
      subtitle="Create an account to hold your frames across devices. If you have been working as a guest, this workspace comes with you."
      imageUrl={image.imageUrl}
      imageAlt={truncateText(image.prompt, 140)}
      quote="A good frame is a decision you can explain, and repeat."
      footer={
        <>
          Already have an account?{' '}
          <Link
            href="/signin"
            className="border-b border-ink pb-0.5 text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
