'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page py-20 sm:py-28">
      <p className="eyebrow">Error</p>
      <h1 className="display mt-4 max-w-3xl text-5xl sm:text-6xl">
        Something broke in the darkroom.
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-soft">
        The page could not be completed. Try again, or return to the studio. If the
        problem continues, the deployment may be missing a required service.
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
          Reference {error.digest}
        </p>
      ) : null}
      <div className="mt-7 flex flex-wrap gap-2">
        <Button onClick={reset}>Try again</Button>
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-[2px] border border-line px-4 text-[13px] transition-colors hover:border-ink"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
