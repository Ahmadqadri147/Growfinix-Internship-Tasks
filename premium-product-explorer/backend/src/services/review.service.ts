import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";

export interface ReviewInput {
  rating: number;
  title?: string;
  comment: string;
}

export async function getProductReviews(productId: string, page = 1, limit = 10, sort = "newest") {
  const orderByMap = {
    newest: { createdAt: "desc" as const },
    oldest: { createdAt: "asc" as const },
    helpful: { helpful: "desc" as const },
    highest: { rating: "desc" as const },
    lowest: { rating: "asc" as const }
  };

  const where = { productId };
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: [orderByMap[sort as keyof typeof orderByMap] ?? orderByMap.newest],
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.review.count({ where })
  ]);

  return {
    reviews,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
}

export async function createReview(userId: string, productId: string, input: ReviewInput) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw ApiError.notFound("Product not found");

  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId, productId } }
  });
  if (existing) throw ApiError.conflict("You have already reviewed this product");

  const review = await prisma.review.create({
    data: { ...input, userId, productId },
    include: { user: { select: { id: true, name: true, avatar: true } } }
  });

  await refreshProductRating(productId);
  return review;
}

export async function deleteReview(userId: string, reviewId: string, role: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw ApiError.notFound("Review not found");
  if (review.userId !== userId && role !== "ADMIN") {
    throw ApiError.forbidden("You can only delete your own reviews");
  }
  await prisma.review.delete({ where: { id: reviewId } });
  await refreshProductRating(review.productId);
}

export async function markHelpful(_userId: string, reviewId: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw ApiError.notFound("Review not found");
  return prisma.review.update({
    where: { id: reviewId },
    data: { helpful: { increment: 1 } }
  });
}

export async function getRatingBreakdown(productId: string) {
  const reviews = await prisma.review.findMany({ where: { productId }, select: { rating: true } });
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>;
  for (const r of reviews) {
    if (breakdown[r.rating] !== undefined) breakdown[r.rating] += 1;
  }
  const total = reviews.length || 1;
  return {
    average: reviews.reduce((s, r) => s + r.rating, 0) / total,
    total: reviews.length,
    breakdown: Object.entries(breakdown).map(([stars, count]) => ({
      stars: Number(stars),
      count,
      percent: Math.round((count / total) * 100)
    }))
  };
}

async function refreshProductRating(productId: string) {
  const result = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { id: true }
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: Math.round((result._avg.rating ?? 0) * 10) / 10,
      reviewCount: result._count.id
    }
  });
}
