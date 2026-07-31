import client from "./client";
import type {
  User,
  Booking,
  AdminDashboardStats,
  Pagination,
} from "@/types";

interface ApiSingleResponse<T> {
  success: boolean;
  data: T;
}

interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const { data } = await client.get<ApiSingleResponse<AdminDashboardStats>>("/admin/dashboard");
  return data.data;
}

export async function getAdminUsers(
  page = 1,
  limit = 20,
): Promise<{ data: User[];   pagination: Pagination }> {
  const { data } = await client.get<ApiListResponse<User>>("/admin/users", {
    params: { page, limit },
  });
  return { data: data.data, pagination: data.pagination };
}

export async function updateUserRole(
  userId: string,
  role: string,
): Promise<User> {
  const { data } = await client.patch<ApiSingleResponse<User>>(`/admin/users/${userId}/role`, {
    role,
  });
  return data.data;
}

export async function getAdminBookings(
  page = 1,
  limit = 20,
): Promise<{ data: Booking[];   pagination: Pagination }> {
  const { data } = await client.get<ApiListResponse<Booking>>(
    "/admin/bookings",
    { params: { page, limit } },
  );
  return { data: data.data, pagination: data.pagination };
}
