import { api } from "@/api/client";
import type { ApiResponse, Brand, Category, Facets, HomeData, Product, ProductQueryParams, ProductsResult, Suggestions } from "@/types";
import { buildQueryString } from "@/utils/format";

export const productService = {
  async getProducts(params: ProductQueryParams): Promise<ProductsResult> {
    const { data } = await api.get<ApiResponse<ProductsResult>>(`/products${buildQueryString(params)}`);
    return data.data;
  },

  async getHome(): Promise<HomeData> {
    const { data } = await api.get<ApiResponse<HomeData>>("/home");
    return data.data;
  },

  async getProduct(id: string): Promise<Product> {
    const { data } = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return data.data;
  },

  async getRelated(id: string, categoryId: string): Promise<Product[]> {
    const { data } = await api.get<ApiResponse<Product[]>>(`/products/${id}/related/${categoryId}`);
    return data.data;
  },

  async getSuggestions(q: string): Promise<Suggestions> {
    const { data } = await api.get<ApiResponse<Suggestions>>(`/products/suggestions?q=${encodeURIComponent(q)}`);
    return data.data;
  },

  async getFeatured(limit = 8): Promise<Product[]> {
    const { data } = await api.get<ApiResponse<Product[]>>(`/products/featured?limit=${limit}`);
    return data.data;
  },

  async getTrending(limit = 8): Promise<Product[]> {
    const { data } = await api.get<ApiResponse<Product[]>>(`/products/trending?limit=${limit}`);
    return data.data;
  },

  async getNewArrivals(limit = 8): Promise<Product[]> {
    const { data } = await api.get<ApiResponse<Product[]>>(`/products/new-arrivals?limit=${limit}`);
    return data.data;
  },

  async getBestDeals(limit = 8): Promise<Product[]> {
    const { data } = await api.get<ApiResponse<Product[]>>(`/products/best-deals?limit=${limit}`);
    return data.data;
  },

  async getFacets(): Promise<Facets> {
    const { data } = await api.get<ApiResponse<Facets>>("/products/facets");
    return data.data;
  }
};

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data } = await api.get<ApiResponse<Category[]>>("/categories");
    return data.data;
  }
};

export const brandService = {
  async getAll(): Promise<Brand[]> {
    const { data } = await api.get<ApiResponse<Brand[]>>("/brands");
    return data.data;
  }
};
