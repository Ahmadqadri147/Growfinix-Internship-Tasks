import client from "./client";
import type { Venue } from "@/types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function getVenues(): Promise<Venue[]> {
  const { data } = await client.get<ApiResponse<Venue[]>>("/venues");
  return data.data;
}

export async function getVenue(id: string): Promise<Venue> {
  const { data } = await client.get<ApiResponse<Venue>>(`/venues/${id}`);
  return data.data;
}

export async function getEventVenue(eventId: string): Promise<Venue> {
  const { data } = await client.get<ApiResponse<Venue>>(`/venues/event/${eventId}`);
  return data.data;
}
