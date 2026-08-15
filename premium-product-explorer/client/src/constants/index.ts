import type { SortKey, Availability } from "@/types";

export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating_desc", label: "Highest Rated" },
  { value: "popular", label: "Most Popular" },
  { value: "best_selling", label: "Best Selling" },
  { value: "alphabetical", label: "Alphabetical (A-Z)" },
  { value: "featured", label: "Featured" },
  { value: "discount", label: "Biggest Discounts" }
];

export const PAGE_SIZES = [12, 24, 36, 48];

export const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: "IN_STOCK", label: "In Stock" },
  { value: "LOW_STOCK", label: "Low Stock" },
  { value: "OUT_OF_STOCK", label: "Out of Stock" }
];

export const RATING_OPTIONS = [
  { value: 4, label: "4 stars & up" },
  { value: 3, label: "3 stars & up" },
  { value: 2, label: "2 stars & up" },
  { value: 1, label: "1 star & up" }
];

export const DISCOUNT_OPTIONS = [
  { value: 10, label: "10% or more" },
  { value: 25, label: "25% or more" },
  { value: 40, label: "40% or more" },
  { value: 50, label: "50% or more" }
];

export const TRENDING_SEARCHES = [
  "wireless headphones",
  "running shoes",
  "smartwatch",
  "laptop",
  "air fryer",
  "office chair"
];

export const PLACEHOLDER_IMAGE = "https://picsum.photos/seed/placeholder/800/800";

export const CURRENCY = "USD";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2
  }).format(value);
}

export function discountedPrice(product: { price: number; discount: number }): number {
  return Math.round(product.price * (1 - product.discount / 100) * 100) / 100;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: n >= 10000 ? "compact" : "standard" }).format(n);
}

export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const units: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [30, "day"],
    [12, "month"],
    [Infinity, "year"]
  ];
  let value = seconds;
  let label = "second";
  for (const [unit, name] of units) {
    if (value < unit) {
      label = name;
      break;
    }
    value = Math.floor(value / unit);
  }
  return `${value} ${label}${value === 1 ? "" : "s"} ago`;
}

export function availabilityLabel(a: Availability): string {
  switch (a) {
    case "IN_STOCK":
      return "In Stock";
    case "LOW_STOCK":
      return "Low Stock";
    case "OUT_OF_STOCK":
      return "Out of Stock";
  }
}
