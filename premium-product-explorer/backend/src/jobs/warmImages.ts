import { prisma } from "../utils/prisma";
import { logger } from "../config/logger";
import { fetchAndCacheImage, isCached, IMAGE_CACHE_DIR } from "../utils/imageCache";

const CONCURRENCY = 10;

export async function warmImageCache(): Promise<void> {
  try {
    const [popular, featured, newest, categories, perCategory] = await Promise.all([
      prisma.product.findMany({ orderBy: { popularity: "desc" }, take: 48, select: { images: true } }),
      prisma.product.findMany({ where: { featured: true }, take: 48, select: { images: true } }),
      prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 48, select: { images: true } }),
      prisma.category.findMany({ select: { image: true } }),
      prisma.product.findMany({ distinct: ["categoryId"], take: 50, select: { categoryId: true } })
    ]);

    const categoryIds = perCategory.map((g) => g.categoryId);
    const topPerCategory =
      categoryIds.length > 0
        ? await prisma.product.findMany({
            where: { categoryId: { in: categoryIds } },
            orderBy: { popularity: "desc" },
            take: 12 * categoryIds.length,
            select: { images: true }
          })
        : [];

    const urls = [
      ...popular.flatMap((p) => p.images),
      ...featured.flatMap((p) => p.images),
      ...newest.flatMap((p) => p.images),
      ...topPerCategory.flatMap((p) => p.images),
      ...categories.map((c) => c.image)
    ].filter((u): u is string => typeof u === "string" && u.includes("loremflickr.com"));

    const unique = [...new Set(urls)];
    const pending = unique.filter((u) => !isCached(u));

    if (pending.length === 0) {
      logger.info(`Image cache already warm (${unique.length} unique images)`);
      return;
    }

    logger.info(`Warming image cache: ${pending.length}/${unique.length} images to fetch...`);

    let index = 0;
    let done = 0;
    let failed = 0;
    const worker = async (): Promise<void> => {
      while (index < pending.length) {
        const url = pending[index++];
        const result = await fetchAndCacheImage(url);
        if (result === null) failed += 1;
        done += 1;
        if (done % 50 === 0 || done === pending.length) {
          logger.info(`Image warm progress: ${done}/${pending.length}${failed > 0 ? ` (${failed} failed)` : ""}`);
        }
      }
    };

    await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
    logger.info(
      `Image cache warmed: ${pending.length - failed}/${pending.length} images (dir: ${IMAGE_CACHE_DIR})`
    );
  } catch (err) {
    logger.warn("Image warm-up failed", err instanceof Error ? err.message : err);
  }
}