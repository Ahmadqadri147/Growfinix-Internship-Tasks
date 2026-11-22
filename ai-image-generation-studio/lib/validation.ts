import { z } from 'zod';
import {
  ASPECT_RATIOS,
  BACKGROUNDS,
  CAMERA_ANGLES,
  IMAGE_SIZES,
  LIGHTING,
  MAX_IMAGES_PER_REQUEST,
  MAX_PROMPT_LENGTH,
  MIN_PROMPT_LENGTH,
  QUALITIES,
  SCOPES,
  SORT_OPTIONS,
  STYLES,
  TEXTURES,
} from './constants';

const emptyToUndefined = (value: unknown) => {
  if (typeof value === 'string' && value.trim() === '') return undefined;
  return value;
};

const optionalText = (max: number) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());

const optionalInt = (min: number, max: number) =>
  z.preprocess(emptyToUndefined, z.coerce.number().int().min(min).max(max).optional());

export const generationSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(MIN_PROMPT_LENGTH, `Prompt must be at least ${MIN_PROMPT_LENGTH} characters.`)
    .max(MAX_PROMPT_LENGTH, `Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer.`),
  subject: optionalText(100),
  style: z.enum(STYLES).optional(),
  lighting: z.enum(LIGHTING).optional(),
  texture: z.enum(TEXTURES).optional(),
  colorPalette: optionalText(50),
  background: z.enum(BACKGROUNDS).optional(),
  cameraAngle: z.enum(CAMERA_ANGLES).optional(),
  negativePrompt: optionalText(500),
  imageSize: z.enum(IMAGE_SIZES).optional(),
  aspectRatio: z.enum(ASPECT_RATIOS).optional(),
  quality: z.enum(QUALITIES).optional(),
  seed: optionalInt(1, 2147483647),
  creativity: optionalInt(0, 10),
  n: optionalInt(1, MAX_IMAGES_PER_REQUEST),
});

export type GenerationInput = z.infer<typeof generationSchema>;

export const galleryQuerySchema = z.object({
  search: optionalText(100),
  style: z.enum(STYLES).optional(),
  lighting: z.enum(LIGHTING).optional(),
  texture: z.enum(TEXTURES).optional(),
  aspectRatio: z.enum(ASPECT_RATIOS).optional(),
  resolution: z.enum(IMAGE_SIZES).optional(),
  scope: z.enum(SCOPES).default('all'),
  favoritesOnly: z.preprocess(
    (value) => value === 'true' || value === true,
    z.boolean()
  ).default(false),
  sortBy: z.enum(SORT_OPTIONS).default('newest'),
  limit: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(60).default(24)
  ),
  offset: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(0).max(100000).default(0)
  ),
});

export const registerSchema = z.object({
  name: z.preprocess(emptyToUndefined, z.string().trim().min(1).max(60).optional()),
  email: z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address.')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(72, 'Password must be 72 characters or fewer.'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address.')),
  password: z.string().min(1, 'Password is required.').max(72),
});

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required.')
    .max(60, 'Name must be 60 characters or fewer.'),
});

export function parseSearchParams(searchParams: URLSearchParams): Record<string, string> {
  const raw: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    if (value !== '') raw[key] = value;
  }
  return raw;
}

export function zodDetails(error: z.ZodError): { path: string; message: string }[] {
  return error.issues.map((issue) => ({
    path: issue.path.join('.') || 'body',
    message: issue.message,
  }));
}
