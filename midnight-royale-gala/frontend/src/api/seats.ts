import client from "./client";
import type { Seat } from "@/types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function getEventSeats(eventId: string): Promise<Seat[]> {
  const { data } = await client.get<ApiResponse<Seat[]>>(`/seats/event/${eventId}`);
  return data.data;
}

export async function lockSeat(
  seatId: string,
): Promise<{ success: boolean; sessionId?: string }> {
  const { data } = await client.post<{ success: boolean; message: string; data?: { sessionId: string } }>(
    `/seats/lock`,
    { seatId },
  );
  return { success: data.success, sessionId: data.data?.sessionId };
}

export async function releaseSeat(
  seatId: string,
  sessionId: string,
): Promise<{ success: boolean }> {
  const { data } = await client.post<ApiResponse<null>>(
    `/seats/release`,
    { seatId, sessionId },
  );
  return { success: data.success };
}

export async function lockMultipleSeats(
  eventId: string,
  seatIds: string[],
): Promise<{ success: boolean; lockedSeats: string[] }> {
  const results = await Promise.allSettled(
    seatIds.map((seatId) => lockSeat(seatId)),
  );
  const lockedSeats = seatIds.filter((_, i) =>
    results[i]?.status === "fulfilled"
  );
  return { success: lockedSeats.length > 0, lockedSeats };
}

export async function releaseMultipleSeats(
  eventId: string,
  seatIds: string[],
): Promise<{ success: boolean }> {
  await Promise.allSettled(
    seatIds.map((seatId) =>
      client.post(`/seats/release`, { seatId, sessionId: "" })
    ),
  );
  return { success: true };
}
