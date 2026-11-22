import type { GalleryImage } from './types';

export interface LegacyImage extends Omit<GalleryImage, 'isFavorite' | 'isOwner' | 'blobPathname'> {
  userId: string;
}

/**
 * Archive works migrated from the original JSON gallery. They are owned by the
 * read-only `studio-archive` account and remain visible to every visitor.
 */
export const LEGACY_IMAGES: LegacyImage[] = [
  {
    id: 'mrm6lcsunxuz66m7x7',
    userId: 'studio-archive',
    prompt:
      'Realistic, An exceptionally handsome young man with a perfectly sculpted jawline, deep brown eyes, thick textured black hair, light stubble, wearing a tailored black three-piece suit and luxury watch. Standing in front of a black Rolls-Royce at night, cinematic rain, moody lighting, luxury lifestyle, ultra-realistic, photorealistic, 8K, hyper-detailed, dramatic shadows, shallow depth of field, masterpiece., Studio lighting, Smooth texture, Portrait camera angle',
    subject: 'man',
    style: 'Realistic',
    lighting: 'Studio',
    texture: 'Smooth',
    colorPalette: null,
    background: null,
    cameraAngle: 'Portrait',
    negativePrompt: null,
    imageType: 'huggingface-stable-diffusion',
    imageSize: '1024x1024',
    aspectRatio: '1:1',
    quality: 'standard',
    seed: null,
    creativity: null,
    n: 1,
    imageUrl: '/archive/hf-1784126063102-6qqsaav57.png',
    resolution: '1024x1024',
    generationTime: 29442,
    createdAt: '2026-07-15T14:34:23.118Z',
  },
  {
    id: 'mrm6jz8jtx2ryanry2',
    userId: 'studio-archive',
    prompt:
      'Realistic, A handsome young man with sharp jawline, expressive dark brown eyes, neatly styled black hair, light stubble beard, confident smile, wearing a fitted black suit with a white shirt. Standing in a modern city at golden hour, cinematic lighting, ultra-realistic, highly detailed, natural skin texture, shallow depth of field, professional portrait photography, 8K, HDR, photorealistic, masterpiece., Studio lighting, Smooth texture, white color palette, Portrait camera angle',
    subject: 'A handsome young man with sharp jawline',
    style: 'Realistic',
    lighting: 'Studio',
    texture: 'Smooth',
    colorPalette: 'white',
    background: null,
    cameraAngle: 'Portrait',
    negativePrompt: null,
    imageType: 'huggingface-stable-diffusion',
    imageSize: '1024x1024',
    aspectRatio: '1:1',
    quality: 'standard',
    seed: null,
    creativity: null,
    n: 1,
    imageUrl: '/archive/hf-1784125998867-3yhpxmwt0.png',
    resolution: '1024x1024',
    generationTime: 29654,
    createdAt: '2026-07-15T14:33:18.883Z',
  },
  {
    id: 'mrm6h5e9zpjq33tgqc8',
    userId: 'studio-archive',
    prompt:
      'Realistic, An incredibly beautiful fashion model with symmetrical facial features, glowing skin, captivating eyes, luxurious long black hair, wearing an elegant modern gown, standing in a luxury palace garden at golden hour, cinematic lighting, ultra-realistic, hyper-detailed, 8K, Vogue-style fashion photography, soft lighting, realistic textures, masterpiece, photorealistic, HDR., Studio lighting, Smooth texture, Portrait camera angle',
    subject: 'female',
    style: 'Realistic',
    lighting: 'Studio',
    texture: 'Smooth',
    colorPalette: null,
    background: null,
    cameraAngle: 'Portrait',
    negativePrompt: null,
    imageType: 'huggingface-stable-diffusion',
    imageSize: '1024x1792',
    aspectRatio: '1:1',
    quality: 'standard',
    seed: null,
    creativity: null,
    n: 1,
    imageUrl: '/archive/hf-1784125866875-2hj9cgfau.png',
    resolution: '1024x1792',
    generationTime: 34073,
    createdAt: '2026-07-15T14:31:06.897Z',
  },
];
