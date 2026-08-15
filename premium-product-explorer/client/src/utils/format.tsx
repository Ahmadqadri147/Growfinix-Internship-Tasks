import type { ReactNode } from "react";
import type { ProductQueryParams } from "@/types";

export function buildQueryString(params: ProductQueryParams): string {
  const search = new URLSearchParams();
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.page && params.page > 1) search.set("page", String(params.page));
  if (params.limit && params.limit !== 12) search.set("limit", String(params.limit));
  if (params.sort && params.sort !== "newest") search.set("sort", params.sort);
  if (params.featured !== undefined) search.set("featured", String(params.featured));
  if (params.minPrice !== undefined) search.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) search.set("maxPrice", String(params.maxPrice));
  if (params.minRating !== undefined) search.set("minRating", String(params.minRating));
  if (params.minDiscount !== undefined) search.set("minDiscount", String(params.minDiscount));
  if (params.dateFrom) search.set("dateFrom", params.dateFrom);
  if (params.dateTo) search.set("dateTo", params.dateTo);
  for (const key of [
    "category",
    "brand",
    "subCategory",
    "color",
    "size",
    "location",
    "seller",
    "tag",
    "availability"
  ] as const) {
    const values = params[key];
    if (values && values.length) search.set(key, values.join(","));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function highlightMatch(text: string, query: string): ReactNode[] {
  if (!query.trim()) return [text];
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "ig"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="rounded-sm bg-indigo-500/20 px-0.5 text-indigo-600">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
