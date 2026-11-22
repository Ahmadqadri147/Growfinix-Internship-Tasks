import type { Metadata } from 'next';
import { GalleryClient } from '@/components/gallery/gallery-client';
import { SCOPES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Browse every frame made in Growfinix Studio, search by prompt, filter by treatment, and keep favorites.',
};

interface GalleryPageProps {
  searchParams: Promise<{
    favorites?: string | string[];
    scope?: string | string[];
  }>;
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const params = await searchParams;
  const rawFavorites = Array.isArray(params.favorites)
    ? params.favorites[0]
    : params.favorites;
  const rawScope = Array.isArray(params.scope) ? params.scope[0] : params.scope;

  const initialFavorites = rawFavorites === '1' || rawFavorites === 'true';
  const initialScope =
    rawScope && SCOPES.includes(rawScope as (typeof SCOPES)[number])
      ? (rawScope as (typeof SCOPES)[number])
      : 'all';

  return (
    <GalleryClient
      initialFavorites={initialFavorites}
      initialScope={initialScope}
    />
  );
}
