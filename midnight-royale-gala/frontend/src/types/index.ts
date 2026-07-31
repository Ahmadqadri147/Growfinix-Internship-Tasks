export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: string;
  avatar?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: { bookings: number };
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venueId: string;
  venue?: Venue | { id: string; name: string; city: string; address?: string };
  imageUrl?: string;
  gallery?: string[];
  status: string;
  featured: boolean;
  ticketTypes: TicketType[];
  createdAt: string;
  updatedAt: string;
  _count?: { bookings: number };
}

export interface EventFilters {
  category?: string;
  date?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  status?: string;
  featured?: string;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface Venue {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  capacity: number;
  images: string[];
  amenities: string[];
  mapUrl?: string;
  createdAt: string;
  updatedAt: string;
  events?: Event[];
}

export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  available: number;
  benefits: string[];
  color?: string;
  originalPrice?: number;
}

export interface Seat {
  id: string;
  eventId: string;
  section: string;
  row: string;
  number: number;
  tier: string;
  status: string;
  price: number;
  lockedBy?: string;
  lockedAt?: string;
}

export interface Booking {
  id: string;
  bookingRef: string;
  userId: string;
  eventId: string;
  status: string;
  totalAmount: number;
  discountAmount: number;
  couponCode?: string;
  paymentStatus?: string;
  paymentId?: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; email: string };
  event?: { id: string; title: string; date: string; time?: string; imageUrl?: string; venue?: { id: string; name: string; address?: string; city?: string } };
  bookingTickets?: BookingTicket[];
  bookingSeats?: BookingSeat[];
  payments?: Payment[];
  tickets?: { ticketType: TicketType; quantity: number }[];
  seats?: Seat[];
  total?: number;
}

export interface BookingTicket {
  id: string;
  bookingId: string;
  ticketTypeId: string;
  ticketType: TicketType;
  quantity: number;
  unitPrice: number;
}

export interface BookingSeat {
  id: string;
  bookingId: string;
  seatId: string;
  seat: Seat;
}

export interface Payment {
  id: string;
  userId: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: string;
  stripePaymentIntentId?: string;
  method?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  maxUses: number;
  usedCount: number;
  minAmount: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  discount?: number;
  maxDiscount?: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface DashboardStats {
  totalBookings: number;
  upcomingEvents: number;
  totalSpent: number;
  activeTickets: number;
  recentBookings: Booking[];
}

export interface AdminDashboardStats {
  totalEvents: number;
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  revenueByMonth?: { month: string; revenue: number }[];
  bookingsByStatus?: { status: string; count: number }[];
  recentBookings?: Booking[];
  popularEvents?: { event: Event; bookings: number }[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}
