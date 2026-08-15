import { api } from "@/api/client";
import type { ApiResponse } from "@/types";

export interface DashboardStats {
  counts: {
    products: number;
    categories: number;
    brands: number;
    users: number;
    orders: number;
    reviews: number;
    wishlists: number;
  };
  revenue: { total: number; average: number };
  inventory: { totalStock: number; avgPrice: number; maxPrice: number; minPrice: number };
}

export interface TopSearch {
  query: string;
  count: number;
  avgResults: number;
}

export interface Activity {
  type: "ORDER" | "USER" | "SEARCH";
  text: string;
  date: string;
  meta?: Record<string, unknown>;
}

export interface DayPoint {
  date: string;
  value: number;
}

export interface MostViewedProduct {
  id: string;
  title: string;
  price: number;
  rating: number;
  viewCount: number;
  popularity: number;
  category: { name: string };
}

export const adminService = {
  async stats(): Promise<DashboardStats> {
    const { data } = await api.get<ApiResponse<DashboardStats>>("/admin/stats");
    return data.data;
  },

  async topSearches(days = 30, limit = 10): Promise<TopSearch[]> {
    const { data } = await api.get<ApiResponse<TopSearch[]>>(`/admin/top-searches?days=${days}&limit=${limit}`);
    return data.data;
  },

  async searchVolume(days = 14): Promise<{ date: string; searches: number }[]> {
    const { data } = await api.get<ApiResponse<{ date: string; searches: number }[]>>(`/admin/search-volume?days=${days}`);
    return data.data;
  },

  async revenueByDay(days = 14): Promise<{ date: string; revenue: number }[]> {
    const { data } = await api.get<ApiResponse<{ date: string; revenue: number }[]>>(`/admin/revenue?days=${days}`);
    return data.data;
  },

  async mostViewed(limit = 10): Promise<MostViewedProduct[]> {
    const { data } = await api.get<ApiResponse<MostViewedProduct[]>>(`/admin/most-viewed?limit=${limit}`);
    return data.data;
  },

  async recentActivity(limit = 12): Promise<Activity[]> {
    const { data } = await api.get<ApiResponse<Activity[]>>(`/admin/recent-activity?limit=${limit}`);
    return data.data;
  },

  async categoryDistribution(): Promise<{ name: string; products: number }[]> {
    const { data } = await api.get<ApiResponse<{ name: string; products: number }[]>>("/admin/category-distribution");
    return data.data;
  }
};
