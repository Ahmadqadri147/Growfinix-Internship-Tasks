import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { productService, categoryService, brandService } from "@/services/product.service";
import type { ProductQueryParams } from "@/types";

export function useProducts(params: ProductQueryParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productService.getProducts(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getProduct(id!),
    enabled: Boolean(id),
    staleTime: 60 * 1000
  });
}

export function useRelatedProducts(id: string | undefined, categoryId: string | undefined) {
  return useQuery({
    queryKey: ["related", id],
    queryFn: () => productService.getRelated(id!, categoryId!),
    enabled: Boolean(id && categoryId),
    staleTime: 5 * 60 * 1000
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => productService.getFeatured(),
    staleTime: 5 * 60 * 1000
  });
}

export function useTrendingProducts() {
  return useQuery({
    queryKey: ["products", "trending"],
    queryFn: () => productService.getTrending(),
    staleTime: 5 * 60 * 1000
  });
}

export function useNewArrivals() {
  return useQuery({
    queryKey: ["products", "new-arrivals"],
    queryFn: () => productService.getNewArrivals(),
    staleTime: 5 * 60 * 1000
  });
}

export function useBestDeals() {
  return useQuery({
    queryKey: ["products", "best-deals"],
    queryFn: () => productService.getBestDeals(),
    staleTime: 5 * 60 * 1000
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
    staleTime: 10 * 60 * 1000
  });
}

export function useHomeData() {
  return useQuery({
    queryKey: ["home"],
    queryFn: () => productService.getHome(),
    staleTime: 5 * 60 * 1000
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () => brandService.getAll(),
    staleTime: 10 * 60 * 1000
  });
}

export function useFacets() {
  return useQuery({
    queryKey: ["facets"],
    queryFn: () => productService.getFacets(),
    staleTime: 10 * 60 * 1000
  });
}
