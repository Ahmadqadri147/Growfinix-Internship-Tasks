import { prisma } from "../utils/prisma";

export async function getDashboardStats() {
  const [products, categories, brands, users, orders, reviews, wishlists] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.brand.count(),
    prisma.user.count(),
    prisma.order.count(),
    prisma.review.count(),
    prisma.wishlistItem.count()
  ]);

  const revenueAgg = await prisma.order.aggregate({
    _sum: { total: true },
    _avg: { total: true }
  });

  const stockAgg = await prisma.product.aggregate({
    _sum: { stock: true },
    _avg: { price: true },
    _max: { price: true },
    _min: { price: true }
  });

  return {
    counts: { products, categories, brands, users, orders, reviews, wishlists },
    revenue: {
      total: Math.round((revenueAgg._sum.total ?? 0) * 100) / 100,
      average: Math.round((revenueAgg._avg.total ?? 0) * 100) / 100
    },
    inventory: {
      totalStock: stockAgg._sum.stock ?? 0,
      avgPrice: Math.round((stockAgg._avg.price ?? 0) * 100) / 100,
      maxPrice: stockAgg._max.price ?? 0,
      minPrice: stockAgg._min.price ?? 0
    }
  };
}

export async function getTopSearches(days = 30, limit = 10) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const entries = await prisma.searchHistory.findMany({
    where: { createdAt: { gte: since } },
    select: { query: true, resultsCount: true }
  });
  const map = new Map<string, { count: number; results: number }>();
  for (const e of entries) {
    const key = e.query.toLowerCase();
    const cur = map.get(key) ?? { count: 0, results: 0 };
    map.set(key, { count: cur.count + 1, results: cur.results + e.resultsCount });
  }
  return [...map.entries()]
    .map(([query, s]) => ({ query, count: s.count, avgResults: Math.round(s.results / s.count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getSearchVolume(days = 14) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const entries = await prisma.searchHistory.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true }
  });
  const byDay = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }
  for (const e of entries) {
    const key = e.createdAt.toISOString().slice(0, 10);
    if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }
  return [...byDay.entries()].map(([date, searches]) => ({ date, searches }));
}

export async function getMostViewedProducts(limit = 10) {
  return prisma.product.findMany({
    select: {
      id: true,
      title: true,
      images: true,
      price: true,
      rating: true,
      viewCount: true,
      popularity: true,
      category: { select: { name: true } }
    },
    orderBy: { viewCount: "desc" },
    take: limit
  });
}

export async function getRecentActivity(limit = 12) {
  const [orders, users, searches] = await Promise.all([
    prisma.order.findMany({
      include: { user: { select: { name: true, email: true } }, items: { take: 1 } },
      orderBy: { createdAt: "desc" },
      take: limit
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    }),
    prisma.searchHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, query: true, createdAt: true }
    })
  ]);

  const activities: { type: string; text: string; date: Date; meta?: Record<string, unknown> }[] = [];
  orders.forEach((o) =>
    activities.push({
      type: "ORDER",
      text: `Order placed - $${o.total.toFixed(2)}`,
      date: o.createdAt,
      meta: { user: o.user.name, status: o.status, orderId: o.id }
    })
  );
  users.forEach((u) =>
    activities.push({ type: "USER", text: `New ${u.role.toLowerCase()} registered`, date: u.createdAt, meta: { user: u.name, email: u.email } })
  );
  searches.forEach((s) =>
    activities.push({ type: "SEARCH", text: `Search: "${s.query}"`, date: s.createdAt, meta: { id: s.id } })
  );

  return activities
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}

export async function getCategoryDistribution() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" }
  });
  return categories
    .map((c) => ({ name: c.name, products: c._count.products }))
    .filter((c) => c.products > 0)
    .sort((a, b) => b.products - a.products)
    .slice(0, 12);
}

export async function getRevenueByDay(days = 14) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: since } },
    select: { total: true, createdAt: true }
  });
  const byDay = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + o.total);
  }
  return [...byDay.entries()].map(([date, revenue]) => ({ date, revenue: Math.round(revenue * 100) / 100 }));
}
