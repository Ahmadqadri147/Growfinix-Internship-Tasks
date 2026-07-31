import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Download, XCircle, User, Settings, Bell, Moon, AlertTriangle } from "lucide-react";
import { Button, GlassCard, Badge, Input, Tabs, Skeleton } from "@/components/ui";
import { useAuthContext } from "@/contexts/AuthContext";
import { useMyBookings, useCancelBooking } from "@/hooks/useBookings";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Booking } from "@/types";

const statusVariant: Record<string, "gold" | "success" | "warning" | "error" | "info"> = {
  CONFIRMED: "success",
  PENDING: "warning",
  COMPLETED: "info",
  CANCELLED: "error",
  REFUNDED: "warning",
};

export default function UserDashboard() {
  const { user } = useAuthContext();
  const { data: bookingsData, isLoading } = useMyBookings();
  const cancelBooking = useCancelBooking();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");

  useEffect(() => {
    document.title = "Dashboard | Midnight Royale Gala";
    if (user) {
      setProfileName(user.name || "");
      setProfileEmail(user.email || "");
      setProfilePhone(user.phone || "");
    }
  }, [user]);

  const bookings: Booking[] = bookingsData?.data || [];
  const upcoming = bookings.filter((b) => b.status === "CONFIRMED" || b.status === "PENDING");
  const past = bookings.filter((b) => b.status === "COMPLETED" || b.status === "CANCELLED" || b.status === "REFUNDED");

  const totalSpent = bookings.reduce((s, b) => s + (b.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-midnight-950">
      <div className="mx-auto max-w-7xl px-6 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-serif text-3xl font-bold gold-text">
            Welcome back, {user?.name || "Guest"}
          </h1>
          <p className="mt-1 text-gray-400">Here's your event overview</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Upcoming Events</p>
                <p className="font-serif text-3xl font-bold text-white">{upcoming.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/10">
                <Calendar className="h-6 w-6 text-gold-400" />
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Past Events</p>
                <p className="font-serif text-3xl font-bold text-white">{past.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Spent</p>
                <p className="font-serif text-3xl font-bold text-white">
                  {formatCurrency(totalSpent)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <span className="text-lg font-bold text-green-400">$</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10"
        >
          <Tabs
            tabs={[
              {
                id: "upcoming",
                label: "Upcoming Bookings",
                content: (
                  <div className="space-y-4">
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-gold-lg" />
                      ))
                    ) : upcoming.length === 0 ? (
                      <GlassCard className="py-12 text-center">
                        <p className="font-serif text-xl text-gray-400">No upcoming bookings</p>
                        <p className="mt-2 text-sm text-gray-500">Browse events to make a booking</p>
                        <Button variant="primary" className="mt-4" onClick={() => window.location.href = "/"}>
                          Browse Events
                        </Button>
                      </GlassCard>
                    ) : (
                      upcoming.map((booking, i) => (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <GlassCard>
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div>
                                <h3 className="font-serif text-lg font-semibold text-white">
                                  {booking.event?.title || "Event"}
                                </h3>
                                <p className="mt-1 text-sm text-gray-400">
                                  {booking.event?.date ? formatDate(booking.event.date) : formatDate(booking.createdAt)}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                  <Badge variant={statusVariant[booking.status] || "info"} size="sm">
                                    {booking.status}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    Ref: {booking.bookingRef}
                                  </span>
                                </div>
                                <div className="mt-2 text-sm text-gray-400">
                                  {booking.bookingSeats && booking.bookingSeats.length > 0 && (
                                    <span>{booking.bookingSeats.length} seats selected | </span>
                                  )}
                                  {formatCurrency(booking.totalAmount)}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  icon={<Download className="h-4 w-4" />}
                                  onClick={() => toast.success("Ticket downloaded")}
                                >
                                  Download
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  icon={<XCircle className="h-4 w-4" />}
                                  onClick={() => {
                                    cancelBooking.mutate(booking.id);
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </GlassCard>
                        </motion.div>
                      ))
                    )}
                  </div>
                ),
              },
              {
                id: "past",
                label: "Past Bookings",
                content: (
                  <div className="space-y-4">
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-gold-lg" />
                      ))
                    ) : past.length === 0 ? (
                      <GlassCard className="py-12 text-center">
                        <p className="font-serif text-xl text-gray-400">No past bookings</p>
                      </GlassCard>
                    ) : (
                      past.map((booking, i) => (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <GlassCard>
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div>
                                <h3 className="font-serif text-lg font-semibold text-white">
                                  {booking.event?.title || "Event"}
                                </h3>
                                <p className="mt-1 text-sm text-gray-400">
                                  {booking.event?.date ? formatDate(booking.event.date) : formatDate(booking.createdAt)}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                  <Badge variant={statusVariant[booking.status] || "info"} size="sm">
                                    {booking.status}
                                  </Badge>
                                </div>
                                <p className="mt-2 text-sm text-gray-400">
                                  {formatCurrency(booking.totalAmount)}
                                </p>
                              </div>
                            </div>
                          </GlassCard>
                        </motion.div>
                      ))
                    )}
                  </div>
                ),
              },
              {
                id: "profile",
                label: "Profile",
                content: (
                  <GlassCard>
                    <h3 className="mb-6 font-serif text-xl font-semibold text-white">
                      Edit Profile
                    </h3>
                    <div className="space-y-4">
                      <Input
                        label="Full Name"
                        id="profile-name"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                      />
                      <Input
                        label="Email"
                        id="profile-email"
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        disabled
                      />
                      <Input
                        label="Phone"
                        id="profile-phone"
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                      />
                      <Button variant="primary" onClick={() => toast.success("Profile updated")}>
                        Save Changes
                      </Button>
                    </div>
                  </GlassCard>
                ),
              },
              {
                id: "settings",
                label: "Settings",
                content: (
                  <GlassCard>
                    <h3 className="mb-6 font-serif text-xl font-semibold text-white">
                      Preferences
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bell className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-white">Notifications</p>
                            <p className="text-xs text-gray-500">Receive booking updates</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setNotifications(!notifications)}
                          className={`relative h-6 w-11 rounded-full transition-colors ${
                            notifications ? "bg-gold-500" : "bg-white/10"
                          }`}
                        >
                          <motion.div
                            animate={{ x: notifications ? 22 : 2 }}
                            className="mt-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Moon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-white">Dark Mode</p>
                            <p className="text-xs text-gray-500">Toggle dark theme</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setDarkMode(!darkMode)}
                          className={`relative h-6 w-11 rounded-full transition-colors ${
                            darkMode ? "bg-gold-500" : "bg-white/10"
                          }`}
                        >
                          <motion.div
                            animate={{ x: darkMode ? 22 : 2 }}
                            className="mt-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
                          />
                        </button>
                      </div>

                      <hr className="border-white/10" />

                      <div>
                        <Button
                          variant="danger"
                          icon={<AlertTriangle className="h-4 w-4" />}
                          onClick={() => toast.error("Account deletion requested")}
                        >
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                ),
              },
            ]}
          />
        </motion.div>
      </div>
    </div>
  );
}
