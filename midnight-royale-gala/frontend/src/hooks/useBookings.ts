import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as bookingsApi from "@/api/bookings";
import type { Booking } from "@/types";

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "demo-booking-1",
    bookingRef: "MRG-DEMO-001",
    userId: "demo-user-001",
    eventId: "midnight-royale-gala",
    status: "CONFIRMED",
    totalAmount: 2500,
    discountAmount: 0,
    createdAt: "2026-07-10T10:00:00Z",
    updatedAt: "2026-07-10T10:00:00Z",
    event: {
      id: "midnight-royale-gala",
      title: "Midnight Royale Gala",
      date: "2026-12-31",
      time: "8:00 PM - 2:00 AM",
      venue: { id: "grand-imperial-ballroom", name: "Grand Imperial Ballroom" },
    },
    bookingSeats: [
      {
        id: "bs-1",
        bookingId: "demo-booking-1",
        seatId: "seat-A-7",
        seat: {
          id: "seat-A-7",
          eventId: "midnight-royale-gala",
          section: "Main",
          row: "A",
          number: 7,
          tier: "VIP",
          status: "BOOKED",
          price: 1500,
        },
      },
    ],
    tickets: [
      { ticketType: { id: "vip", name: "VIP", price: 1500, quantity: 100, available: 62, benefits: [] }, quantity: 1 },
    ],
  },
  {
    id: "demo-booking-2",
    bookingRef: "MRG-DEMO-002",
    userId: "demo-user-001",
    eventId: "new-years-eve-ball",
    status: "PENDING",
    totalAmount: 1800,
    discountAmount: 0,
    createdAt: "2026-07-05T14:30:00Z",
    updatedAt: "2026-07-05T14:30:00Z",
    event: {
      id: "new-years-eve-ball",
      title: "New Year's Eve Ball",
      date: "2026-12-31",
      time: "9:00 PM - 3:00 AM",
      venue: { id: "grand-imperial-ballroom", name: "Grand Imperial Ballroom" },
    },
    tickets: [
      { ticketType: { id: "premium", name: "Premium", price: 500, quantity: 300, available: 190, benefits: [] }, quantity: 2 },
    ],
  },
  {
    id: "demo-booking-3",
    bookingRef: "MRG-DEMO-003",
    userId: "demo-user-001",
    eventId: "summer-soiree",
    status: "COMPLETED",
    totalAmount: 750,
    discountAmount: 0,
    createdAt: "2026-06-20T09:00:00Z",
    updatedAt: "2026-06-20T09:00:00Z",
    event: {
      id: "summer-soiree",
      title: "Summer Soirée",
      date: "2026-07-15",
      time: "7:00 PM - 12:00 AM",
      venue: { id: "grand-imperial-ballroom", name: "Grand Imperial Ballroom" },
    },
    tickets: [
      { ticketType: { id: "economy", name: "Economy", price: 200, quantity: 500, available: 260, benefits: [] }, quantity: 3 },
    ],
  },
  {
    id: "demo-booking-4",
    bookingRef: "MRG-DEMO-004",
    userId: "demo-user-001",
    eventId: "autumn-gala",
    status: "CANCELLED",
    totalAmount: 500,
    discountAmount: 0,
    createdAt: "2026-05-15T11:00:00Z",
    updatedAt: "2026-05-16T11:00:00Z",
    event: {
      id: "autumn-gala",
      title: "Autumn Gala",
      date: "2026-10-20",
      time: "8:00 PM - 2:00 AM",
      venue: { id: "grand-imperial-ballroom", name: "Grand Imperial Ballroom" },
    },
    tickets: [
      { ticketType: { id: "gold", name: "Gold", price: 250, quantity: 400, available: 220, benefits: [] }, quantity: 2 },
    ],
  },
];

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: bookingsApi.createBooking,
    onSuccess: (booking: Booking) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking created successfully!");
      navigate(`/booking/success?ref=${booking.bookingRef}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create booking");
    },
  });
}

export function useBookings(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["bookings", page, limit],
    queryFn: () => bookingsApi.getBookings(page, limit),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: () => bookingsApi.getBooking(id),
    enabled: !!id,
  });
}

export function useBookingByRef(ref: string) {
  return useQuery({
    queryKey: ["booking", "ref", ref],
    queryFn: () => bookingsApi.getBookingByRef(ref),
    enabled: !!ref,
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingsApi.cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking cancelled successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel booking");
    },
  });
}

export function useMyBookings(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["myBookings", page, limit],
    queryFn: async () => {
      try {
        return await bookingsApi.getMyBookings(page, limit);
      } catch {
        return {
          data: MOCK_BOOKINGS,
          pagination: { page, limit, total: MOCK_BOOKINGS.length, totalPages: 1 },
        };
      }
    },
  });
}
