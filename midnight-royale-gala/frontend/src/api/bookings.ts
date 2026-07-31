import client from "./client";
import type { Booking, Pagination } from "@/types";

interface ApiSingleResponse<T> {
  success: boolean;
  data: T;
}

interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export async function createBooking(data: {
  eventId: string;
  tickets: { ticketTypeId: string; quantity: number }[];
  seatIds?: string[];
  couponCode?: string;
}): Promise<Booking> {
  const { data: response } = await client.post<ApiSingleResponse<Booking>>("/bookings", data);
  return response.data;
}

export async function getBookings(
  page = 1,
  limit = 10,
): Promise<{ data: Booking[];   pagination: Pagination }> {
  const { data } = await client.get<ApiListResponse<Booking>>("/bookings", {
    params: { page, limit },
  });
  return { data: data.data, pagination: data.pagination };
}

export async function getBooking(id: string): Promise<Booking> {
  const { data } = await client.get<ApiSingleResponse<Booking>>(`/bookings/${id}`);
  return data.data;
}

export async function getBookingByRef(ref: string): Promise<Booking> {
  const { data } = await client.get<ApiSingleResponse<Booking>>(`/bookings/ref/${ref}`);
  return data.data;
}

export async function cancelBooking(id: string): Promise<Booking> {
  const { data } = await client.patch<ApiSingleResponse<Booking>>(`/bookings/${id}/cancel`);
  return data.data;
}

export async function getMyBookings(
  page = 1,
  limit = 10,
): Promise<{ data: Booking[];   pagination: Pagination }> {
  const { data } = await client.get<ApiListResponse<Booking>>(
    "/bookings/my-bookings",
    { params: { page, limit } },
  );
  return { data: data.data, pagination: data.pagination };
}
