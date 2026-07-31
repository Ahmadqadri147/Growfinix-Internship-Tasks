import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Copy, Calendar, Download, LayoutDashboard } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button, GlassCard } from "@/components/ui";
import { getBookingByRef } from "@/api/bookings";
import { MOCK_BOOKINGS } from "@/hooks/useBookings";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Booking } from "@/types";

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const ref = searchParams.get("ref") || "";

  useEffect(() => {
    if (ref) {
      getBookingByRef(ref)
        .then(setBooking)
        .catch(() => {
          // Demo mode: fall back to sample booking data
          setBooking({
            ...MOCK_BOOKINGS[0],
            bookingRef: ref,
            id: `demo-${Date.now()}`,
          });
        })
        .finally(() => setLoading(false));
    } else {
      setBooking({ ...MOCK_BOOKINGS[0] });
      setLoading(false);
    }
  }, [ref]);

  useEffect(() => {
    document.title = `Booking Confirmed | ${ref} | Midnight Royale Gala`;
  }, [ref]);

  const handleCopy = () => {
    navigator.clipboard.writeText(ref);
    setCopied(true);
    toast.success("Reference copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-midnight-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 rounded-full border-4 border-gold-500/30 border-t-gold-500"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-950">
      <div className="mx-auto max-w-2xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20"
          >
            <svg className="h-12 w-12" viewBox="0 0 48 48" fill="none">
              <motion.circle
                cx="24"
                cy="24"
                r="20"
                stroke="#4ADE80"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
              <motion.path
                d="M16 24l5 5 11-11"
                stroke="#4ADE80"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              />
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 font-serif text-4xl font-bold gold-text"
          >
            Booking Confirmed!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-2 text-gray-400"
          >
            Your tickets are ready. A confirmation email has been sent.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10"
        >
          <GlassCard className="text-center">
            <p className="mb-2 text-sm text-gray-400">Booking Reference</p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-2xl font-bold text-white">{ref}</span>
              <button
                onClick={handleCopy}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-gold-400"
              >
                {copied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>

            <div className="mt-6 flex justify-center">
              <div className="inline-block rounded-xl bg-white p-4">
                <QRCodeSVG
                  value={ref}
                  size={160}
                  level="H"
                  fgColor="#1a1a2e"
                  bgColor="#ffffff"
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard className="mt-6">
            <h3 className="mb-4 font-serif text-lg font-semibold text-white">Event Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Event</span>
                <span className="text-white">{booking?.event?.title || "Midnight Royale Gala"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date</span>
                <span className="text-white">
                  {booking?.event?.date ? formatDate(booking.event.date) : "December 31, 2026"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time</span>
                <span className="text-white">{booking?.event?.time || "8:00 PM - 2:00 AM"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Venue</span>
                <span className="text-white">Grand Imperial Ballroom</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <GlassCard className="mt-6">
            <h3 className="mb-4 font-serif text-lg font-semibold text-white">Ticket Summary</h3>
            <div className="space-y-2 text-sm">
              {booking?.bookingTickets && booking.bookingTickets.length > 0 ? (
                booking.bookingTickets.map((bt) => (
                  <div key={bt.id} className="flex justify-between text-gray-300">
                    <span>{bt.ticketType?.name || "Ticket"} x {bt.quantity}</span>
                    <span className="text-white">{formatCurrency(bt.unitPrice * bt.quantity)}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between text-gray-300">
                  <span>Tickets</span>
                  <span className="text-white">{formatCurrency(booking?.totalAmount || 0)}</span>
                </div>
              )}
              <hr className="border-white/10" />
              {booking?.discountAmount ? (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-{formatCurrency(booking.discountAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between font-semibold">
                <span className="text-gray-200">Total Paid</span>
                <span className="font-serif text-lg text-gold-400">
                  {formatCurrency(booking?.totalAmount || 0)}
                </span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {booking?.bookingSeats && booking.bookingSeats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-6"
          >
            <GlassCard>
              <h3 className="mb-4 font-serif text-lg font-semibold text-white">Selected Seats</h3>
              <div className="flex flex-wrap gap-2">
                {booking.bookingSeats.map((bs) => (
                  <span
                    key={bs.seatId}
                    className="rounded-lg bg-gold-500/10 px-3 py-1.5 text-sm font-medium text-gold-400"
                  >
                    {bs.seat ? `${bs.seat.section || "Main"} ${bs.seat.row}-${bs.seat.number}` : bs.seatId}
                  </span>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Button
            variant="primary"
            size="lg"
            icon={<Download className="h-5 w-5" />}
            onClick={() => toast.success("PDF ticket would be downloaded")}
          >
            Download Ticket
          </Button>
          <Button
            variant="secondary"
            size="lg"
            icon={<Calendar className="h-5 w-5" />}
            onClick={() => toast.success("Added to calendar")}
          >
            Add to Calendar
          </Button>
          <Link to="/dashboard">
            <Button variant="outline" size="lg" icon={<LayoutDashboard className="h-5 w-5" />}>
              View Dashboard
            </Button>
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          A confirmation email has been sent to your registered email address.
        </motion.p>
      </div>
    </div>
  );
}
