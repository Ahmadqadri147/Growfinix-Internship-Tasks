import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Frame, Layers, SlidersHorizontal, Sparkles } from 'lucide-react';
import { APP_DESCRIPTION, EXAMPLE_PROMPTS } from '@/lib/constants';
import { LEGACY_IMAGES } from '@/lib/legacy-data';
import { getSiteUrl } from '@/lib/site';
import { aspectRatioValue, truncateText } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Growfinix Studio — AI Image Generation',
  description: APP_DESCRIPTION,
};

const FEATURES = [
  {
    number: '01',
    title: 'Compose',
    body: 'Start with a sentence. Add subject, style, light, surface and camera direction until the frame feels intentional.',
    icon: SlidersHorizontal,
  },
  {
    number: '02',
    title: 'Render',
    body: 'FLUX.1 schnell turns the brief into pixels. Render one frame or up to five variations in a single pass.',
    icon: Sparkles,
  },
  {
    number: '03',
    title: 'Collect',
    body: 'Every frame lands in your workspace with its prompt and settings intact. Save the ones worth keeping.',
    icon: Layers,
  },
  {
    number: '04',
    title: 'Return',
    body: 'Search the archive by prompt, treatment or format. Download at full resolution whenever you need it.',
    icon: Frame,
  },
];

const SPECS = [
  ['Style', '11 treatments'],
  ['Light', '8 setups'],
  ['Surface', '9 textures'],
  ['Format', '5 ratios'],
  ['Output', 'up to 5 frames'],
];

export default function HomePage() {
  const [portrait, square, tall] = LEGACY_IMAGES;
  const siteUrl = getSiteUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Growfinix Studio',
    url: siteUrl,
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    description: APP_DESCRIPTION,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="container-page pt-10 sm:pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div className="animate-fade-up">
            <p className="eyebrow">Growfinix Studio — AI image direction</p>
            <h1 className="display mt-5 text-[3.4rem] leading-[0.95] sm:text-7xl xl:text-[5.5rem]">
              An image studio
              <br />
              for the <span className="italic text-accent">almost real</span>.
            </h1>
            <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-ink-soft">
              Write a brief. Direct the light, surface and format. Render a frame that
              doesn&apos;t exist yet — then keep it in a gallery built for the work.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/studio"
                className="inline-flex h-12 items-center gap-2 rounded-[2px] bg-ink px-6 text-sm font-medium text-canvas transition-colors hover:bg-ink-soft"
              >
                Open the studio
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/gallery"
                className="inline-flex h-12 items-center gap-2 rounded-[2px] border border-line px-6 text-sm text-ink transition-colors hover:border-ink"
              >
                Browse the gallery
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-5">
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                  Engine
                </dt>
                <dd className="mt-1 font-mono text-[11px] text-ink">FLUX.1 schnell</dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                  Output
                </dt>
                <dd className="mt-1 font-mono text-[11px] text-ink">Up to 5 frames</dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                  Access
                </dt>
                <dd className="mt-1 font-mono text-[11px] text-ink">Guest friendly</dd>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-xl animate-fade-up lg:max-w-none">
            <div className="relative aspect-[4/5] w-full">
              <div className="absolute left-0 top-0 h-[84%] w-[62%] overflow-hidden rounded-[2px] border border-line bg-surface">
                <Image
                  src={portrait.imageUrl}
                  alt={truncateText(portrait.prompt, 140)}
                  fill
                  priority
                  sizes="(max-width: 1024px) 60vw, 30vw"
                  className="object-cover"
                />
              </div>

              <div className="absolute right-0 top-[6%] h-[38%] w-[34%] overflow-hidden rounded-[2px] border border-line bg-surface">
                <Image
                  src={square.imageUrl}
                  alt={truncateText(square.prompt, 120)}
                  fill
                  priority
                  sizes="(max-width: 1024px) 34vw, 16vw"
                  className="object-cover"
                />
              </div>

              <div className="absolute bottom-0 right-[4%] h-[46%] w-[42%] overflow-hidden rounded-[2px] border border-line bg-surface">
                <Image
                  src={tall.imageUrl}
                  alt={truncateText(tall.prompt, 120)}
                  fill
                  sizes="(max-width: 1024px) 42vw, 20vw"
                  className="object-cover"
                />
              </div>

              <div className="absolute bottom-[6%] left-[6%] max-w-[15rem] rounded-[2px] border border-line bg-canvas p-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                  Archive study
                </p>
                <p className="mt-1.5 text-[11px] leading-snug text-ink-soft">
                  Portrait, studio light, 1024 × 1792
                </p>
              </div>

              <div className="absolute right-[2%] top-[46%] font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
                Fig. 01
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page mt-20 border-t border-line pt-14 sm:mt-28">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="eyebrow">The method</p>
            <h2 className="display mt-4 text-4xl sm:text-5xl">
              A camera,
              <br />
              not a slot machine.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-soft">
              The studio is built around decisions, not dice. Every control is named,
              every frame keeps its recipe, and the archive stays searchable.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center gap-2 border-b border-ink pb-1 text-sm transition-colors hover:border-accent hover:text-accent"
            >
              How it works
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid border-l border-t border-line sm:grid-cols-2">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.number} className="border-b border-r border-line p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                      {feature.number}
                    </span>
                    <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 font-serif text-2xl">{feature.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{feature.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page mt-20 border-t border-line pt-14 sm:mt-28">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2px] border border-line bg-surface">
            <Image
              src={square.imageUrl}
              alt={truncateText(square.prompt, 160)}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
            <div className="absolute bottom-3 left-3 rounded-[2px] border border-line bg-canvas px-2.5 py-1.5">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
                Studio light · 1024 × 1024
              </p>
            </div>
          </div>

          <div>
            <p className="eyebrow">Control surface</p>
            <h2 className="display mt-4 text-4xl sm:text-5xl">Every choice is visible.</h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-soft">
              Set the treatment once, then vary it deliberately. The prompt, seed,
              resolution and render time are stored with each frame, so a good result is
              repeatable rather than lucky.
            </p>

            <dl className="mt-8 border-t border-line">
              {SPECS.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between border-b border-line py-3"
                >
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                    {label}
                  </dt>
                  <dd className="text-[13px] text-ink">{value}</dd>
                </div>
              ))}
            </dl>

            <Link
              href="/studio"
              className="mt-7 inline-flex h-11 items-center gap-2 rounded-[2px] bg-ink px-5 text-[13px] font-medium text-canvas transition-colors hover:bg-ink-soft"
            >
              Try the controls
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page mt-20 border-t border-line pt-14 sm:mt-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">From the archive</p>
            <h2 className="display mt-4 text-4xl sm:text-5xl">Early experiments.</h2>
          </div>
          <Link
            href="/gallery?scope=archive"
            className="inline-flex items-center gap-2 border-b border-ink pb-1 text-sm transition-colors hover:border-accent hover:text-accent"
          >
            See the full archive
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {LEGACY_IMAGES.map((image, index) => (
            <Link
              key={image.id}
              href="/gallery?scope=archive"
              className="group block"
            >
              <div
                className="relative overflow-hidden rounded-[2px] border border-line bg-surface"
                style={{ aspectRatio: aspectRatioValue(image.resolution) }}
              >
                <Image
                  src={image.imageUrl}
                  alt={truncateText(image.prompt, 140)}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <span className="absolute left-2 top-2 rounded-[2px] border border-line bg-canvas px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-soft">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
                  {image.style} · {image.resolution}
                </p>
                <ArrowUpRight
                  className="h-3.5 w-3.5 text-muted transition-colors group-hover:text-accent"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-ink-soft">
                {image.subject || image.prompt}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-20 border-y border-line sm:mt-28">
        <div className="container-page grid gap-8 py-14 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow">Start here</p>
            <h2 className="display mt-4 max-w-2xl text-4xl sm:text-5xl">
              Write the frame you can&apos;t find.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
              No account needed to begin. Your guest workspace keeps every render; create
              an account later and the work comes with you.
            </p>
            <p className="mt-4 max-w-xl font-serif text-lg italic text-muted">
              &ldquo;{EXAMPLE_PROMPTS[0]}&rdquo;
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/studio"
              className="inline-flex h-12 items-center gap-2 rounded-[2px] bg-accent px-6 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
            >
              Start a render
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-12 items-center rounded-[2px] border border-line px-6 text-sm text-ink transition-colors hover:border-ink"
            >
              Create account
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
