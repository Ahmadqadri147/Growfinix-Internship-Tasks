'use client';

import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Heart,
  Share2,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { GalleryImage } from '@/lib/types';
import {
  cn,
  formatDateTime,
  formatDuration,
  parseResolution,
  truncateText,
} from '@/lib/utils';
import { ConfirmDialog } from './ui/confirm-dialog';

interface ImageLightboxProps {
  images: GalleryImage[];
  initialIndex: number;
  onClose: () => void;
  onToggleFavorite: (image: GalleryImage) => Promise<void>;
  onDelete: (image: GalleryImage) => void;
}

export function ImageLightbox({
  images,
  initialIndex,
  onClose,
  onToggleFavorite,
  onDelete,
}: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const total = images.length;
  const currentIndex = total > 0 ? Math.min(index, total - 1) : 0;
  const image = images[currentIndex];

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight' && total > 1) {
        setIndex((current) => (current + 1) % total);
      }
      if (event.key === 'ArrowLeft' && total > 1) {
        setIndex((current) => (current - 1 + total) % total);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, total]);

  if (!image) return null;

  const { width, height } = parseResolution(image.resolution);
  const absoluteUrl =
    typeof window !== 'undefined'
      ? new URL(image.imageUrl, window.location.origin).toString()
      : image.imageUrl;

  function goTo(offset: number) {
    if (total === 0) return;
    setIndex((currentIndex + offset + total) % total);
  }

  async function handleFavorite() {
    if (!image || favoriteBusy) return;
    setFavoriteBusy(true);
    try {
      await onToggleFavorite(image);
    } finally {
      setFavoriteBusy(false);
    }
  }

  async function copyPrompt() {
    if (!image) return;
    try {
      await navigator.clipboard.writeText(image.prompt);
      toast.success('Prompt copied.');
    } catch {
      toast.error('Could not copy the prompt.');
    }
  }

  async function shareImage() {
    if (!image) return;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: 'Growfinix Studio',
          text: truncateText(image.prompt, 140),
          url: absoluteUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(absoluteUrl);
      toast.success('Image link copied.');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      toast.error('Could not share this image.');
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-[#0d0c09] text-[#f1ecdf]"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/60">
          <span className="tabular-nums">
            {String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <span className="h-3 w-px bg-white/20" aria-hidden="true" />
          <span className="hidden sm:inline">{image.style || 'Studio render'}</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">{image.resolution || '1024x1024'}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          aria-label="Close viewer"
          className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4 sm:p-8">
        {total > 1 ? (
          <button
            type="button"
            onClick={() => goTo(-1)}
            aria-label="Previous image"
            className="absolute left-2 z-10 flex h-10 w-10 items-center justify-center rounded-[2px] border border-white/15 bg-[#1b1a15] text-white/70 transition-colors hover:border-white/40 hover:text-white sm:left-4"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
        ) : null}

        <Image
          key={image.id}
          src={image.imageUrl}
          alt={truncateText(image.prompt, 180)}
          width={width}
          height={height}
          priority
          sizes="100vw"
          className="max-h-[52vh] w-auto max-w-full object-contain sm:max-h-[calc(100vh-17rem)]"
        />

        {total > 1 ? (
          <button
            type="button"
            onClick={() => goTo(1)}
            aria-label="Next image"
            className="absolute right-2 z-10 flex h-10 w-10 items-center justify-center rounded-[2px] border border-white/15 bg-[#1b1a15] text-white/70 transition-colors hover:border-white/40 hover:text-white sm:right-4"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-white/10">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="min-w-0">
            <p className="line-clamp-3 max-w-3xl text-sm leading-relaxed text-white/85">
              {image.prompt}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white/45">
              {image.subject ? <span>{image.subject}</span> : null}
              {image.lighting ? <span>{image.lighting}</span> : null}
              {image.quality ? <span>{image.quality}</span> : null}
              {image.seed ? <span>seed {image.seed}</span> : null}
              {image.generationTime ? <span>{formatDuration(image.generationTime)}</span> : null}
              <span>{formatDateTime(image.createdAt)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleFavorite}
              disabled={favoriteBusy}
              aria-pressed={image.isFavorite}
              className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-[2px] border px-3 text-[11px] transition-colors disabled:opacity-50',
                image.isFavorite
                  ? 'border-accent text-accent'
                  : 'border-white/15 text-white/75 hover:border-white/40 hover:text-white'
              )}
            >
              <Heart
                className={cn('h-3.5 w-3.5', image.isFavorite && 'fill-current')}
                aria-hidden="true"
              />
              {image.isFavorite ? 'Saved' : 'Save'}
            </button>

            <a
              href={`/api/gallery/${encodeURIComponent(image.id)}/download`}
              className="inline-flex h-9 items-center gap-1.5 rounded-[2px] border border-white/15 px-3 text-[11px] text-white/75 transition-colors hover:border-white/40 hover:text-white"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Download
            </a>

            <button
              type="button"
              onClick={copyPrompt}
              className="inline-flex h-9 items-center gap-1.5 rounded-[2px] border border-white/15 px-3 text-[11px] text-white/75 transition-colors hover:border-white/40 hover:text-white"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              Prompt
            </button>

            <button
              type="button"
              onClick={shareImage}
              className="inline-flex h-9 items-center gap-1.5 rounded-[2px] border border-white/15 px-3 text-[11px] text-white/75 transition-colors hover:border-white/40 hover:text-white"
            >
              <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
              Share
            </button>

            {image.isOwner ? (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-[2px] border border-white/15 px-3 text-[11px] text-white/75 transition-colors hover:border-[#e08a7f] hover:text-[#e08a7f]"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this image?"
        description="The image is removed from your workspace and cannot be recovered."
        confirmLabel="Delete image"
        destructive
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete(image);
        }}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
