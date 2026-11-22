'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  ChevronDown,
  Copy,
  Download,
  Heart,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import {
  ASPECT_RATIOS,
  BACKGROUNDS,
  CAMERA_ANGLES,
  DEFAULT_FORM,
  DEFAULT_SIZE_BY_RATIO,
  LIGHTING,
  MAX_IMAGES_PER_REQUEST,
  MAX_PROMPT_LENGTH,
  QUALITIES,
  SIZE_BY_RATIO,
  STYLES,
  TEXTURES,
} from '@/lib/constants';
import { ApiClientError, clientApi } from '@/lib/client-api';
import type { GalleryImage, GenerationRequest } from '@/lib/types';
import { aspectRatioValue, cn, formatDuration, truncateText } from '@/lib/utils';
import { useSession } from '../session-provider';
import { Button } from '../ui/button';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { Field, RangeField, Segmented } from '../ui/field';
import { GalleryImageCard } from '../gallery-image-card';
import { ImageLightbox } from '../image-lightbox';
import { GenerationProgress } from './generation-progress';

interface StudioForm {
  prompt: string;
  subject: string;
  style: string;
  lighting: string;
  texture: string;
  colorPalette: string;
  background: string;
  cameraAngle: string;
  negativePrompt: string;
  aspectRatio: string;
  imageSize: string;
  quality: string;
  seed: string;
  creativity: number;
  n: number;
}

interface FeaturedFrame {
  imageUrl: string;
  prompt: string;
  resolution: string | null;
}

interface StudioClientProps {
  initialPrompt: string;
  availability: { ok: boolean; reasons: string[] };
  examples: readonly string[];
  featured: FeaturedFrame | null;
}

const FRAME_COUNTS = ['1', '2', '3', '4', '5'] as const;

function toForm(initialPrompt: string): StudioForm {
  return {
    prompt: initialPrompt,
    subject: '',
    style: DEFAULT_FORM.style,
    lighting: DEFAULT_FORM.lighting,
    texture: DEFAULT_FORM.texture,
    colorPalette: '',
    background: '',
    cameraAngle: DEFAULT_FORM.cameraAngle,
    negativePrompt: '',
    aspectRatio: DEFAULT_FORM.aspectRatio,
    imageSize: DEFAULT_FORM.imageSize,
    quality: DEFAULT_FORM.quality,
    seed: '',
    creativity: DEFAULT_FORM.creativity,
    n: DEFAULT_FORM.n,
  };
}

export function StudioClient({
  initialPrompt,
  availability,
  examples,
  featured,
}: StudioClientProps) {
  const { stats, refresh } = useSession();
  const [form, setForm] = useState<StudioForm>(() => toForm(initialPrompt));
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [results, setResults] = useState<GalleryImage[] | null>(null);
  const [activeResult, setActiveResult] = useState(0);
  const [history, setHistory] = useState<GalleryImage[]>([]);
  const [viewer, setViewer] = useState<{ images: GalleryImage[]; index: number } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sizeOptions = useMemo(
    () => SIZE_BY_RATIO[form.aspectRatio] ?? [form.imageSize],
    [form.aspectRatio, form.imageSize]
  );

  const activeImage = results?.[Math.min(activeResult, results.length - 1)] ?? null;
  const remaining = stats ? Math.max(0, stats.hourlyLimit - stats.hourlyUsed) : null;

  useEffect(() => {
    let active = true;
    clientApi
      .history(6)
      .then((response) => {
        if (active) setHistory(response.data);
      })
      .catch(() => {
        // History is a convenience; a failed fetch should not block the studio.
      })
      .finally(() => {
        if (active) void refresh();
      });
    return () => {
      active = false;
    };
  }, [refresh]);

  useEffect(() => {
    if (!rendering) return;
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setElapsed((Date.now() - startedAt) / 1000);
    }, 100);
    return () => window.clearInterval(timer);
  }, [rendering]);

  function updateField<K extends keyof StudioForm>(key: K, value: StudioForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateAspectRatio(value: string) {
    setForm((current) => ({
      ...current,
      aspectRatio: value,
      imageSize: DEFAULT_SIZE_BY_RATIO[value] ?? current.imageSize,
    }));
  }

  function surpriseMe() {
    const pool = examples.length > 0 ? examples : [DEFAULT_FORM.prompt];
    const options = pool.filter((example) => example !== form.prompt);
    const next = options[Math.floor(Math.random() * options.length)] ?? pool[0];
    updateField('prompt', next);
  }

  const updateImage = useCallback((id: string, patch: Partial<GalleryImage>) => {
    setResults((current) =>
      current ? current.map((image) => (image.id === id ? { ...image, ...patch } : image)) : current
    );
    setHistory((current) =>
      current.map((image) => (image.id === id ? { ...image, ...patch } : image))
    );
    setViewer((current) =>
      current
        ? {
            ...current,
            images: current.images.map((image) =>
              image.id === id ? { ...image, ...patch } : image
            ),
          }
        : current
    );
  }, []);

  const removeImage = useCallback((id: string) => {
    setResults((current) => {
      if (!current) return current;
      const next = current.filter((image) => image.id !== id);
      return next.length > 0 ? next : null;
    });
    setHistory((current) => current.filter((image) => image.id !== id));
    setViewer((current) => {
      if (!current) return current;
      const next = current.images.filter((image) => image.id !== id);
      if (next.length === 0) return null;
      return { images: next, index: Math.min(current.index, next.length - 1) };
    });
    setActiveResult(0);
  }, []);

  const handleToggleFavorite = useCallback(
    async (image: GalleryImage) => {
      try {
        const response = await clientApi.toggleFavorite(image.id);
        updateImage(image.id, { isFavorite: response.data.isFavorite });
        toast.success(response.data.isFavorite ? 'Saved to favorites.' : 'Removed from favorites.');
        void refresh();
      } catch (error) {
        toast.error(
          error instanceof ApiClientError ? error.message : 'Could not update this favorite.'
        );
      }
    },
    [refresh, updateImage]
  );

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await clientApi.deleteImage(deleteTarget.id);
      removeImage(deleteTarget.id);
      setDeleteTarget(null);
      toast.success('Image deleted.');
      void refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : 'Could not delete this image.');
    } finally {
      setDeleting(false);
    }
  }

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied.`);
    } catch {
      toast.error('Could not copy to the clipboard.');
    }
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!availability.ok) {
      toast.error('Generation is not configured on this deployment.');
      return;
    }

    const prompt = form.prompt.trim();
    if (prompt.length < 10) {
      toast.error('Write at least 10 characters before generating.');
      return;
    }

    const parsedSeed = Number(form.seed);
    const seed =
      form.seed.trim() && Number.isFinite(parsedSeed) && parsedSeed > 0
        ? Math.floor(parsedSeed)
        : undefined;

    const payload: GenerationRequest = {
      prompt,
      subject: form.subject.trim() || undefined,
      style: form.style || undefined,
      lighting: form.lighting || undefined,
      texture: form.texture || undefined,
      colorPalette: form.colorPalette.trim() || undefined,
      background: form.background || undefined,
      cameraAngle: form.cameraAngle || undefined,
      negativePrompt: form.negativePrompt.trim() || undefined,
      imageSize: form.imageSize,
      aspectRatio: form.aspectRatio,
      quality: form.quality,
      seed,
      creativity: form.creativity,
      n: form.n,
    };

    setRendering(true);
    setElapsed(0);

    try {
      const response = await clientApi.generate(payload);
      const images = response.data.images;
      setResults(images);
      setActiveResult(0);
      setHistory((current) => {
        const fresh = images.filter((image) => !current.some((item) => item.id === image.id));
        return [...fresh, ...current].slice(0, 6);
      });
      await refresh();

      if (images.length > 0) {
        toast.success(response.message);
      }
      if (response.data.failures.length > 0) {
        toast.error(
          response.data.failures[0]?.message || 'One frame could not be completed.'
        );
      }

      window.setTimeout(() => {
        document.getElementById('studio-results')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 80);
    } catch (error) {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : 'Generation failed. Please try again.'
      );
    } finally {
      setRendering(false);
    }
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="grid gap-6 border-b border-line pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow">Studio — 01</p>
          <h1 className="display mt-4 text-5xl sm:text-6xl">Direct the frame.</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
            Write a scene, choose a treatment, and render it with FLUX. Every frame is saved
            to your workspace, ready to revisit or download.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="min-w-[9rem] rounded-[2px] border border-line px-3 py-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">Engine</p>
            <p className="mt-1 font-mono text-[11px] text-ink">FLUX.1 schnell</p>
          </div>
          <div className="min-w-[9rem] rounded-[2px] border border-line px-3 py-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">Quota</p>
            <p className="mt-1 font-mono text-[11px] text-ink">
              {remaining !== null ? `${remaining} / ${stats?.hourlyLimit} frames` : 'Guest workspace'}
            </p>
          </div>
        </div>
      </header>

      {!availability.ok ? (
        <div className="mt-6 rounded-[2px] border border-line bg-surface p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
            Generation offline
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            This deployment is missing required configuration: {availability.reasons.join(' ')}
          </p>
          <p className="mt-1 text-xs text-muted">
            You can still browse the gallery and archive. See DEPLOYMENT.md for setup.
          </p>
        </div>
      ) : null}

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
        <form onSubmit={handleGenerate} className="min-w-0">
          <section>
            <div className="flex items-center justify-between gap-3 border-b border-line pb-2">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                01 — Brief
              </h2>
              <button
                type="button"
                onClick={surpriseMe}
                className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted transition-colors hover:text-accent"
              >
                <Wand2 className="h-3 w-3" aria-hidden="true" />
                Surprise me
              </button>
            </div>

            <div className="mt-5">
              <Field
                label="Prompt"
                htmlFor="prompt"
                aside={
                  <span className="font-mono text-[10px] tabular-nums text-muted">
                    {form.prompt.length}/{MAX_PROMPT_LENGTH}
                  </span>
                }
              >
                <textarea
                  id="prompt"
                  value={form.prompt}
                  onChange={(event) => updateField('prompt', event.target.value)}
                  maxLength={MAX_PROMPT_LENGTH}
                  placeholder="A glass observatory above a sea of clouds at dusk, wide shot, soft volumetric light…"
                  className="textarea min-h-[9.5rem] text-[15px]"
                  required
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Subject (optional)" htmlFor="subject">
                <input
                  id="subject"
                  value={form.subject}
                  onChange={(event) => updateField('subject', event.target.value)}
                  maxLength={100}
                  placeholder="A glass observatory"
                  className="input"
                />
              </Field>
            </div>
          </section>

          <section className="mt-9">
            <div className="border-b border-line pb-2">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                02 — Treatment
              </h2>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Style" htmlFor="style">
                <select
                  id="style"
                  value={form.style}
                  onChange={(event) => updateField('style', event.target.value)}
                  className="select"
                >
                  {STYLES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Lighting" htmlFor="lighting">
                <select
                  id="lighting"
                  value={form.lighting}
                  onChange={(event) => updateField('lighting', event.target.value)}
                  className="select"
                >
                  {LIGHTING.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Surface / texture" htmlFor="texture">
                <select
                  id="texture"
                  value={form.texture}
                  onChange={(event) => updateField('texture', event.target.value)}
                  className="select"
                >
                  {TEXTURES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Color palette" htmlFor="colorPalette">
                <input
                  id="colorPalette"
                  value={form.colorPalette}
                  onChange={(event) => updateField('colorPalette', event.target.value)}
                  maxLength={50}
                  placeholder="Muted ochre, bone, deep green"
                  className="input"
                />
              </Field>

              <Field label="Background" htmlFor="background">
                <select
                  id="background"
                  value={form.background}
                  onChange={(event) => updateField('background', event.target.value)}
                  className="select"
                >
                  <option value="">No preference</option>
                  {BACKGROUNDS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Camera angle" htmlFor="cameraAngle">
                <select
                  id="cameraAngle"
                  value={form.cameraAngle}
                  onChange={(event) => updateField('cameraAngle', event.target.value)}
                  className="select"
                >
                  {CAMERA_ANGLES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          <section className="mt-9">
            <div className="border-b border-line pb-2">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                03 — Format
              </h2>
            </div>

            <div className="mt-5 space-y-5">
              <Segmented
                label="Aspect ratio"
                options={ASPECT_RATIOS}
                value={form.aspectRatio}
                onChange={updateAspectRatio}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Resolution" htmlFor="imageSize">
                  <select
                    id="imageSize"
                    value={form.imageSize}
                    onChange={(event) => updateField('imageSize', event.target.value)}
                    className="select"
                  >
                    {sizeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>

                <div>
                  <Segmented
                    label="Quality"
                    options={QUALITIES}
                    value={form.quality}
                    onChange={(value) => updateField('quality', value)}
                  />
                </div>
              </div>

              <Segmented
                label="Frames"
                options={FRAME_COUNTS}
                value={String(form.n)}
                onChange={(value) =>
                  updateField('n', Math.min(Number(value), MAX_IMAGES_PER_REQUEST))
                }
              />
            </div>
          </section>

          <section className="mt-9">
            <button
              type="button"
              onClick={() => setAdvancedOpen((value) => !value)}
              aria-expanded={advancedOpen}
              aria-controls="advanced-settings"
              className="flex w-full items-center justify-between border-b border-line pb-2 text-left"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                04 — Fine tuning
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted transition-transform',
                  advancedOpen && 'rotate-180'
                )}
                aria-hidden="true"
              />
            </button>

            {advancedOpen ? (
              <div id="advanced-settings" className="mt-5 space-y-5">
                <Field label="Negative prompt" htmlFor="negativePrompt">
                  <textarea
                    id="negativePrompt"
                    value={form.negativePrompt}
                    onChange={(event) => updateField('negativePrompt', event.target.value)}
                    maxLength={500}
                    placeholder="blurry, extra limbs, text artifacts…"
                    className="textarea min-h-[5rem]"
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Seed"
                    htmlFor="seed"
                    hint="Leave empty for a new seed each frame."
                  >
                    <input
                      id="seed"
                      type="number"
                      min={1}
                      max={2147483647}
                      value={form.seed}
                      onChange={(event) => updateField('seed', event.target.value)}
                      placeholder="Random"
                      className="input"
                    />
                  </Field>

                  <RangeField
                    label="Guidance"
                    value={form.creativity}
                    min={0}
                    max={10}
                    onChange={(value) => updateField('creativity', value)}
                    formatValue={(value) => `${value} / 10`}
                    hint="Higher values follow the prompt more literally."
                  />
                </div>
              </div>
            ) : null}
          </section>

          <div className="mt-8 border-t border-line pt-6">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={rendering}
              disabled={!availability.ok}
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {rendering
                ? 'Rendering…'
                : `Generate ${form.n} ${form.n === 1 ? 'frame' : 'frames'}`}
            </Button>
            <p className="mt-3 text-center text-xs text-muted">
              Renders typically take 8–30 seconds. Your frames are saved automatically.
            </p>
          </div>
        </form>

        <div id="studio-results" className="min-w-0 scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
          {rendering ? (
            <GenerationProgress count={form.n} elapsed={elapsed} aspectRatio={form.aspectRatio} />
          ) : activeImage ? (
            <div>
              <div className="flex items-end justify-between gap-3">
                <p className="eyebrow">Latest render</p>
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                  {results?.length} {results?.length === 1 ? 'frame' : 'frames'}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setViewer({ images: results ?? [], index: Math.max(0, activeResult) })
                }
                className="group relative mt-3 block w-full cursor-zoom-in overflow-hidden rounded-[2px] border border-line bg-surface"
                style={{ aspectRatio: aspectRatioValue(activeImage.resolution) }}
                aria-label="Open latest render fullscreen"
              >
                <Image
                  src={activeImage.imageUrl}
                  alt={truncateText(activeImage.prompt, 180)}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                />
                <span className="absolute bottom-2 right-2 rounded-[2px] border border-line bg-canvas px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-soft opacity-0 transition-opacity group-hover:opacity-100">
                  View full
                </span>
              </button>

              <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-ink">
                {activeImage.prompt}
              </p>

              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                <span>{activeImage.style || 'Studio'}</span>
                <span>{activeImage.resolution || '1024x1024'}</span>
                <span>{activeImage.quality || 'standard'}</span>
                {activeImage.seed ? <span>seed {activeImage.seed}</span> : null}
                {activeImage.generationTime ? (
                  <span>{formatDuration(activeImage.generationTime)}</span>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant={activeImage.isFavorite ? 'ink' : 'outline'}
                  size="sm"
                  onClick={() => handleToggleFavorite(activeImage)}
                >
                  <Heart
                    className={cn('h-3.5 w-3.5', activeImage.isFavorite && 'fill-current')}
                    aria-hidden="true"
                  />
                  {activeImage.isFavorite ? 'Saved' : 'Save'}
                </Button>

                <a
                  href={`/api/gallery/${encodeURIComponent(activeImage.id)}/download`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-[2px] border border-line px-3 text-xs text-ink transition-colors hover:border-ink"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Download
                </a>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyText(activeImage.prompt, 'Prompt')}
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  Copy prompt
                </Button>
              </div>

              {results && results.length > 1 ? (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {results.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setActiveResult(index)}
                      aria-label={`View frame ${index + 1}`}
                      aria-pressed={index === activeResult}
                      className={cn(
                        'relative overflow-hidden rounded-[2px] border transition-colors',
                        index === activeResult ? 'border-ink' : 'border-line hover:border-line-strong'
                      )}
                      style={{ aspectRatio: aspectRatioValue(image.resolution) }}
                    >
                      <Image
                        src={image.imageUrl}
                        alt=""
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div>
              {featured ? (
                <div className="overflow-hidden rounded-[2px] border border-line bg-surface">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={featured.imageUrl}
                      alt={truncateText(featured.prompt, 160)}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="border-t border-line p-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                      From the archive
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                      {featured.prompt}
                    </p>
                  </div>
                </div>
              ) : null}

              <p className="mt-6 font-serif text-3xl leading-tight">
                Your next frame starts with a sentence.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Describe the scene, then refine it with treatment and format. Try one of these
                to begin:
              </p>

              <div className="mt-4 flex flex-col gap-2">
                {examples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => updateField('prompt', example)}
                    className="group flex items-start justify-between gap-3 rounded-[2px] border border-line px-3 py-3 text-left transition-colors hover:border-ink"
                  >
                    <span className="text-[13px] leading-snug text-ink-soft group-hover:text-ink">
                      {example}
                    </span>
                    <ArrowUpRight
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {history.length > 0 ? (
        <section className="mt-16 border-t border-line pt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Workspace</p>
              <h2 className="mt-2 font-serif text-3xl">Recent frames</h2>
            </div>
            <Link
              href="/gallery?scope=mine"
              className="inline-flex items-center gap-1.5 border-b border-ink pb-0.5 text-xs text-ink transition-colors hover:border-accent hover:text-accent"
            >
              Open gallery
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
            {history.map((image) => (
              <GalleryImageCard
                key={image.id}
                image={image}
                onOpen={(target) =>
                  setViewer({
                    images: history,
                    index: Math.max(
                      0,
                      history.findIndex((item) => item.id === target.id)
                    ),
                  })
                }
                onToggleFavorite={handleToggleFavorite}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        </section>
      ) : null}

      {viewer ? (
        <ImageLightbox
          images={viewer.images}
          initialIndex={viewer.index}
          onClose={() => setViewer(null)}
          onToggleFavorite={handleToggleFavorite}
          onDelete={setDeleteTarget}
        />
      ) : null}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this image?"
        description="The image is removed from your workspace and cannot be recovered."
        confirmLabel="Delete image"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
