import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "./prisma";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface QueryResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
}

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;

function parseList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return String(value).toLowerCase() === "true" || String(value) === "1";
}

function parseNumber(value: unknown, fallback?: number): number | undefined {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class MongoQueryBuilder {
  private readonly where: Prisma.Enumerable<Prisma.ProductWhereInput> = {};
  private readonly orderBy: Prisma.ProductOrderByWithRelationInput[] = [];
  private readonly page: number;
  private readonly limit: number;

  constructor(params: QueryParams = {}) {
    this.page = Math.max(1, parseNumber(params.page, 1) ?? 1);
    this.limit = Math.min(MAX_LIMIT, Math.max(1, parseNumber(params.limit, DEFAULT_LIMIT) ?? DEFAULT_LIMIT));
  }

  async search(q?: unknown): Promise<this> {
    const raw = String(q ?? "").trim();
    if (!raw) return this;
    const keywords = raw.split(/\s+/).filter(Boolean);
    if (keywords.length === 0) return this;

    const keywordQueries: Prisma.ProductWhereInput[] = [];
    for (const keyword of keywords) {
      const kw = escapeRegExp(keyword);
      const ors: Prisma.ProductWhereInput[] = [
        { title: { contains: kw, mode: "insensitive" as const } },
        { description: { contains: kw, mode: "insensitive" as const } },
        { subCategory: { contains: kw, mode: "insensitive" as const } },
        { tags: { hasSome: [keyword] } }
      ];

      const [brandIds, categoryIds] = await Promise.all([
        prisma.brand.findMany({ where: { name: { contains: kw, mode: "insensitive" } }, select: { id: true } }),
        prisma.category.findMany({ where: { name: { contains: kw, mode: "insensitive" } }, select: { id: true } })
      ]);
      if (brandIds.length) ors.push({ brandId: { in: brandIds.map((b) => b.id) } });
      if (categoryIds.length) ors.push({ categoryId: { in: categoryIds.map((c) => c.id) } });

      keywordQueries.push({ OR: ors });
    }

    this.mergeWhere({ AND: keywordQueries });
    return this;
  }

  async filter(params: Record<string, unknown>): Promise<this> {
    const filters: Prisma.ProductWhereInput[] = [];

    const categories = parseList(params.category);
    if (categories.length) {
      const matches = await prisma.category.findMany({ where: { slug: { in: categories } }, select: { id: true } });
      filters.push({ categoryId: { in: matches.map((c) => c.id) } });
    }

    const brands = parseList(params.brand);
    if (brands.length) {
      const matches = await prisma.brand.findMany({ where: { slug: { in: brands } }, select: { id: true } });
      filters.push({ brandId: { in: matches.map((b) => b.id) } });
    }

    const subCategories = parseList(params.subCategory);
    if (subCategories.length) filters.push({ subCategory: { in: subCategories } });

    const colors = parseList(params.color);
    if (colors.length) filters.push({ color: { hasSome: colors } });

    const sizes = parseList(params.size);
    if (sizes.length) filters.push({ sizes: { hasSome: sizes } });

    const locations = parseList(params.location);
    if (locations.length) filters.push({ location: { in: locations } });

    const sellers = parseList(params.seller);
    if (sellers.length) filters.push({ seller: { in: sellers } });

    const tags = parseList(params.tag);
    if (tags.length) filters.push({ tags: { hasSome: tags } });

    const availability = parseList(params.availability);
    if (availability.length) filters.push({ availability: { in: availability } });

    const minPrice = parseNumber(params.minPrice);
    const maxPrice = parseNumber(params.maxPrice);
    if (minPrice !== undefined || maxPrice !== undefined) {
      const range: Record<string, number> = {};
      if (minPrice !== undefined) range.gte = minPrice;
      if (maxPrice !== undefined) range.lte = maxPrice;
      filters.push({ price: range });
    }

    const minRating = parseNumber(params.minRating);
    if (minRating !== undefined) filters.push({ rating: { gte: minRating } });

    const minDiscount = parseNumber(params.minDiscount);
    if (minDiscount !== undefined) filters.push({ discount: { gte: minDiscount } });

    const featured = parseBoolean(params.featured);
    if (featured !== undefined) filters.push({ featured });

    const fromDate = params.dateFrom ? new Date(String(params.dateFrom)) : undefined;
    const toDate = params.dateTo ? new Date(String(params.dateTo)) : undefined;
    if (fromDate && !Number.isNaN(fromDate.getTime()) && toDate && !Number.isNaN(toDate.getTime())) {
      filters.push({ createdAt: { gte: fromDate, lte: toDate } });
    }

    if (filters.length) this.mergeWhere({ AND: filters });
    return this;
  }

  sort(sort?: unknown): this {
    const map: Record<string, Prisma.ProductOrderByWithRelationInput> = {
      newest: { createdAt: "desc" },
      oldest: { createdAt: "asc" },
      price_asc: { price: "asc" },
      price_desc: { price: "desc" },
      rating_desc: { rating: "desc" },
      popular: { popularity: "desc" },
      best_selling: { popularity: "desc" },
      alphabetical: { title: "asc" },
      featured: { featured: "desc" },
      discount: { discount: "desc" }
    };
    const key = String(sort ?? "newest");
    this.orderBy.push(map[key] ?? map.newest);
    return this;
  }

  skip(): number {
    return (this.page - 1) * this.limit;
  }

  take(): number {
    return this.limit;
  }

  getWhere(): Prisma.Enumerable<Prisma.ProductWhereInput> {
    return this.where;
  }

  getOrderBy(): Prisma.ProductOrderByWithRelationInput[] {
    return this.orderBy;
  }

  buildMeta(total: number): PaginationMeta {
    return {
      page: this.page,
      limit: this.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / this.limit)),
      hasNext: this.page * this.limit < total,
      hasPrev: this.page > 1
    };
  }

  private mergeWhere(partial: Prisma.ProductWhereInput): void {
    const current = this.where as Record<string, unknown>;
    if (!current.AND) {
      current.AND = [partial];
    } else {
      (current.AND as unknown[]).push(partial);
    }
  }
}

export async function executePagedQuery(
  prismaClient: PrismaClient,
  builder: MongoQueryBuilder
): Promise<QueryResult<unknown>> {
  const [data, total] = await Promise.all([
    prismaClient.product.findMany({
      where: builder.getWhere() as Prisma.ProductWhereInput,
      orderBy: builder.getOrderBy(),
      skip: builder.skip(),
      take: builder.take(),
      include: { brand: true, category: true }
    }),
    prismaClient.product.count({ where: builder.getWhere() as Prisma.ProductWhereInput })
  ]);
  return { data, meta: builder.buildMeta(total) };
}

export { parseList, parseBoolean, parseNumber, escapeRegExp };
