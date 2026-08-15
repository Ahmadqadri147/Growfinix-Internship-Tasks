export type Availability = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export type SortKey =
  | "newest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "rating_desc"
  | "popular"
  | "best_selling"
  | "alphabetical"
  | "featured"
  | "discount";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  description?: string | null;
  _count?: { products: number };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  _count?: { products: number };
}

export interface ShippingInfo {
  free?: boolean;
  standard?: { cost: number; days: number };
  express?: { cost: number; days: number };
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  description: string;
  brandId: string;
  brand: Brand;
  categoryId: string;
  category: Category;
  subCategory: string;
  price: number;
  discount: number;
  rating: number;
  reviewCount: number;
  stock: number;
  images: string[];
  createdAt: string;
  popularity: number;
  tags: string[];
  featured: boolean;
  availability: Availability;
  location?: string | null;
  seller?: string | null;
  color: string[];
  sizes: string[];
  shipping?: ShippingInfo | null;
  viewCount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  avatar?: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  helpful: number;
  createdAt: string;
  user: { id: string; name: string; avatar?: string | null };
}

export interface ReviewBreakdown {
  average: number;
  total: number;
  breakdown: { stars: number; count: number; percent: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ProductsResult {
  products: Product[];
  meta: PaginationMeta;
}

export interface Facets {
  priceRange: { min: number; max: number };
  categories: Category[];
  brands: Brand[];
  colors: string[];
  sizes: string[];
  locations: (string | null)[];
  sellers: (string | null)[];
  tags: string[];
}

export interface Suggestions {
  products: { id: string; title: string; price: number; images: string[]; brand: { name: string } }[];
  categories: Category[];
  brands: Brand[];
}

export interface HomeData {
  featured: Product[];
  trending: Product[];
  newArrivals: Product[];
  bestDeals: Product[];
  categories: Category[];
}

export interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: Product;
  }[];
}

export interface SearchEntry {
  id: string;
  query: string;
  resultsCount: number;
  createdAt: string;
}

export interface ProductQueryParams {
  q?: string;
  page?: number;
  limit?: number;
  sort?: SortKey;
  category?: string[];
  brand?: string[];
  subCategory?: string[];
  color?: string[];
  size?: string[];
  location?: string[];
  seller?: string[];
  tag?: string[];
  availability?: Availability[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  minDiscount?: number;
  featured?: boolean;
  dateFrom?: string;
  dateTo?: string;
}
