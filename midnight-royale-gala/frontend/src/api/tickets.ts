import client from "./client";
import type { TicketType } from "@/types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function getEventTicketTypes(eventId: string): Promise<TicketType[]> {
  const { data } = await client.get<ApiResponse<TicketType[]>>(`/tickets/event/${eventId}`);
  return data.data;
}

export async function getTicketType(id: string): Promise<TicketType> {
  const { data } = await client.get<ApiResponse<TicketType>>(`/tickets/${id}`);
  return data.data;
}
