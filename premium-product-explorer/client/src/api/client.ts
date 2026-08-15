import axios, { AxiosError } from "axios";
import { API_BASE } from "@/constants";
import type { ApiResponse } from "@/types";
import { useAuthStore } from "@/store/authStore";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function rewriteImageUrl(url: string): string {
  if (!url.includes("loremflickr.com")) return url;
  return `${API_BASE}/images?src=${encodeURIComponent(url)}`;
}

function rewriteImages(data: unknown, depth = 0): void {
  if (depth > 12 || data === null || typeof data !== "object") return;
  if (Array.isArray(data)) {
    for (const item of data) rewriteImages(item, depth + 1);
    return;
  }
  const record = data as Record<string, unknown>;
  for (const [key, value] of Object.entries(record)) {
    if (Array.isArray(value) && (key === "images" || key === "gallery")) {
      record[key] = value.map((item) => (typeof item === "string" ? rewriteImageUrl(item) : item));
    } else if (typeof value === "string" && (key === "image" || key === "thumbnail")) {
      record[key] = rewriteImageUrl(value);
    } else if (value !== null && typeof value === "object") {
      rewriteImages(value, depth + 1);
    }
  }
}

api.interceptors.response.use(
  (response) => {
    rewriteImages(response.data);
    return response;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401 && !error.config?.url?.includes("/auth/login") && !error.config?.url?.includes("/auth/register")) {
      window.dispatchEvent(new Event("ppe:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (error.code === "ECONNABORTED") return "Request timed out. Please try again.";
    if (!error.response) return "Network error. Is the server running?";
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
