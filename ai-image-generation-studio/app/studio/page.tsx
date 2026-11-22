import type { Metadata } from 'next';
import { StudioClient } from '@/components/studio/studio-client';
import { canGenerate } from '@/lib/config';
import { EXAMPLE_PROMPTS, MAX_PROMPT_LENGTH } from '@/lib/constants';
import { LEGACY_IMAGES } from '@/lib/legacy-data';

export const metadata: Metadata = {
  title: 'Studio',
  description:
    'Direct an AI image with prompt, style, lighting, texture, format and quality controls. Render with FLUX.1 schnell.',
};

export const dynamic = 'force-dynamic';

interface StudioPageProps {
  searchParams: Promise<{ prompt?: string | string[] }>;
}

export default async function StudioPage({ searchParams }: StudioPageProps) {
  const params = await searchParams;
  const rawPrompt = Array.isArray(params.prompt) ? params.prompt[0] : params.prompt;
  const initialPrompt =
    typeof rawPrompt === 'string' ? rawPrompt.slice(0, MAX_PROMPT_LENGTH) : '';

  const featured = LEGACY_IMAGES[0]
    ? {
        imageUrl: LEGACY_IMAGES[0].imageUrl,
        prompt: LEGACY_IMAGES[0].prompt,
        resolution: LEGACY_IMAGES[0].resolution,
      }
    : null;

  return (
    <StudioClient
      initialPrompt={initialPrompt}
      availability={canGenerate()}
      examples={[...EXAMPLE_PROMPTS]}
      featured={featured}
    />
  );
}
