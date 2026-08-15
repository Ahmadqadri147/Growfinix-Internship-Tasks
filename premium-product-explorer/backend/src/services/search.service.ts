import { prisma } from "../utils/prisma";

export async function recordSearch(query: string, resultsCount: number, userId?: string) {
  const q = String(query ?? "").trim();
  if (!q || q.length < 2) return;
  await prisma.searchHistory.create({
    data: { query: q, resultsCount, userId }
  });
}

export async function getTrendingSearches(days = 7, limit = 10) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const entries = await prisma.searchHistory.findMany({
    where: { createdAt: { gte: since } },
    select: { query: true }
  });

  const counts = new Map<string, { count: number; results: number }>();
  for (const e of entries) {
    const key = e.query.toLowerCase();
    const cur = counts.get(key) ?? { count: 0, results: 0 };
    counts.set(key, { count: cur.count + 1, results: cur.results + 1 });
  }

  return [...counts.entries()]
    .map(([query, stats]) => ({ query, count: stats.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getRecentSearches(userId?: string, limit = 10) {
  const where = userId ? { userId } : { userId: null };
  const entries = await prisma.searchHistory.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, query: true, resultsCount: true, createdAt: true }
  });
  const seen = new Set<string>();
  return entries.filter((e) => {
    const key = e.query.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function clearSearchHistory(userId?: string) {
  const where = userId ? { userId } : { userId: null };
  await prisma.searchHistory.deleteMany({ where });
  return { cleared: true };
}
