import Image from 'next/image';
import type { ReactNode } from 'react';
import { truncateText } from '@/lib/utils';

interface AuthShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  quote: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  imageUrl,
  imageAlt,
  quote,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
        <div className="flex items-center">
          <div className="w-full max-w-md py-4">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="display mt-4 text-4xl sm:text-5xl">{title}</h1>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">{subtitle}</p>

            <div className="mt-8">{children}</div>

            <div className="mt-7 border-t border-line pt-5 text-sm text-muted">{footer}</div>
          </div>
        </div>

        <div className="relative hidden min-h-[34rem] overflow-hidden rounded-[2px] border border-line bg-surface lg:block">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority
            sizes="45vw"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 border-t border-line bg-ink p-6 text-canvas">
            <p className="max-w-md font-serif text-xl leading-snug">
              &ldquo;{truncateText(quote, 140)}&rdquo;
            </p>
            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.14em] opacity-60">
              Studio archive
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
