import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";

export async function getAllBrands() {
  return prisma.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" }
  });
}

export async function getBrandBySlug(slug: string) {
  const brand = await prisma.brand.findUnique({ where: { slug } });
  if (!brand) throw ApiError.notFound("Brand not found");
  return brand;
}
