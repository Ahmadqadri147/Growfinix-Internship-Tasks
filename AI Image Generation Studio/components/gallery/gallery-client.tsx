'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  Heart,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ASPECT_RATIOS,
  GALLERY_PAGE_SIZE,
  IMAGE_SIZES,
  LIGHTING,
  SCOPES,
  SORT_OPTIONS,
  STYLES,
  TEXTURES,
} from '@/lib/constants';
import { ApiClientError, clientApi } from '@/lib/client-api';
import type { GalleryImage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useSession } from '../session-provider';
import { Button } from '../ui/button';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { GalleryImageCard } from '../gallery-image-card';
import { ImageLightbox } from '../image-lightbox';

interface GalleryClientProps {
  initialFavorites?: boolean;
  initialScope?: 'all' | 'mine' | 'archive';
}

interface GalleryFiltersState {
  search: string;
  style: string;
  lighting: string;
  texture: string;
  aspectRatio: string;
  resolution: string;
  scope: 'all' | 'mine' | 'archive';
  favoritesOnly: boolean;
  sortBy: 'newest' | 'oldest' | 'favorites';
}

const SORT_LABELS: Record<(typeof SORT_OPTIONS)[number], string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  favorites: 'Favorites first',
};

const SCOPE_LABELS: Record<(typeof SCOPES)[number], string> = {
  all: 'Everything',
  mine: 'Yours',
  archive: 'Archive',
};

export function GalleryClient({
  initialFavorites = false,
  initialScope = 'all',
}: GalleryClientProps) {
  const { refresh } = useSession();
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState<GalleryFiltersState>({
    search: '',
    style: '',
    lighting: '',
    texture: '',
    aspectRatio: '',
    resolution: '',
    scope: initialScope,
    favoritesOnly: initialFavorites,
    sortBy: 'newest',
  });
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{ images: GalleryImage[]; index: number } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const requestRef = useRef(0);
  const sessionSyncedRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((current) =>
        current.search === searchInput ? current : { ...current, search: searchInput }
      );
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(
    async (offset: number, append: boolean) => {
      const requestId = ++requestRef.current;
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await clientApi.gallery({
          ...filters,
          limit: GALLERY_PAGE_SIZE,
          offset,
        });
        if (requestId !== requestRef.current) return;

        setImages((current) => {
          if (!append) return response.data;
          const existing = new Set(current.map((image) => image.id));
          return [...current, ...response.data.filter((image) => !existing.has(image.id))];
        });
        setTotal(response.total);
        setHasMore(response.hasMore);

        if (!sessionSyncedRef.current) {
          sessionSyncedRef.current = true;
          void refresh();
        }
      } catch (loadError) {
        if (requestId !== requestRef.current) return;
        setError(
          loadError instanceof ApiClientError
            ? loadError.message
            : 'The gallery could not be loaded.'
        );
      } finally {
        if (requestId === requestRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [filters, refresh]
  );

  useEffect(() => {
    // Gallery data is fetched from the route handler whenever the filters change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(0, false);
  }, [load]);

  const activeFilterCount = useMemo(
    () =>
      [
        filters.search,
        filters.style,
        filters.lighting,
        filters.texture,
        filters.aspectRatio,
        filters.resolution,
        filters.favoritesOnly ? 'favorites' : '',
        filters.scope !== 'all' ? filters.scope : '',
      ].filter(Boolean).length,
    [filters]
  );

  const updateImage = useCallback((id: string, patch: Partial<GalleryImage>) => {
    setImages((current) =>
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
    setImages((current) => current.filter((image) => image.id !== id));
    setTotal((current) => Math.max(0, current - 1));
    setViewer((current) => {
      if (!current) return current;
      const next = current.images.filter((image) => image.id !== id);
      if (next.length === 0) return null;
      return { images: next, index: Math.min(current.index, next.length - 1) };
    });
  }, []);

  const handleToggleFavorite = useCallback(
    async (image: GalleryImage) => {
      try {
        const response = await clientApi.toggleFavorite(image.id);
        updateImage(image.id, { isFavorite: response.data.isFavorite });
        toast.success(response.data.isFavorite ? 'Saved to favorites.' : 'Removed from favorites.');

        if (filters.favoritesOnly && !response.data.isFavorite) {
          removeImage(image.id);
        }
        void refresh();
      } catch (toggleError) {
        toast.error(
          toggleError instanceof ApiClientError
            ? toggleError.message
            : 'Could not update this favorite.'
        );
      }
    },
    [filters.favoritesOnly, refresh, removeImage, updateImage]
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
    } catch (deleteError) {
      toast.error(
        deleteError instanceof ApiClientError
          ? deleteError.message
          : 'Could not delete this image.'
      );
    } finally {
      setDeleting(false);
    }
  }

  function resetFilters() {
    setSearchInput('');
    setFilters({
      search: '',
      style: '',
      lighting: '',
      texture: '',
      aspectRatio: '',
      resolution: '',
      scope: 'all',
      favoritesOnly: false,
      sortBy: 'newest',
    });
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="grid gap-6 border-b border-line pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow">Archive — 02</p>
          <h1 className="display mt-4 text-5xl sm:text-6xl">The gallery.</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
            Every frame made in this studio, plus a small permanent archive of early
            experiments. Search by prompt, filter by treatment, and keep what matters.
          </p>
        </div>
        <div className="flex items-end gap-3">
          <div className="rounded-[2px] border border-line px-3 py-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">Frames</p>
            <p className="mt-1 font-mono text-[11px] tabular-nums text-ink">
              {loading ? '—' : total}
            </p>
          </div>
          <Link
            href="/studio"
            className="inline-flex h-10 items-center gap-1.5 rounded-[2px] bg-ink px-4 text-[12px] font-medium text-canvas transition-colors hover:bg-ink-soft"
          >
            New render
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <div className="mt-6 space-y-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search prompts…"
              aria-label="Search prompts"
              className="input pl-9"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-muted transition-colors hover:text-ink"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-[2px] border border-line p-0.5" role="group" aria-label="Scope">
              {SCOPES.map((scope) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => setFilters((current) => ({ ...current, scope }))}
                  aria-pressed={filters.scope === scope}
                  className={cn(
                    'rounded-[1px] px-3 py-1.5 text-[11px] transition-colors',
                    filters.scope === scope
                      ? 'bg-ink text-canvas'
                      : 'text-ink-soft hover:text-ink'
                  )}
                >
                  {SCOPE_LABELS[scope]}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  favoritesOnly: !current.favoritesOnly,
                }))
              }
              aria-pressed={filters.favoritesOnly}
              className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-[2px] border px-3 text-[11px] transition-colors',
                filters.favoritesOnly
                  ? 'border-accent text-accent'
                  : 'border-line text-ink-soft hover:border-ink hover:text-ink'
              )}
            >
              <Heart
                className={cn('h-3.5 w-3.5', filters.favoritesOnly && 'fill-current')}
                aria-hidden="true"
              />
              Saved
            </button>

            <select
              value={filters.sortBy}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  sortBy: event.target.value as GalleryFiltersState['sortBy'],
                }))
              }
              aria-label="Sort images"
              className="select h-9 w-auto text-xs"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {SORT_LABELS[option]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-y border-line py-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
              Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </span>
          </div>
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={resetFilters}
              className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent"
            >
              Clear all
            </button>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <FilterSelect
            label="Style"
            value={filters.style}
            options={STYLES}
            onChange={(value) => setFilters((current) => ({ ...current, style: value }))}
          />
          <FilterSelect
            label="Lighting"
            value={filters.lighting}
            options={LIGHTING}
            onChange={(value) => setFilters((current) => ({ ...current, lighting: value }))}
          />
          <FilterSelect
            label="Texture"
            value={filters.texture}
            options={TEXTURES}
            onChange={(value) => setFilters((current) => ({ ...current, texture: value }))}
          />
          <FilterSelect
            label="Aspect"
            value={filters.aspectRatio}
            options={ASPECT_RATIOS}
            onChange={(value) => setFilters((current) => ({ ...current, aspectRatio: value }))}
          />
          <FilterSelect
            label="Resolution"
            value={filters.resolution}
            options={IMAGE_SIZES}
            onChange={(value) => setFilters((current) => ({ ...current, resolution: value }))}
          />
        </div>
      </div>

      {error ? (
        <div className="mt-10 rounded-[2px] border border-line bg-surface p-6">
          <p className="font-serif text-2xl">The archive is out of reach.</p>
          <p className="mt-2 text-sm text-ink-soft">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => void load(0, false)}>
            Try again
          </Button>
        </div>
      ) : loading ? (
        <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index}>
              <div className="skeleton aspect-[4/3] rounded-[2px] border border-line" />
              <div className="skeleton mt-3 h-3 w-4/5 rounded-[1px]" />
              <div className="skeleton mt-2 h-2 w-2/5 rounded-[1px]" />
            </div>
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="mt-10 rounded-[2px] border border-line bg-surface px-6 py-16 text-center">
          <p className="font-serif text-3xl">No frames match this cut.</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            Try a broader search, clear a filter, or make the first frame for this
            workspace.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={resetFilters}>
              Clear filters
            </Button>
            <Link
              href="/studio"
              className="inline-flex h-10 items-center gap-1.5 rounded-[2px] bg-ink px-4 text-[13px] font-medium text-canvas transition-colors hover:bg-ink-soft"
            >
              Open studio
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.map((image, index) => (
              <GalleryImageCard
                key={image.id}
                image={image}
                priority={index < 4}
                onOpen={(target) =>
                  setViewer({
                    images,
                    index: Math.max(
                      0,
                      images.findIndex((item) => item.id === target.id)
                    ),
                  })
                }
                onToggleFavorite={handleToggleFavorite}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center gap-3 border-t border-line pt-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              Showing {images.length} of {total}
            </p>
            {hasMore ? (
              <Button
                variant="outline"
                loading={loadingMore}
                onClick={() => void load(images.length, true)}
              >
                Load more frames
              </Button>
            ) : null}
          </div>
        </>
      )}

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

interface FilterSelectProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="select h-9 text-xs"
        aria-label={label}
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
