import { api } from "@/api/client";
import type { ApiResponse, SearchEntry, Review, ReviewBreakdown } from "@/types";
import type { PaginationMeta } from "@/types";

export interface PaginatedReviews {
  reviews: Review[];
  meta: PaginationMeta;
}

export const reviewService = {
  async getByProduct(productId: string, page = 1, limit = 8, sort = "newest"): Promise<PaginatedReviews> {
    const { data } = await api.get<ApiResponse<PaginatedReviews>>(
      `/reviews/product/${productId}?page=${page}&limit=${limit}&sort=${sort}`
    );
    return data.data;
  },

  async getBreakdown(productId: string): Promise<ReviewBreakdown> {
    const { data } = await api.get<ApiResponse<ReviewBreakdown>>(`/reviews/product/${productId}/breakdown`);
    return data.data;
  },

  async create(productId: string, input: { rating: number; title?: string; comment: string }): Promise<Review> {
    const { data } = await api.post<ApiResponse<Review>>(`/reviews/product/${productId}`, input);
    return data.data;
  },

  async markHelpful(reviewId: string): Promise<void> {
    await api.post(`/reviews/${reviewId}/helpful`);
  },

  async remove(reviewId: string): Promise<void> {
    await api.delete(`/reviews/${reviewId}`);
  }
};

export const searchService = {
  async record(query: string, resultsCount: number): Promise<void> {
    try {
      await api.post("/search/record", { query, resultsCount });
    } catch {
      // recording is best-effort
    }
  },

  async trending(days = 7, limit = 10): Promise<{ query: string; count: number }[]> {
    const { data } = await api.get<ApiResponse<{ query: string; count: number }[]>>(
      `/search/trending?days=${days}&limit=${limit}`
    );
    return data.data;
  },

  async recent(): Promise<SearchEntry[]> {
    const { data } = await api.get<ApiResponse<SearchEntry[]>>("/search/recent");
    return data.data;
  },

  async clear(): Promise<void> {
    await api.delete("/search/recent");
  }
};
