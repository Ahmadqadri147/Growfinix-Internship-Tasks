import { z } from "zod";

export const productQuerySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(48).optional(),
  sort: z
    .enum([
      "newest",
      "oldest",
      "price_asc",
      "price_desc",
      "rating_desc",
      "popular",
      "best_selling",
      "alphabetical",
      "featured",
      "discount"
    ])
    .optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  subCategory: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  location: z.string().optional(),
  seller: z.string().optional(),
  tag: z.string().optional(),
  availability: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  minDiscount: z.coerce.number().min(0).max(100).optional(),
  featured: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true" || v === "1")),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional()
});

export const productIdSchema = z.object({
  id: z.string().min(1)
});

export const createProductSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  sku: z.string().min(3).max(50).optional(),
  brandId: z.string().min(1),
  categoryId: z.string().min(1),
  subCategory: z.string().min(1),
  price: z.number().positive(),
  discount: z.number().int().min(0).max(95).default(0),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.string().url()).min(1),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  location: z.string().optional(),
  seller: z.string().optional(),
  color: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  shipping: z.record(z.unknown()).optional()
});

export const updateProductSchema = createProductSchema.partial();

export type ProductQueryInput = z.infer<typeof productQuerySchema>;
