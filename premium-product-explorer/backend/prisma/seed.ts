import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  CATEGORIES,
  BRANDS,
  SELLERS,
  LOCATIONS,
  COLORS,
  TAG_POOL,
  REVIEW_COMMENTS,
  REVIEW_TITLES,
  SEARCH_POOL,
  CategoryDef
} from "./data";

const prisma = new PrismaClient();

const PRODUCTS_ONLY = process.argv.includes("--products-only");

const TOTAL_PRODUCTS = Number(process.env.SEED_PRODUCTS ?? 50000);
const BATCH_SIZE = 1000;
const REVIEW_PRODUCTS = 600;
const ORDERS_COUNT = 60;
const SEARCH_COUNT = 500;
const WISHLIST_COUNT = 15;

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260731);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickMany<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, Math.max(1, count));
}

function randomInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  const v = rand() * (max - min) + min;
  return Math.round(v * 10 ** decimals) / 10 ** decimals;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + rand() * (end.getTime() - start.getTime()));
}

function availabilityFor(stock: number): string {
  if (stock === 0) return "OUT_OF_STOCK";
  if (stock < 20) return "LOW_STOCK";
  return "IN_STOCK";
}

function productImage(sku: string, index: number, keyword: string): string {
  const tags = keyword
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ",")
    .replace(/^,|,$/g, "");
  const lock = ([...sku].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7) + index * 137) >>> 0;
  return `https://loremflickr.com/800/800/${tags}?lock=${lock}`;
}

function makeProduct(
  index: number,
  category: CategoryDef,
  brand: (typeof BRANDS)[number],
  categoryId: string,
  brandId: string
): Prisma.ProductUncheckedCreateInput {
  const sku = `SKU-${category.slug.slice(0, 4).toUpperCase()}-${String(index).padStart(6, "0")}`;
  const noun = pick(category.nouns);
  const attr = pick(category.attrs);
  const model = randomInt(100, 9999);
  const series = String.fromCharCode(65 + randomInt(0, 25));
  const title = `${brand.name} ${noun} ${attr} ${series}${model}`;
  const price = randomFloat(category.priceRange[0], category.priceRange[1]);
  const discount = rand() < 0.55 ? randomInt(5, 60) : 0;
  const stock = rand() < 0.08 ? 0 : randomInt(3, 500);
  const imageCount = randomInt(3, 4);
  const colorCount = randomInt(1, 3);
  const sizeList = category.sizes ? pickMany(category.sizes, randomInt(1, 4)) : [];

  return {
    sku,
    title,
    description: `The ${title} combines premium craftsmanship with cutting-edge ${category.subCategories[0].toLowerCase()} design. Built with durable, high-quality materials, it delivers reliable performance for everyday use. Perfect for anyone who values both style and substance. Backed by a full manufacturer warranty and available with fast express shipping.`,
    brandId,
    categoryId,
    subCategory: pick(category.subCategories),
    price,
    discount,
    rating: randomFloat(3, 5, 1),
    reviewCount: randomInt(0, 800),
    stock,
    images: Array.from({ length: imageCount }, (_, i) => productImage(sku, i + 1, noun)),
    createdAt: randomDate(new Date("2024-01-01"), new Date("2026-07-31")),
    popularity: randomInt(0, 100000),
    tags: pickMany(TAG_POOL, randomInt(3, 5)),
    featured: rand() < 0.08,
    availability: availabilityFor(stock),
    location: pick(LOCATIONS),
    seller: pick(SELLERS),
    color: pickMany(COLORS, colorCount),
    sizes: sizeList,
    shipping: {
      free: rand() < 0.4,
      standard: { cost: randomInt(2, 15), days: randomInt(3, 8) },
      express: { cost: randomInt(10, 35), days: randomInt(1, 2) }
    }
  };
}

async function main(): Promise<void> {
  const startedAt = Date.now();
  console.log(`${PRODUCTS_ONLY ? "Seeding products only" : `Seeding ${TOTAL_PRODUCTS.toLocaleString()} products`}...\n`);

  console.log("[1/7] Clearing existing data...");
  // Native deleteMany (empty filter = all docs). Keeps indexes created by
  // `prisma db push` and avoids Prisma's relation-integrity $lookup scan,
  // which stalls transactions on 50k documents.
  const modelsToClear = PRODUCTS_ONLY
    ? ["Product"]
    : ["OrderItem", "Order", "WishlistItem", "Review", "SearchHistory", "Product", "Category", "Brand", "User"];
  for (const coll of modelsToClear) {
    await (prisma as any).$runCommandRaw({ delete: coll, deletes: [{ q: {}, limit: 0 }] }).catch(() => undefined);
  }
  console.log("   Collections cleared.");

  if (PRODUCTS_ONLY) {
    console.log("[2/3] Ensuring categories & brands exist...");
    const categoryCount = await prisma.category.count();
    const brandCount = await prisma.brand.count();
    const categoryRecords = categoryCount > 0 ? await prisma.category.findMany() : [];
    const brandRecords = brandCount > 0 ? await prisma.brand.findMany() : [];
    for (const c of CATEGORIES) {
      if (!categoryRecords.some((r) => r.slug === c.slug)) {
        categoryRecords.push(
          await prisma.category.create({
            data: { name: c.name, slug: c.slug, description: c.description, image: c.image }
          })
        );
      }
    }
    for (const b of BRANDS) {
      if (!brandRecords.some((r) => r.slug === b.slug)) {
        brandRecords.push(
          await prisma.brand.create({
            data: { name: b.name, slug: b.slug, description: b.tagline }
          })
        );
      }
    }

    console.log(`[3/3] Creating ${TOTAL_PRODUCTS.toLocaleString()} products...`);
    let productIds: string[] = [];
    const batches = Math.ceil(TOTAL_PRODUCTS / BATCH_SIZE);
    for (let b = 0; b < batches; b++) {
      const batchData: Prisma.ProductUncheckedCreateInput[] = [];
      for (let i = 0; i < BATCH_SIZE; i++) {
        const idx = b * BATCH_SIZE + i;
        if (idx >= TOTAL_PRODUCTS) break;
        const category = CATEGORIES[idx % CATEGORIES.length];
        const brand = BRANDS[idx % BRANDS.length];
        batchData.push(
          makeProduct(
            idx,
            category,
            brand,
            categoryRecords[idx % categoryRecords.length].id,
            brandRecords[idx % brandRecords.length].id
          )
        );
      }
      const result = await prisma.product.createMany({ data: batchData });
      if ((b + 1) % 10 === 0 || b === batches - 1) {
        console.log(`   batch ${b + 1}/${batches} (${result.count.toLocaleString()} inserted)`);
      }
    }

    const products = await prisma.product.findMany({ select: { id: true } });
    productIds = products.map((p) => p.id);
    console.log(`   verified ${productIds.length.toLocaleString()} products in DB`);

    console.log("Done!");
    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log(`\nSeed completed in ${elapsed}s`);
    console.log(`- Products: ${productIds.length.toLocaleString()}`);
    return;
  }

  console.log("[2/7] Creating users...");
  const adminHash = await bcrypt.hash("Admin@123", 10);
  const userHash = await bcrypt.hash("User@123", 10);
  const admin = await prisma.user.create({
    data: { name: "Admin", email: "admin@example.com", password: adminHash, role: "ADMIN" }
  });
  const demoUser = await prisma.user.create({
    data: { name: "Demo User", email: "user@example.com", password: userHash, role: "USER" }
  });
  const reviewers: { id: string }[] = [demoUser];
  for (let i = 1; i <= 12; i++) {
    const u = await prisma.user.create({
      data: {
        name: pick([
          "Alice Johnson", "Brian Miller", "Carla Gomez", "David Chen", "Emma Wilson",
          "Frank Alvarez", "Grace Lee", "Hannah Patel", "Ian Cooper", "Julia Roberts",
          "Kevin Nguyen", "Laura Martinez"
        ]),
        email: `reviewer${i}@example.com`,
        password: userHash
      }
    });
    reviewers.push(u);
  }

  console.log("[3/7] Creating categories & brands...");
  const categoryRecords = [];
  for (const c of CATEGORIES) {
    categoryRecords.push(
      await prisma.category.create({
        data: { name: c.name, slug: c.slug, description: c.description, image: c.image }
      })
    );
  }
  const brandRecords = [];
  for (const b of BRANDS) {
    brandRecords.push(
      await prisma.brand.create({
        data: { name: b.name, slug: b.slug, description: b.tagline }
      })
    );
  }

  console.log(`[4/7] Creating ${TOTAL_PRODUCTS.toLocaleString()} products...`);
  let productIds: string[] = [];
  const batches = Math.ceil(TOTAL_PRODUCTS / BATCH_SIZE);
  for (let b = 0; b < batches; b++) {
    const batchData: Prisma.ProductUncheckedCreateInput[] = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      const idx = b * BATCH_SIZE + i;
      if (idx >= TOTAL_PRODUCTS) break;
      const category = CATEGORIES[idx % CATEGORIES.length];
      const brand = BRANDS[idx % BRANDS.length];
      batchData.push(
        makeProduct(idx, category, brand, categoryRecords[idx % CATEGORIES.length].id, brandRecords[idx % BRANDS.length].id)
      );
    }
    const result = await prisma.product.createMany({ data: batchData });
    if ((b + 1) % 10 === 0 || b === batches - 1) {
      console.log(`   batch ${b + 1}/${batches} (${result.count.toLocaleString()} inserted)`);
    }
  }

  const products = await prisma.product.findMany({
    select: { id: true, title: true, brand: { select: { name: true } }, category: { select: { name: true } } },
    take: TOTAL_PRODUCTS
  });
  productIds = products.map((p) => p.id);
  const productTitleById = new Map(products.map((p) => [p.id, p.title]));
  console.log(`   verified ${productIds.length.toLocaleString()} products in DB`);

  console.log(`[5/7] Creating reviews for ${REVIEW_PRODUCTS} products...`);
  const reviewProducts = pickMany(productIds, REVIEW_PRODUCTS);
  let reviewCount = 0;
  let productToUpdate: { productId: string; rating: number; count: number }[] = [];
  for (const productId of reviewProducts) {
    const n = randomInt(2, 8);
    const reviewersPick = pickMany(reviewers.slice(1), n);
    const ratings: number[] = [];
    for (const reviewer of reviewersPick) {
      const rating = randomInt(1, 5);
      ratings.push(rating);
      await prisma.review.create({
        data: {
          rating,
          title: pick(REVIEW_TITLES),
          comment: pick(REVIEW_COMMENTS).replace("{product}", productTitleById.get(productId) ?? "product"),
          helpful: randomInt(0, 40),
          userId: reviewer.id,
          productId,
          createdAt: randomDate(new Date("2025-01-01"), new Date())
        }
      });
      reviewCount++;
    }
    productToUpdate.push({
      productId,
      rating: Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10,
      count: ratings.length
    });
  }
  for (const u of productToUpdate) {
    await prisma.product.update({ where: { id: u.productId }, data: { rating: u.rating, reviewCount: u.count } });
  }
  console.log(`   ${reviewCount.toLocaleString()} reviews created`);

  console.log(`[6/7] Creating orders, search history & wishlist...`);
  const orderProducts = productIds;
  for (let i = 0; i < ORDERS_COUNT; i++) {
    const items: { productId: string; quantity: number }[] = [];
    const itemCount = randomInt(1, 4);
    let total = 0;
    const orderItems: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] = [];
    for (let j = 0; j < itemCount; j++) {
      const productId = pick(orderProducts);
      const qty = randomInt(1, 3);
      const price = randomFloat(20, 800);
      total += price * qty;
      orderItems.push({ productId, quantity: qty, price });
      items.push({ productId, quantity: qty });
    }
    const user = rand() < 0.4 ? demoUser : pick(reviewers);
    // Split into two steps to avoid nested writes (no replica set needed)
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total: Math.round(total * 100) / 100,
        status: pick(["PENDING", "PENDING", "SHIPPED", "DELIVERED", "DELIVERED", "CANCELLED"]),
        createdAt: randomDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), new Date())
      }
    });
    await prisma.orderItem.createMany({
      data: orderItems.map(item => ({ ...item, orderId: order.id }))
    });
  }

  const weightedPool: string[] = [];
  for (let i = 0; i < SEARCH_COUNT; i++) {
    weightedPool.push(pick(SEARCH_POOL));
  }
  for (const query of weightedPool) {
    await prisma.searchHistory.create({
      data: {
        query,
        resultsCount: randomInt(0, 2500),
        userId: rand() < 0.2 ? demoUser.id : null,
        createdAt: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
      }
    });
  }

  for (let i = 0; i < WISHLIST_COUNT; i++) {
    const productId = pick(productIds);
    const exists = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: demoUser.id, productId } }
    });
    if (!exists) {
      await prisma.wishlistItem.create({ data: { userId: demoUser.id, productId } });
    }
  }

  console.log("[7/7] Done!");
  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(`\nSeed completed in ${elapsed}s`);
  console.log(`- Users: ${reviewers.length + 1}`);
  console.log(`- Categories: ${categoryRecords.length}`);
  console.log(`- Brands: ${brandRecords.length}`);
  console.log(`- Products: ${productIds.length.toLocaleString()}`);
  console.log(`- Reviews: ${reviewCount.toLocaleString()}`);
  console.log(`- Orders: ${ORDERS_COUNT}`);
  console.log(`- Search history entries: ${SEARCH_COUNT}`);
  console.log(`\nDemo credentials:`);
  console.log(`  Admin: admin@example.com / Admin@123`);
  console.log(`  User:  user@example.com / User@123`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
