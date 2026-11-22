import { promises as fs } from 'node:fs';
import path from 'node:path';
import { put, del } from '@vercel/blob';
import { ApiError } from './api-error';
import { assertStorageConfigured, hasBlob, isVercel } from './config';
import type { GalleryImage } from './types';

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');
const ARCHIVE_DIR = path.join(process.cwd(), 'public', 'archive');
const LOCAL_IMAGE_PREFIX = '/api/images/';

export interface StoredImage {
  url: string;
  pathname: string | null;
}

export async function saveImageBytes(
  bytes: Uint8Array,
  userId: string,
  imageId: string
): Promise<StoredImage> {
  assertStorageConfigured();

  if (hasBlob) {
    const pathname = `generated/${userId}/${imageId}.png`;
    const blob = await put(pathname, Buffer.from(bytes), {
      access: 'public',
      contentType: 'image/png',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return { url: blob.url, pathname: blob.pathname };
  }

  if (isVercel) {
    throw new ApiError(
      503,
      'STORAGE_NOT_CONFIGURED',
      'Persistent image storage is not configured.'
    );
  }

  await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  const filename = `${imageId}.png`;
  await fs.writeFile(path.join(LOCAL_UPLOAD_DIR, filename), bytes);
  return { url: `${LOCAL_IMAGE_PREFIX}${filename}`, pathname: null };
}

export async function deleteStoredImage(
  image: Pick<GalleryImage, 'imageUrl' | 'blobPathname'>
): Promise<void> {
  try {
    if (hasBlob && image.blobPathname) {
      await del(image.blobPathname, { token: process.env.BLOB_READ_WRITE_TOKEN });
      return;
    }

    if (image.imageUrl.startsWith(LOCAL_IMAGE_PREFIX)) {
      const filename = path.basename(image.imageUrl);
      await fs.unlink(path.join(LOCAL_UPLOAD_DIR, filename));
    }
  } catch (error) {
    console.error('[storage] Failed to delete image asset:', error);
  }
}

export async function readStoredImage(
  imageUrl: string
): Promise<{ bytes: Uint8Array; contentType: string }> {
  if (imageUrl.startsWith('/archive/')) {
    const filename = path.basename(imageUrl);
    const bytes = await fs.readFile(path.join(ARCHIVE_DIR, filename));
    return { bytes: new Uint8Array(bytes), contentType: 'image/png' };
  }

  if (imageUrl.startsWith(LOCAL_IMAGE_PREFIX)) {
    const filename = path.basename(imageUrl);
    const bytes = await fs.readFile(path.join(LOCAL_UPLOAD_DIR, filename));
    return { bytes: new Uint8Array(bytes), contentType: 'image/png' };
  }

  if (imageUrl.startsWith('https://')) {
    const response = await fetch(imageUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new ApiError(502, 'IMAGE_UNAVAILABLE', 'The image file could not be read.');
    }
    const contentType = response.headers.get('content-type') || 'image/png';
    const bytes = new Uint8Array(await response.arrayBuffer());
    return { bytes, contentType };
  }

  throw new ApiError(400, 'INVALID_IMAGE_URL', 'Unsupported image location.');
}

export async function readLocalUpload(
  filename: string
): Promise<{ bytes: Uint8Array; contentType: string } | null> {
  if (!/^[a-zA-Z0-9_-]+\.png$/.test(filename)) return null;

  try {
    const bytes = await fs.readFile(path.join(LOCAL_UPLOAD_DIR, filename));
    return { bytes: new Uint8Array(bytes), contentType: 'image/png' };
  } catch {
    return null;
  }
}
