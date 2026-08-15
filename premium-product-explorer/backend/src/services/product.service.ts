import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import { MongoQueryBuilder, executePagedQuery } from "../utils/queryBuilder";
import { ProductQueryInput } from "../validators/product.validator";
import { parseList } from "../utils/queryBuilder";
import { getOrSet, cacheKey, clearCache } from "../utils/cache";

const PRODUCT_INCLUDE = {
  brand: true,
  category: true
} satisfies Prisma.ProductInclude;

export async function getProducts(query: ProductQueryInput) {
  const builder = new MongoQueryBuilder(query);
  await builder.search(query.q);
  await builder.filter(query as Record<string, unknown>);
  builder.sort(query.sort);
  const result = await executePagedQuery(prisma, builder);
  return { products: result.data, meta: result.meta };
}

export async function getProductById(id: string, incrementViews = true) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { ...PRODUCT_INCLUDE, reviews: { orderBy: { createdAt: "desc" }, take: 5 } }
  });
  if (!product) throw ApiError.notFound("Product not found");
  if (incrementViews) {
    void prisma.product.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => undefined);
  }
  return product;
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 8) {
  return prisma.product.findMany({
    where: {
      id: { not: productId },
      categoryId
    },
    include: PRODUCT_INCLUDE,
    orderBy: [{ popularity: "desc" }, { rating: "desc" }],
    take: limit
  });
}

export async function getSuggestions(q: string, limit = 8) {
  const keyword = String(q ?? "").trim();
  if (keyword.length < 2) return { products: [], categories: [], brands: [] };
  return getOrSet(
    cacheKey("suggestions", keyword.toLowerCase(), limit),
    45_000,
    async () => {
      const [products, categories, brands] = await Promise.all([
        prisma.product.findMany({
          where: { title: { contains: keyword, mode: "insensitive" } },
          select: { id: true, title: true, price: true, images: true, brand: { select: { name: true } } },
          take: limit
        }),
        prisma.category.findMany({
          where: { name: { contains: keyword, mode: "insensitive" } },
          take: 5
        }),
        prisma.brand.findMany({
          where: { name: { contains: keyword, mode: "insensitive" } },
          take: 5
        })
      ]);

      return { products, categories, brands };
    }
  );
}

export async function getFeaturedProducts(limit = 8) {
  return getOrSet(
    cacheKey("landing", "featured", limit),
    60_000,
    async () =>
      prisma.product.findMany({
        where: { featured: true },
        include: PRODUCT_INCLUDE,
        orderBy: [{ popularity: "desc" }, { rating: "desc" }],
        take: limit
      })
  );
}

export async function getTrendingProducts(limit = 8) {
  return getOrSet(
    cacheKey("landing", "trending", limit),
    60_000,
    async () =>
      prisma.product.findMany({
        where: { availability: "IN_STOCK" },
        include: PRODUCT_INCLUDE,
        orderBy: { popularity: "desc" },
        take: limit
      })
  );
}

export async function getNewArrivals(limit = 8) {
  return getOrSet(
    cacheKey("landing", "new-arrivals", limit),
    60_000,
    async () =>
      prisma.product.findMany({
        include: PRODUCT_INCLUDE,
        orderBy: { createdAt: "desc" },
        take: limit
      })
  );
}

export async function getBestDeals(limit = 8) {
  return getOrSet(
    cacheKey("landing", "best-deals", limit),
    60_000,
    async () =>
      prisma.product.findMany({
        where: { discount: { gte: 40 }, availability: "IN_STOCK" },
        include: PRODUCT_INCLUDE,
        orderBy: { discount: "desc" },
        take: limit
      })
  );
}

export interface HomeData {
  featured: Awaited<ReturnType<typeof getFeaturedProducts>>;
  trending: Awaited<ReturnType<typeof getTrendingProducts>>;
  newArrivals: Awaited<ReturnType<typeof getNewArrivals>>;
  bestDeals: Awaited<ReturnType<typeof getBestDeals>>;
  categories: Awaited<ReturnType<typeof getAllCategories>>;
}

async function getAllCategories() {
  return prisma.category.findMany({ include: { _count: { select: { products: true } } } });
}

export async function getHomeData(): Promise<HomeData> {
  return getOrSet<HomeData>("home-data", 60_000, async () => {
    const [featured, trending, newArrivals, bestDeals, categories] = await Promise.all([
      getFeaturedProducts(8),
      getTrendingProducts(8),
      getNewArrivals(8),
      getBestDeals(8),
      getAllCategories()
    ]);
    return { featured, trending, newArrivals, bestDeals, categories };
  });
}

async function distinctArrayValues(field: string, limit: number): Promise<string[]> {
  try {
    const res = (await (prisma as any).$runCommandRaw({
      aggregate: "Product",
      pipeline: [
        { $match: { [field]: { $exists: true, $ne: null } } },
        { $unwind: `$${field}` },
        { $group: { _id: `$${field}` } },
        { $limit: limit }
      ],
      cursor: {}
    })) as { cursor?: { firstBatch?: { _id: unknown }[] } };
    return (res.cursor?.firstBatch ?? []).map((d) => String(d._id)).filter(Boolean);
  } catch {
    return [];
  }
}

async function getFacetsUncached() {
  const [minMaxPrice, categories, brands, colors, sizes, locations, sellers, tags] = await Promise.all([
    prisma.product.aggregate({ _min: { price: true }, _max: { price: true } }),
    prisma.category.findMany({ include: { _count: { select: { products: true } } } }),
    prisma.brand.findMany({ include: { _count: { select: { products: true } } } }),
    distinctArrayValues("color", 30),
    distinctArrayValues("sizes", 40),
    prisma.product.findMany({ distinct: ["location"], select: { location: true } }),
    prisma.product.findMany({ distinct: ["seller"], select: { seller: true } }),
    distinctArrayValues("tags", 50)
  ]);

  return {
    priceRange: { min: minMaxPrice._min.price ?? 0, max: minMaxPrice._max.price ?? 1000 },
    categories,
    brands,
    colors,
    sizes,
    locations: locations.map((l) => l.location).filter(Boolean).slice(0, 40),
    sellers: sellers.map((s) => s.seller).filter(Boolean).slice(0, 40),
    tags
  };
}

export function getFilterFacets() {
  return getOrSet("facets", 10 * 60_000, getFacetsUncached);
}

function invalidateCatalogCache() {
  clearCache("landing:");
  clearCache("home-data");
  clearCache("facets");
  clearCache("suggestions:");
}

export async function createProduct(data: Prisma.ProductUncheckedCreateInput) {
  const sku = data.sku?.trim() ? data.sku : `SKU-${randomUUID().slice(0, 8).toUpperCase()}`;
  const product = await prisma.product.create({ data: { ...data, sku }, include: PRODUCT_INCLUDE });
  invalidateCatalogCache();
  return product;
}

export async function updateProduct(id: string, data: Prisma.ProductUncheckedUpdateInput) {
  await getProductById(id, false);
  const product = await prisma.product.update({ where: { id }, data, include: PRODUCT_INCLUDE });
  invalidateCatalogCache();
  return product;
}

export async function deleteProduct(id: string) {
  await getProductById(id, false);
  await prisma.product.delete({ where: { id } });
  invalidateCatalogCache();
}

export { parseList };
