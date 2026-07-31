export const APP_NAME = "Midnight Royale Gala";
export const EVENT_NAME = "Midnight Royale Gala";
export const TAGLINE = "Where Luxury Meets the Night";

export const COLORS = {
  gold: {
    50: "#fef9e7",
    100: "#fdf0c4",
    200: "#fbe49d",
    300: "#f5e6a3",
    400: "#e8c54a",
    500: "#d4af37",
    600: "#c9a84c",
    700: "#b8962e",
    800: "#a07d20",
    900: "#8a6514",
    950: "#5a4208",
  },
  midnight: {
    50: "#f0f0f5",
    100: "#d6d6e3",
    200: "#adadc7",
    300: "#8484ab",
    400: "#5b5b8f",
    500: "#3a3a6b",
    600: "#2d2d56",
    700: "#202041",
    800: "#14142e",
    900: "#0a0a1a",
    950: "#04040a",
  },
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export const API_URL = import.meta.env.VITE_API_URL || "/api";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "";

export const TICKET_TIERS = {
  vip: { label: "VIP", color: "#D4AF37", description: "Exclusive VIP access with premium amenities" },
  premium: { label: "Premium", color: "#C9A84C", description: "Premium seating with enhanced experience" },
  standard: { label: "Standard", color: "#E5E4E2", description: "General admission with full event access" },
  economy: { label: "Economy", color: "#CD7F32", description: "Budget-friendly entry pass" },
} as const;

export const SEAT_STATUS = {
  available: { label: "Available", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  reserved: { label: "Reserved", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  booked: { label: "Booked", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  selected: { label: "Selected", color: "bg-gold-500/20 text-gold-400 border-gold-500/30" },
  locked: { label: "Locked", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
} as const;

export const BOOKING_STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  refunded: "Refunded",
  completed: "Completed",
} as const;
