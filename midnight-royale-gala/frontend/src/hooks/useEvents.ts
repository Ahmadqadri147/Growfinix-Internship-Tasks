import { useQuery } from "@tanstack/react-query";
import * as eventsApi from "@/api/events";
import type { Event, EventFilters } from "@/types";

const MOCK_EVENT: Event = {
  id: "midnight-royale-gala",
  title: "Midnight Royale Gala",
  description:
    "Step into a world of opulence at the Midnight Royale Gala. An unforgettable evening of live orchestral performances, gourmet dining, champagne receptions, and a spectacular fireworks display in the Grand Imperial Ballroom.",
  date: "2026-12-31",
  time: "8:00 PM - 2:00 AM",
  venueId: "grand-imperial-ballroom",
  venue: {
    id: "grand-imperial-ballroom",
    name: "Grand Imperial Ballroom",
    city: "New York",
    address: "123 Luxury Avenue",
    capacity: 2500,
  },
  status: "UPCOMING",
  featured: true,
  ticketTypes: [
    {
      id: "diamond-vip",
      name: "Diamond VIP",
      description: "The ultimate gala experience with personal concierge service.",
      price: 2500,
      originalPrice: 3000,
      quantity: 100,
      available: 62,
      benefits: ["Private Balcony", "Meet & Greet Pass", "Personal Concierge"],
    },
    {
      id: "vip",
      name: "VIP",
      description: "Premium seating with VIP lounge access and valet parking.",
      price: 1500,
      originalPrice: 1800,
      quantity: 200,
      available: 128,
      benefits: ["Premium Seating", "VIP Lounge Access", "Complimentary Valet"],
    },
    {
      id: "premium",
      name: "Premium",
      description: "Enhanced experience with champagne reception access.",
      price: 500,
      quantity: 400,
      available: 190,
      benefits: ["Premium Seating", "Champagne Reception"],
    },
    {
      id: "economy",
      name: "Economy",
      description: "Full event access with standard seating.",
      price: 200,
      quantity: 600,
      available: 260,
      benefits: ["General Admission"],
    },
  ],
  createdAt: "2026-01-15T00:00:00Z",
  updatedAt: "2026-07-01T00:00:00Z",
  _count: { bookings: 1240 },
};

export function getMockEvent(id?: string): Event {
  return { ...MOCK_EVENT, id: id || MOCK_EVENT.id };
}

export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: () => eventsApi.getEvents(filters),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      try {
        return await eventsApi.getEvent(id);
      } catch {
        return getMockEvent(id);
      }
    },
    enabled: !!id,
    staleTime: Infinity,
    select: (data) => data,
  });
}

export function useFeaturedEvents() {
  return useQuery({
    queryKey: ["events", "featured"],
    queryFn: eventsApi.getFeaturedEvents,
    staleTime: 1000 * 60 * 10,
  });
}

export function useUpcomingEvents() {
  return useQuery({
    queryKey: ["events", "upcoming"],
    queryFn: eventsApi.getUpcomingEvents,
    staleTime: 1000 * 60 * 5,
  });
}
