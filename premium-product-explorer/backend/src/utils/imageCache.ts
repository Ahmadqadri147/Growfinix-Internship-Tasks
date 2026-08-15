import { createHash } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { promises as fsp } from "node:fs";
import path from "node:path";

export const IMAGE_CACHE_DIR = path.resolve(__dirname, "../../.cache/images");

const FETCH_TIMEOUT_MS = 25000;

export function cacheFilePath(src: string): string {
  const hash = createHash("sha256").update(src).digest("hex").slice(0, 32);
  return path.join(IMAGE_CACHE_DIR, `${hash}.jpg`);
}

export function isCached(src: string): boolean {
  return existsSync(cacheFilePath(src));
}

export async function fetchAndCacheImage(
  src: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const filePath = cacheFilePath(src);
  if (existsSync(filePath)) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const upstream = await fetch(src, { redirect: "follow", signal: controller.signal });
    if (!upstream.ok) return null;
    const buffer = Buffer.from(await upstream.arrayBuffer());
    mkdirSync(IMAGE_CACHE_DIR, { recursive: true });
    await fsp.writeFile(filePath, buffer);
    return { buffer, contentType: upstream.headers.get("content-type") ?? "image/jpeg" };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}