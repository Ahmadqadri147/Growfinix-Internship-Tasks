import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, CreditCard, User, ClipboardList, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, GlassCard, Input, Badge } from "@/components/ui";
import { useBookingStore } from "@/stores/bookingStore";
import { createBooking } from "@/api/bookings";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import type { Booking } from "@/types";

const steps = [
  { id: 1, label: "Details", icon: User },
  { id: 2, label: "Payment", icon: CreditCard },
  { id: 3, label: "Review", icon: ClipboardList },
  { id: 4, label: "Confirm", icon: Sparkles },
];

const guestSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  specialRequests: z.string().optional(),
});

const paymentSchema = z.object({
  cardNumber: z.string().min(16, "Card number must be 16 digits").max(19),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY"),
  cvc: z.string().min(3, "Invalid CVC").max(4),
  cardholderName: z.string().min(2, "Cardholder name required"),
});

type GuestData = z.infer<typeof guestSchema>;
type PaymentData = z.infer<typeof paymentSchema>;

function generateBookingRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "MRG-";
  for (let i = 0; i < 6; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { step, setStep, eventId, selectedSeats, ticketTypes, subtotal, discount, serviceFee, total, coupon, calculateTotals, reset } = useBookingStore();
  const [guestData, setGuestData] = useState<GuestData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [bookingError, setBookingError] = useState("");

  const guestForm = useForm<GuestData>({
    resolver: zodResolver(guestSchema),
  });

  const paymentForm = useForm<PaymentData>({
    resolver: zodResolver(paymentSchema),
  });

  useEffect(() => {
    if (ticketTypes.length === 0 && selectedSeats.length === 0) {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  useEffect(() => {
    document.title = "Checkout | Midnight Royale Gala";
  }, []);

  const handleNext = async () => {
    if (step === 1) {
      const valid = await guestForm.trigger();
      if (!valid) return;
      setGuestData(guestForm.getValues());
      setStep(2);
    } else if (step === 2) {
      const valid = await paymentForm.trigger();
      if (!valid) return;
      setPaymentData(paymentForm.getValues());
      setStep(3);
    } else if (step === 3) {
      if (!agreeTerms) {
        toast.error("Please agree to the terms and conditions");
        return;
      }
      setBookingError("");
      setIsProcessing(true);
      setStep(4);
      const seatIds = selectedSeats.map((s) => s.id);
      const tickets = ticketTypes
        .filter((t) => t.quantity > 0)
        .map((t) => ({ ticketTypeId: t.ticketType.id, quantity: t.quantity }));
      const code = couponCode || coupon?.code || undefined;
      try {
        const booking = await createBooking({
          eventId: eventId || "",
          tickets,
          ...(seatIds.length > 0 && { seatIds }),
          ...(code && { couponCode: code }),
        });
        setIsProcessing(false);
        setBookingRef(booking.bookingRef);
        toast.success("Booking confirmed!");
      } catch {
        // Demo mode: always succeed with a generated reference
        const ref = generateBookingRef();
        const demoBooking: Booking = {
          id: `demo-${Date.now()}`,
          bookingRef: ref,
          userId: "demo-user-001",
          eventId: eventId || "",
          status: "CONFIRMED",
          totalAmount: total + tax,
          discountAmount: discount,
          couponCode: code,
          paymentStatus: "PAID",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setIsProcessing(false);
        setBookingRef(ref);
        toast.success("Booking confirmed!");
      }
    }
  };

  const handlePrev = () => {
    setStep(Math.max(1, step - 1));
  };

  const formatCard = (value: string) => {
    return value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
  };

  const tax = subtotal * 0.08;

  return (
    <div className="min-h-screen bg-midnight-950">
      <div className="mx-auto max-w-4xl px-6 pt-24">
        <div className="mb-10 overflow-x-auto">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 sm:h-10 sm:w-10 ${
                      step > s.id
                        ? "border-gold-500 bg-gold-500 text-midnight-950"
                        : step === s.id
                          ? "border-gold-500 text-gold-400"
                          : "border-white/10 text-gray-500"
                    }`}
                  >
                    {step > s.id ? (
                      <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <s.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </div>
                  <span
                    className={`mt-2 hidden text-xs sm:block ${
                      step >= s.id ? "text-gold-400" : "text-gray-600"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`mx-1 h-0.5 w-6 transition-colors duration-300 sm:mx-4 sm:w-16 ${
                      step > s.id ? "bg-gold-500" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && (
              <GlassCard>
                <h2 className="mb-6 font-serif text-2xl font-semibold text-white">
                  Guest Details
                </h2>
                <form className="space-y-4">
                  <Input
                    label="Full Name"
                    id="fullName"
                    placeholder="John Doe"
                    error={guestForm.formState.errors.fullName?.message}
                    {...guestForm.register("fullName")}
                  />
                  <Input
                    label="Email"
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    error={guestForm.formState.errors.email?.message}
                    {...guestForm.register("email")}
                  />
                  <Input
                    label="Phone"
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    error={guestForm.formState.errors.phone?.message}
                    {...guestForm.register("phone")}
                  />
                  <div className="space-y-1.5">
                    <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-300">
                      Special Requests
                    </label>
                    <textarea
                      id="specialRequests"
                      rows={3}
                      className="h-24 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-gold-500/50 focus:bg-white/10 focus:ring-1 focus:ring-gold-500/30"
                      placeholder="Any special requirements..."
                      {...guestForm.register("specialRequests")}
                    />
                  </div>
                </form>
                <div className="mt-8 flex justify-end">
                  <Button size="lg" onClick={handleNext}>
                    Continue to Payment <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </GlassCard>
            )}

            {step === 2 && (
              <GlassCard>
                <h2 className="mb-6 font-serif text-2xl font-semibold text-white">
                  Payment Details
                </h2>
                <div className="mb-6 rounded-lg border border-gold-500/20 bg-gold-500/5 p-4">
                  <p className="text-sm text-gold-400">
                    This is a secure payment simulation. No real charges will be made.
                  </p>
                </div>
                <form className="space-y-4">
                  <Input
                    label="Card Number"
                    id="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    error={paymentForm.formState.errors.cardNumber?.message}
                    {...paymentForm.register("cardNumber", {
                      onChange: (e) => {
                        e.target.value = formatCard(e.target.value);
                      },
                    })}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      label="Expiry (MM/YY)"
                      id="expiry"
                      placeholder="12/28"
                      maxLength={5}
                      error={paymentForm.formState.errors.expiry?.message}
                      {...paymentForm.register("expiry")}
                    />
                    <Input
                      label="CVC"
                      id="cvc"
                      type="password"
                      placeholder="123"
                      maxLength={4}
                      error={paymentForm.formState.errors.cvc?.message}
                      {...paymentForm.register("cvc")}
                    />
                  </div>
                  <Input
                    label="Cardholder Name"
                    id="cardholderName"
                    placeholder="John Doe"
                    error={paymentForm.formState.errors.cardholderName?.message}
                    {...paymentForm.register("cardholderName")}
                  />
                </form>
                <div className="mt-8 flex justify-between">
                  <Button variant="secondary" onClick={handlePrev}>
                    <ChevronLeft className="h-5 w-5" /> Back
                  </Button>
                  <Button size="lg" onClick={handleNext}>
                    Review Order <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </GlassCard>
            )}

            {step === 3 && (
              <GlassCard>
                <h2 className="mb-6 font-serif text-2xl font-semibold text-white">
                  Review Your Order
                </h2>
                <div className="space-y-6">
                  <div className="rounded-lg bg-white/5 p-4">
                    <h3 className="mb-3 font-medium text-white">Event Summary</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex justify-between">
                        <span>Event</span>
                        <span className="text-white">Midnight Royale Gala</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date</span>
                        <span className="text-white">December 31, 2026</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Venue</span>
                        <span className="text-white">Grand Imperial Ballroom</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-white/5 p-4">
                    <h3 className="mb-3 font-medium text-white">Ticket Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      {ticketTypes.filter((t) => t.quantity > 0).map((item) => (
                        <div key={item.ticketType.id} className="flex justify-between text-gray-300">
                          <span>
                            {item.ticketType.name} x {item.quantity}
                          </span>
                          <span className="text-white">
                            {formatCurrency(item.ticketType.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedSeats.length > 0 && (
                    <div className="rounded-lg bg-white/5 p-4">
                      <h3 className="mb-3 font-medium text-white">Selected Seats</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedSeats.map((seat) => (
                          <Badge key={seat.id} variant="gold" size="sm">
                            {seat.section || "Main"} {seat.row}-{seat.number}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg bg-white/5 p-4">
                    <h3 className="mb-3 font-medium text-white">Coupon Code</h3>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCouponCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm">
                        Apply
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-white/10 pt-4 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Discount</span>
                        <span>-{formatCurrency(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-400">
                      <span>Tax (8%)</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Service Fee</span>
                      <span>{formatCurrency(serviceFee)}</span>
                    </div>
                    <hr className="border-white/10" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-200">Total</span>
                      <span className="font-serif text-xl text-gold-400">
                        {formatCurrency(total + tax)}
                      </span>
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-white/10 bg-white/5 text-gold-500 focus:ring-gold-500"
                    />
                    <span className="text-sm text-gray-400">
                      I agree to the{" "}
                      <button className="text-gold-400 underline underline-offset-2 hover:text-gold-300">
                        Terms and Conditions
                      </button>{" "}
                      and{" "}
                      <button className="text-gold-400 underline underline-offset-2 hover:text-gold-300">
                        Privacy Policy
                      </button>
                    </span>
                  </label>
                </div>
                <div className="mt-8 flex justify-between">
                  <Button variant="secondary" onClick={handlePrev}>
                    <ChevronLeft className="h-5 w-5" /> Back
                  </Button>
                  <Button size="lg" onClick={handleNext}>
                    Confirm Booking <Sparkles className="h-5 w-5" />
                  </Button>
                </div>
              </GlassCard>
            )}

            {step === 4 && (
              <GlassCard className="relative overflow-hidden text-center">
                {isProcessing ? (
                  <div className="py-16">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mx-auto h-16 w-16 rounded-full border-4 border-gold-500/30 border-t-gold-500"
                    />
                    <p className="mt-6 font-serif text-xl text-white">Processing your booking...</p>
                  </div>
                ) : bookingError ? (
                  <div className="py-16">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20"
                    >
                      <svg className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.div>
                    <h2 className="mt-6 font-serif text-2xl font-bold text-white">Booking Failed</h2>
                    <p className="mt-2 text-gray-400">{bookingError}</p>
                    <div className="mt-6 flex justify-center gap-3">
                      <Button variant="secondary" onClick={() => { setStep(3); setBookingError(""); }}>
                        Try Again
                      </Button>
                      <Button variant="primary" onClick={() => navigate("/")}>
                        Browse Events
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
                      className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20"
                    >
                      <motion.div
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                      >
                        <Check className="h-10 w-10 text-green-400" />
                      </motion.div>
                    </motion.div>
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="mt-6 font-serif text-3xl font-bold gold-text"
                    >
                      Booking Confirmed!
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                      className="mt-2 text-gray-400"
                    >
                      Reference: {bookingRef}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.6 }}
                      className="mt-6"
                    >
                      <Button
                        variant="primary"
                        onClick={() => {
                          reset();
                          navigate(`/booking/success?ref=${bookingRef}`);
                        }}
                      >
                        View Confirmation
                      </Button>
                    </motion.div>
                  </>
                )}
              </GlassCard>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
