import { Router, type Request, type Response } from "express";
import { createReadStream } from "node:fs";
import { logger } from "../config/logger";
import { cacheFilePath, fetchAndCacheImage, isCached } from "../utils/imageCache";

const router = Router();

const ALLOWED_HOSTS = ["loremflickr.com"];

function isAllowedSrc(src: string): boolean {
  try {
    const url = new URL(src);
    return (
      url.protocol === "https:" &&
      ALLOWED_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))
    );
  } catch {
    return false;
  }
}

router.get("/", async (req: Request, res: Response) => {
  const src = req.query.src;

  if (typeof src !== "string" || src.length === 0 || src.length > 512 || !isAllowedSrc(src)) {
    res.status(400).json({ success: false, message: "Invalid image source" });
    return;
  }

  const filePath = cacheFilePath(src);

  if (isCached(src)) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Content-Type", "image/jpeg");
    createReadStream(filePath).pipe(res);
    return;
  }

  const result = await fetchAndCacheImage(src);
  if (!result) {
    logger.warn(`Image proxy upstream failed for ${src.slice(0, 80)}...`);
    res.status(502).json({ success: false, message: "Failed to fetch image" });
    return;
  }

  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.setHeader("Content-Type", result.contentType);
  res.end(result.buffer);
});

export default router;