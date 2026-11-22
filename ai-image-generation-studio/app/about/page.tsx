import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Plus } from 'lucide-react';
import { APP_VERSION } from '@/lib/constants';
import { LEGACY_IMAGES } from '@/lib/legacy-data';
import { truncateText } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'About',
  description:
    'How Growfinix Studio works: directed prompt controls, FLUX rendering, persistent archives, and a stack built for the modern web.',
};

const STEPS = [
  {
    number: '01',
    title: 'Write the brief',
    body: 'Start with a sentence. Optionally add a subject line and a negative prompt to narrow the frame.',
  },
  {
    number: '02',
    title: 'Set the treatment',
    body: 'Choose a style, lighting setup, surface texture, color palette, background and camera angle.',
  },
  {
    number: '03',
    title: 'Pick the format',
    body: 'Select an aspect ratio and resolution, then choose one to five frames. Higher quality uses more inference steps.',
  },
  {
    number: '04',
    title: 'Keep the work',
    body: 'Every frame is stored with its full recipe — prompt, seed, settings, resolution and render time — in your workspace.',
  },
];

const STACK = [
  {
    name: 'Next.js App Router',
    role: 'Application',
    detail: 'Server components, route handlers and streaming on Vercel.',
  },
  {
    name: 'FLUX.1 schnell',
    role: 'Generation',
    detail: 'Served through the Hugging Face inference router.',
  },
  {
    name: 'Postgres',
    role: 'Records',
    detail: 'Users, images and favorites, with a JSON fallback for local development.',
  },
  {
    name: 'Vercel Blob',
    role: 'Storage',
    detail: 'Durable image storage in production; local disk while developing.',
  },
  {
    name: 'jose + bcrypt',
    role: 'Identity',
    detail: 'Signed, httpOnly session cookies and hashed passwords.',
  },
  {
    name: 'Tailwind CSS v4',
    role: 'Interface',
    detail: 'A small set of warm, paper-like design tokens.',
  },
];

const FAQ = [
  {
    question: 'Do I need an account to generate?',
    answer:
      'No. A guest workspace is created on your first render, and your images stay attached to it. Create an account later to keep that work across devices; signing in merges the guest workspace into your account.',
  },
  {
    question: 'Where are the images stored?',
    answer:
      'In production, generated images are written to Vercel Blob and their records to Postgres. Locally, images live in data/uploads and records in a JSON file. The original archive is shipped with the site as static assets.',
  },
  {
    question: 'Which model renders the images?',
    answer:
      'FLUX.1 schnell, accessed through the Cloudflare Workers AI inference API. The model name can be changed with the CLOUDFLARE_MODEL environment variable.',
  },
  {
    question: 'How many images can I make?',
    answer:
      'A single render can produce up to five frames. Each workspace has an hourly image budget — forty images by default — to keep the service available for everyone.',
  },
  {
    question: 'Can I delete an image?',
    answer:
      'Yes. Images you generated can be deleted from the gallery or the fullscreen viewer. Archive images belong to the studio and are read-only.',
  },
  {
    question: 'What happens to my data?',
    answer:
      'Passwords are hashed with bcrypt. Sessions are signed JWTs stored in httpOnly cookies. There is no third-party analytics or advertising code in the application.',
  },
];

export default function AboutPage() {
  const feature = LEGACY_IMAGES[0];

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="grid gap-6 border-b border-line pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow">About — 03</p>
          <h1 className="display mt-4 max-w-3xl text-5xl sm:text-6xl">
            Built for directed images.
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            Growfinix Studio is a small, deliberate interface for text-to-image work. It
            exists to make the process legible: a brief, a treatment, a format, and a
            result you can return to.
          </p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          Version {APP_VERSION}
        </p>
      </header>

      <section className="mt-14 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <p className="font-serif text-3xl leading-tight sm:text-4xl">
          The best images come from <span className="italic text-accent">constraints</span>,
          not from rolling the dice until something looks acceptable.
        </p>
        <div className="grid gap-6 text-sm leading-relaxed text-ink-soft sm:grid-cols-2">
          <p>
            Most image generators hide the controls or bury them. This studio puts them
            on the surface: style, light, texture, palette, background and camera angle
            are first-class choices, not afterthoughts in a prompt string.
          </p>
          <p>
            The result is slower and more intentional in the best way. You can see what
            changed, reproduce a good frame, and build a body of work instead of a folder
            of one-offs.
          </p>
        </div>
      </section>

      <section className="mt-14 overflow-hidden rounded-[2px] border border-line">
        <div className="relative aspect-[16/7] min-h-[16rem]">
          <Image
            src={feature.imageUrl}
            alt={truncateText(feature.prompt, 160)}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface px-4 py-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
            Archive study — {feature.style} · {feature.resolution}
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
            Growfinix Studio
          </p>
        </div>
      </section>

      <section className="mt-20 border-t border-line pt-12">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow">The process</p>
            <h2 className="display mt-4 text-4xl sm:text-5xl">Four decisions.</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
              The studio is arranged as a short sequence. Each step narrows the frame
              without hiding it.
            </p>
          </div>

          <div className="border-t border-line">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="grid gap-4 border-b border-line py-6 sm:grid-cols-[4rem_1fr]"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  {step.number}
                </span>
                <div>
                  <h3 className="font-serif text-2xl">{step.title}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="stack" className="mt-20 scroll-mt-24 border-t border-line pt-12">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow">Under the hood</p>
            <h2 className="display mt-4 text-4xl sm:text-5xl">A short stack.</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
              No unnecessary layers. The application is a single Next.js project that can
              be deployed to Vercel with a database, a blob store and one model token.
            </p>
          </div>

          <div className="border-t border-line">
            {STACK.map((item) => (
              <div
                key={item.name}
                className="grid gap-2 border-b border-line py-5 sm:grid-cols-[10rem_1fr] sm:gap-6"
              >
                <div>
                  <p className="text-sm text-ink">{item.name}</p>
                  <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
                    {item.role}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-muted">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mt-20 scroll-mt-24 border-t border-line pt-12">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow">Questions</p>
            <h2 className="display mt-4 text-4xl sm:text-5xl">The short answers.</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
              For deployment details, see the repository&apos;s DEPLOYMENT.md.
            </p>
          </div>

          <div className="border-t border-line">
            {FAQ.map((item) => (
              <details key={item.question} className="group border-b border-line py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left [&::-webkit-details-marker]:hidden">
                  <span className="font-serif text-xl leading-snug">{item.question}</span>
                  <Plus
                    className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-20 border-t border-line pt-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Ready when you are</p>
            <p className="mt-3 font-serif text-3xl">Open the studio and write a frame.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/studio"
              className="inline-flex h-11 items-center gap-2 rounded-[2px] bg-ink px-5 text-[13px] font-medium text-canvas transition-colors hover:bg-ink-soft"
            >
              Open studio
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/gallery"
              className="inline-flex h-11 items-center gap-2 rounded-[2px] border border-line px-5 text-[13px] transition-colors hover:border-ink"
            >
              Browse gallery
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
