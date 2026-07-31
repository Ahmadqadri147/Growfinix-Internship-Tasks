import { useEffect, useRef, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { SOCKET_URL } from "@/constants";
import { useAuthStore } from "@/stores/authStore";

export function useSocket(eventId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL || undefined, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      if (eventId) {
        socketRef.current?.emit("join-event", eventId);
      }
    });

    return () => {
      if (socketRef.current) {
        if (eventId) {
          socketRef.current.emit("leave-event", eventId);
        }
        socketRef.current.disconnect();
      }
    };
  }, [eventId, token]);

  const onSeatUpdate = useCallback(
    (callback: (data: { seatId: string; status: string }) => void) => {
      socketRef.current?.on("seat:update", callback);
      return () => {
        socketRef.current?.off("seat:update", callback);
      };
    },
    [],
  );

  const onBookingUpdate = useCallback(
    (callback: (data: { bookingId: string; status: string }) => void) => {
      socketRef.current?.on("booking:update", callback);
      return () => {
        socketRef.current?.off("booking:update", callback);
      };
    },
    [],
  );

  const emit = useCallback(
    (event: string, data?: unknown) => {
      socketRef.current?.emit(event, data);
    },
    [],
  );

  return { socket: socketRef.current, onSeatUpdate, onBookingUpdate, emit };
}
