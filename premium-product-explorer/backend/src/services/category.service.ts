import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";

export async function getAllCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" }
  });
}

export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) throw ApiError.notFound("Category not found");
  return category;
}
