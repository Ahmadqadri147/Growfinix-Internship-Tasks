import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-page py-20 sm:py-28">
      <p className="eyebrow">404 — Not found</p>
      <h1 className="display mt-4 text-7xl sm:text-8xl">Nothing framed here.</h1>
      <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-soft">
        The page you asked for is not in the archive. The studio, gallery and about page
        are all still in place.
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/studio"
          className="inline-flex h-11 items-center gap-2 rounded-[2px] bg-ink px-5 text-[13px] font-medium text-canvas transition-colors hover:bg-ink-soft"
        >
          Open studio
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link
          href="/gallery"
          className="inline-flex h-11 items-center rounded-[2px] border border-line px-5 text-[13px] transition-colors hover:border-ink"
        >
          Browse gallery
        </Link>
      </div>
    </div>
  );
}
