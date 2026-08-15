import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";

export async function getWishlist(userId: string, page = 1, limit = 12) {
  const where = { userId };
  const [items, total] = await Promise.all([
    prisma.wishlistItem.findMany({
      where,
      include: { product: { include: { brand: true, category: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.wishlistItem.count({ where })
  ]);

  return {
    items: items.map((i) => i.product),
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

export async function addToWishlist(userId: string, productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw ApiError.notFound("Product not found");

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } }
  });
  if (existing) return { added: false, product };

  await prisma.wishlistItem.create({ data: { userId, productId } });
  return { added: true, product };
}

export async function removeFromWishlist(userId: string, productId: string) {
  await prisma.wishlistItem.deleteMany({ where: { userId, productId } });
  return { removed: true };
}

export async function isWishlisted(userId: string, productId: string) {
  const item = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } }
  });
  return Boolean(item);
}

export async function getWishlistIds(userId: string, productIds: string[]) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId, productId: { in: productIds } },
    select: { productId: true }
  });
  return new Set(items.map((i) => i.productId));
}
