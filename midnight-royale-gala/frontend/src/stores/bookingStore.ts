import { create } from "zustand";
import type { Seat, TicketType, Coupon } from "@/types";

interface BookingItem {
  ticketType: TicketType;
  quantity: number;
}

interface BookingState {
  eventId: string | null;
  selectedSeats: Seat[];
  ticketTypes: BookingItem[];
  coupon: Coupon | null;
  subtotal: number;
  discount: number;
  serviceFee: number;
  total: number;
  step: number;
  setEventId: (id: string) => void;
  addSeat: (seat: Seat) => void;
  removeSeat: (seatId: string) => void;
  clearSeats: () => void;
  setTicketQuantity: (ticketTypeId: string, quantity: number) => void;
  setCoupon: (coupon: Coupon | null) => void;
  setStep: (step: number) => void;
  calculateTotals: () => void;
  reset: () => void;
}

const initialState = {
  eventId: null,
  selectedSeats: [],
  ticketTypes: [],
  coupon: null,
  subtotal: 0,
  discount: 0,
  serviceFee: 0,
  total: 0,
  step: 1,
};

export const useBookingStore = create<BookingState>()((set, get) => ({
  ...initialState,
  setEventId: (id) => set({ eventId: id }),
  addSeat: (seat) =>
    set((state) => ({
      selectedSeats: [...state.selectedSeats, seat],
    })),
  removeSeat: (seatId) =>
    set((state) => ({
      selectedSeats: state.selectedSeats.filter((s) => s.id !== seatId),
    })),
  clearSeats: () => set({ selectedSeats: [] }),
  setTicketQuantity: (ticketTypeId, quantity) =>
    set((state) => {
      const existing = state.ticketTypes.find(
        (t) => t.ticketType.id === ticketTypeId,
      );
      if (existing) {
        return {
          ticketTypes: state.ticketTypes.map((t) =>
            t.ticketType.id === ticketTypeId ? { ...t, quantity } : t,
          ),
        };
      }
      if (quantity <= 0) return state;
      return {
        ticketTypes: [
          ...state.ticketTypes,
          { ticketType: { id: ticketTypeId } as TicketType, quantity },
        ],
      };
    }),
  setCoupon: (coupon) => set({ coupon }),
  setStep: (step) => set({ step }),
  calculateTotals: () => {
    const { ticketTypes, selectedSeats, coupon } = get();
    const ticketSubtotal = ticketTypes.reduce(
      (sum, t) => sum + (t.ticketType.price || 0) * t.quantity,
      0,
    );
    const seatSubtotal = selectedSeats.reduce(
      (sum, s) => sum + (s.price || 0),
      0,
    );
    const subtotal = ticketSubtotal + seatSubtotal;
    let discount = 0;
    if (coupon) {
      if (coupon.discountType === "PERCENTAGE" || coupon.discountType === "percentage") {
        discount = subtotal * ((coupon.discountValue || coupon.discount || 0) / 100);
      } else {
        discount = coupon.discountValue || coupon.discount || 0;
      }
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    }
    const serviceFee = subtotal * 0.05;
    const total = Math.max(0, subtotal - discount + serviceFee);
    set({ subtotal, discount, serviceFee, total });
  },
  reset: () => set(initialState),
}));
