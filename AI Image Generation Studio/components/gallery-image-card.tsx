'use client';

import Image from 'next/image';
import { Heart, Maximize2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { GalleryImage } from '@/lib/types';
import {
  aspectRatioValue,
  cn,
  formatDate,
  parseResolution,
  truncateText,
} from '@/lib/utils';

interface GalleryImageCardProps {
  image: GalleryImage;
  onOpen: (image: GalleryImage) => void;
  onToggleFavorite: (image: GalleryImage) => Promise<void>;
  onDelete: (image: GalleryImage) => void;
  priority?: boolean;
}

export function GalleryImageCard({
  image,
  onOpen,
  onToggleFavorite,
  onDelete,
  priority = false,
}: GalleryImageCardProps) {
  const [busy, setBusy] = useState(false);
  const { width, height } = parseResolution(image.resolution);

  async function handleFavorite() {
    if (busy) return;
    setBusy(true);
    try {
      await onToggleFavorite(image);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="group flex flex-col">
      <div
        className="relative overflow-hidden rounded-[2px] border border-line bg-surface"
        style={{ aspectRatio: aspectRatioValue(image.resolution) }}
      >
        <button
          type="button"
          onClick={() => onOpen(image)}
          className="absolute inset-0 z-0 block h-full w-full cursor-zoom-in"
          aria-label={`View image: ${truncateText(image.prompt, 90)}`}
        >
          <Image
            src={image.imageUrl}
            alt={truncateText(image.prompt, 160)}
            width={width}
            height={height}
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.015]"
          />
        </button>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-2">
          <span className="pointer-events-none rounded-[2px] border border-line bg-canvas px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-soft">
            {image.isOwner ? 'Yours' : 'Archive'}
          </span>
          <div className="pointer-events-auto flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
            <button
              type="button"
              onClick={handleFavorite}
              disabled={busy}
              aria-label={image.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={image.isFavorite}
              className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-line bg-canvas text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
            >
              <Heart
                className={cn('h-3.5 w-3.5', image.isFavorite && 'fill-accent text-accent')}
                aria-hidden="true"
              />
            </button>
            {image.isOwner ? (
              <button
                type="button"
                onClick={() => onDelete(image)}
                aria-label="Delete image"
                className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-line bg-canvas text-ink-soft transition-colors hover:border-danger hover:text-danger"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => onOpen(image)}
              aria-label="Open fullscreen viewer"
              className="hidden h-8 w-8 items-center justify-center rounded-[2px] border border-line bg-canvas text-ink-soft transition-colors hover:border-ink hover:text-ink sm:flex"
            >
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <p className="line-clamp-2 text-[13px] leading-snug text-ink">{image.prompt}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <p className="truncate font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
            {[image.style, image.resolution, formatDate(image.createdAt)]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {image.isFavorite ? (
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-accent">
              saved
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
