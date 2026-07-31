import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as seatsApi from "@/api/seats";
import type { Seat } from "@/types";

const MOCK_ROWS = "ABCDEFGHIJ".split("");
const MOCK_COLS = Array.from({ length: 20 }, (_, i) => i + 1);
const MOCK_BOOKED = new Set(["A-5", "A-6", "B-3", "C-8", "D-2", "E-10", "F-4", "H-11", "I-9", "J-15"]);
const MOCK_RESERVED = new Set(["A-10", "B-12", "G-4", "J-1"]);

function generateMockSeats(eventId: string): Seat[] {
  const seats: Seat[] = [];
  for (const row of MOCK_ROWS) {
    for (const col of MOCK_COLS) {
      const tier =
        row <= "B" ? "VIP" : row <= "D" ? "DIAMOND" : row <= "F" ? "GOLD" : "SILVER";
      const price =
        tier === "VIP" ? 1500 : tier === "DIAMOND" ? 1000 : tier === "GOLD" ? 500 : 250;
      const seatRef = `${row}-${col}`;
      const status = MOCK_BOOKED.has(seatRef)
        ? "BOOKED"
        : MOCK_RESERVED.has(seatRef)
          ? "RESERVED"
          : "AVAILABLE";
      seats.push({
        id: `seat-${seatRef}`,
        eventId,
        section: tier === "VIP" ? "VIP" : "Main",
        row,
        number: col,
        tier,
        status,
        price,
      });
    }
  }
  return seats;
}

export function useEventSeats(eventId: string) {
  return useQuery({
    queryKey: ["seats", eventId],
    queryFn: async () => {
      try {
        return await seatsApi.getEventSeats(eventId);
      } catch {
        return generateMockSeats(eventId);
      }
    },
    enabled: !!eventId,
    refetchInterval: 15000,
  });
}

export function useLockSeat(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (seatId: string) => seatsApi.lockSeat(seatId),
    onMutate: async (seatId) => {
      await queryClient.cancelQueries({ queryKey: ["seats", eventId] });
      const previous = queryClient.getQueryData<Seat[]>(["seats", eventId]);
      queryClient.setQueryData<Seat[]>(["seats", eventId], (old) =>
        old?.map((s) =>
          s.id === seatId ? { ...s, status: "locked" } : s,
        ),
      );
      return { previous };
    },
    onError: (_err, _seatId, context) => {
      queryClient.setQueryData(["seats", eventId], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["seats", eventId] });
    },
  });
}

export function useReleaseSeat(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { seatId: string; sessionId: string }) =>
      seatsApi.releaseSeat(params.seatId, params.sessionId),
    onMutate: async ({ seatId }) => {
      await queryClient.cancelQueries({ queryKey: ["seats", eventId] });
      const previous = queryClient.getQueryData<Seat[]>(["seats", eventId]);
      queryClient.setQueryData<Seat[]>(["seats", eventId], (old) =>
        old?.map((s) =>
          s.id === seatId
            ? { ...s, status: "available" }
            : s,
        ),
      );
      return { previous };
    },
    onError: (_err, _seatId, context) => {
      queryClient.setQueryData(["seats", eventId], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["seats", eventId] });
    },
  });
}

export function useLockMultipleSeats(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (seatIds: string[]) =>
      seatsApi.lockMultipleSeats(eventId, seatIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seats", eventId] });
    },
  });
}

export function useReleaseMultipleSeats(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (seatIds: string[]) =>
      seatsApi.releaseMultipleSeats(eventId, seatIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seats", eventId] });
    },
  });
}
