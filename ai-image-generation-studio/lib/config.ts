import { ApiError } from './api-error';

const DEV_AUTH_SECRET =
  'dev-only-insecure-auth-secret-change-me-0123456789abcdef0123456789abcdef';

export const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);

export const databaseUrl =
  process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim() || '';

export const hasDatabase = Boolean(databaseUrl);

export const hasBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());

export const hasHuggingFace = Boolean(process.env.HUGGINGFACE_API_TOKEN?.trim());

export const hasCloudflare = Boolean(process.env.CLOUDFLARE_API_TOKEN?.trim());

export const cloudflareModel =
  process.env.CLOUDFLARE_MODEL?.trim() || '@cf/black-forest-labs/flux-1-schnell';

export const huggingFaceModel =
  process.env.HUGGINGFACE_MODEL?.trim() || 'black-forest-labs/FLUX.1-schnell';

export const hourlyGenerationLimit = Math.max(
  1,
  Number.parseInt(process.env.GENERATION_HOURLY_LIMIT || '40', 10) || 40
);

export const databaseMode = hasDatabase ? 'postgres' : isVercel ? 'unconfigured' : 'local';

export const storageMode = hasBlob ? 'vercel-blob' : isVercel ? 'unconfigured' : 'local';

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim() || (isVercel ? '' : DEV_AUTH_SECRET);
  if (!secret) {
    throw new ApiError(
      503,
      'AUTH_NOT_CONFIGURED',
      'Authentication is not configured. Set AUTH_SECRET in the environment.'
    );
  }
  if (isVercel && secret.length < 32) {
    throw new ApiError(
      503,
      'AUTH_NOT_CONFIGURED',
      'AUTH_SECRET must be at least 32 characters long in production.'
    );
  }
  return secret;
}

export function assertDatabaseConfigured(): void {
  if (isVercel && !hasDatabase) {
    throw new ApiError(
      503,
      'DATABASE_NOT_CONFIGURED',
      'The database is not configured. Connect a Postgres database and set DATABASE_URL.'
    );
  }
}

export function assertStorageConfigured(): void {
  if (isVercel && !hasBlob) {
    throw new ApiError(
      503,
      'STORAGE_NOT_CONFIGURED',
      'Persistent image storage is not configured. Connect a Vercel Blob store.'
    );
  }
}

export function canGenerate(): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!hasHuggingFace) {
    reasons.push('HUGGINGFACE_API_TOKEN is not set.');
  }
  if (isVercel && !hasBlob) {
    reasons.push('Persistent image storage (BLOB_READ_WRITE_TOKEN) is not configured.');
  }
  if (isVercel && !hasDatabase) {
    reasons.push('A Postgres database (DATABASE_URL) is not configured.');
  }
  return { ok: reasons.length === 0, reasons };
}

export function canUseCloudflare(): { ok: boolean; reason?: string } {
  if (!hasCloudflare) {
    return { ok: false, reason: 'CLOUDFLARE_API_TOKEN is not set.' };
  }
  return { ok: true };
}
