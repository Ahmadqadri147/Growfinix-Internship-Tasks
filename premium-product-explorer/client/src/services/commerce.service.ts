import { api } from "@/api/client";
import type { ApiResponse, Order, Product } from "@/types";
import type { PaginationMeta } from "@/types";

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface PaginatedOrders {
  orders: Order[];
  meta: PaginationMeta;
}

export const wishlistService = {
  async getAll(page = 1, limit = 12): Promise<Paginated<Product>> {
    const { data } = await api.get<ApiResponse<Paginated<Product>>>(`/wishlist?page=${page}&limit=${limit}`);
    return data.data;
  },

  async add(productId: string): Promise<{ added: boolean }> {
    const { data } = await api.post<ApiResponse<{ added: boolean }>>(`/wishlist/${productId}`);
    return data.data;
  },

  async remove(productId: string): Promise<void> {
    await api.delete(`/wishlist/${productId}`);
  },

  async status(productId: string): Promise<{ wishlisted: boolean }> {
    const { data } = await api.get<ApiResponse<{ wishlisted: boolean }>>(`/wishlist/${productId}/status`);
    return data.data;
  }
};

export const orderService = {
  async create(items: { productId: string; quantity: number }[]): Promise<Order> {
    const { data } = await api.post<ApiResponse<Order>>("/orders", { items });
    return data.data;
  },

  async getAll(page = 1, limit = 10): Promise<PaginatedOrders> {
    const { data } = await api.get<ApiResponse<PaginatedOrders>>(`/orders?page=${page}&limit=${limit}`);
    return data.data;
  }
};
