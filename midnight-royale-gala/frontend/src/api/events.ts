import client from "./client";
import type { Event, EventFilters, PaginatedResponse } from "@/types";

interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginatedResponse<T>["pagination"];
}

interface ApiSingleResponse<T> {
  success: boolean;
  data: T;
}

export async function getEvents(
  filters?: EventFilters,
): Promise<{ data: Event[]; pagination: PaginatedResponse<Event>["pagination"] }> {
  const { data } = await client.get<ApiListResponse<Event>>("/events", {
    params: filters,
  });
  return { data: data.data, pagination: data.pagination };
}

export async function getEvent(id: string): Promise<Event> {
  const { data } = await client.get<ApiSingleResponse<Event>>(`/events/${id}`);
  return data.data;
}

export async function getFeaturedEvents(): Promise<Event[]> {
  const { data } = await client.get<ApiSingleResponse<Event[]>>("/events/featured");
  return data.data;
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const { data } = await client.get<ApiSingleResponse<Event[]>>("/events/upcoming");
  return data.data;
}
