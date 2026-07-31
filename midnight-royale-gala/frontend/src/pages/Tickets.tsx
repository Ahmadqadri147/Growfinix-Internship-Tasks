import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Star, Diamond, Zap, Check, Minus, Plus, ArrowLeft, ChevronRight } from "lucide-react";
import { Button, GlassCard, Badge, Skeleton } from "@/components/ui";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { useEvent } from "@/hooks/useEvents";
import { useBookingStore } from "@/stores/bookingStore";
import { formatCurrency } from "@/lib/utils";
import type { TicketType } from "@/types";

const tierIcons = [Diamond, Crown, Star, Zap];
const tierColors = ["from-yellow-400 to-amber-600", "from-purple-400 to-purple-600", "from-blue-400 to-blue-600", "from-gray-400 to-gray-600"];

const allBenefits = [
  "General Admission",
  "Premium Seating",
  "Champagne Reception",
  "VIP Lounge Access",
  "Private Balcony",
  "Complimentary Valet",
  "Meet & Greet Pass",
  "Personal Concierge",
];

const tierBenefits: string[][] = [
  allBenefits,
  allBenefits.slice(0, 6),
  allBenefits.slice(0, 4),
  allBenefits.slice(0, 2),
];

export default function Tickets() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading, error } = useEvent(id!);
  const { ticketTypes, setTicketQuantity, setEventId, subtotal } = useBookingStore();

  useEffect(() => {
    if (id) setEventId(id);
    if (event) document.title = `Tickets | ${event.title} | Midnight Royale Gala`;
  }, [id, event, setEventId]);

  const getQuantity = (ticketId: string) =>
    ticketTypes.find((t) => t.ticketType.id === ticketId)?.quantity || 0;

  const totalTickets = ticketTypes.reduce((sum, t) => sum + t.quantity, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-midnight-950 p-8 pt-24">
        <Skeleton className="h-10 w-64" />
        <div className="mt-8 grid gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-midnight-950">
        <h1 className="font-serif text-4xl font-bold text-white">Event Not Found</h1>
        <Button variant="primary" className="mt-6" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" /> Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-950">
      <div className="mx-auto max-w-7xl px-6 pt-24">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Event
        </button>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-serif text-4xl font-bold gold-text"
        >
          Select Tickets
        </motion.h1>
        <p className="mt-2 text-gray-400">{event.title}</p>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-12">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {event.ticketTypes?.map((ticket: TicketType, i: number) => {
                const Icon = tierIcons[i] || Zap;
                const quantity = getQuantity(ticket.id);
                return (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  >
                    <GlassCard
                      hover
                      glow={i === 0}
                      className="relative flex h-full flex-col"
                    >
                      <div className={`absolute inset-x-0 top-0 h-1 rounded-t-gold-lg bg-gradient-to-r ${tierColors[i]}`} />
                      <div className="mb-4 flex items-center justify-between">
                        <Badge variant={i === 0 ? "gold" : "info"}>
                          {ticket.name}
                        </Badge>
                        <Icon className="h-5 w-5 text-gold-400" />
                      </div>
                      <div className="mb-4">
                        <span className="font-serif text-3xl font-bold text-white">
                          {formatCurrency(ticket.price)}
                        </span>
                        {ticket.originalPrice && (
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            {formatCurrency(ticket.originalPrice)}
                          </span>
                        )}
                      </div>
                      <p className="mb-4 text-sm text-gray-400">{ticket.description}</p>
                      <ul className="mb-6 flex-1 space-y-2">
                        {(tierBenefits[i] || allBenefits.slice(0, 2)).map((benefit) => (
                          <li key={benefit} className="flex items-center gap-2 text-sm text-gray-300">
                            <Check className="h-4 w-4 text-green-400" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-auto space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {ticket.available} left
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setTicketQuantity(ticket.id, Math.max(0, quantity - 1))}
                              disabled={quantity === 0}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition-colors hover:border-gold-500/30 hover:text-gold-400 disabled:opacity-30"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-medium text-white">
                              {quantity}
                            </span>
                            <button
                              onClick={() => setTicketQuantity(ticket.id, quantity + 1)}
                              disabled={quantity >= ticket.available}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition-colors hover:border-gold-500/30 hover:text-gold-400 disabled:opacity-30"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>

            <ScrollReveal>
              <section>
                <h2 className="mb-6 font-serif text-2xl font-bold text-white">
                  Compare Ticket Tiers
                </h2>
                <div className="overflow-x-auto rounded-gold-lg border border-white/10">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="px-4 py-3 font-medium text-gray-400">Benefit</th>
                        {event.ticketTypes?.map((t: TicketType) => (
                          <th key={t.id} className="px-4 py-3 font-medium text-gray-400">
                            {t.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {allBenefits.map((benefit) => (
                        <tr key={benefit} className="transition-colors hover:bg-white/5">
                          <td className="px-4 py-3 text-gray-300">{benefit}</td>
                          {event.ticketTypes?.map((t: TicketType) => (
                            <td key={t.id} className="px-4 py-3">
                              {(tierBenefits[event.ticketTypes.indexOf(t)] || []).includes(benefit) ? (
                                <Check className="h-4 w-4 text-green-400" />
                              ) : (
                                <span className="text-gray-600">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr className="border-t border-white/10 bg-white/5">
                        <td className="px-4 py-3 font-medium text-gray-300">Price</td>
                        {event.ticketTypes?.map((t: TicketType) => (
                          <td key={t.id} className="px-4 py-3 font-semibold text-white">
                            {formatCurrency(t.price)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </ScrollReveal>
          </div>

          <div className="lg:w-80">
            <div className="sticky top-24">
              <GlassCard>
                <h3 className="mb-4 font-serif text-lg font-semibold text-white">
                  Your Selection
                </h3>
                {totalTickets === 0 ? (
                  <p className="text-sm text-gray-500">No tickets selected yet</p>
                ) : (
                  <div className="space-y-3">
                    {ticketTypes.filter((t) => t.quantity > 0).map((item) => (
                      <div key={item.ticketType.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">
                          {item.ticketType.name} × {item.quantity}
                        </span>
                        <span className="text-white">
                          {formatCurrency(item.ticketType.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                    <hr className="border-white/10" />
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-gray-300">Total</span>
                      <span className="font-serif text-xl text-gold-400">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    <Button
                      className="w-full"
                      size="lg"
                      disabled={totalTickets === 0}
                      onClick={() => navigate(`/events/${id}/seats`)}
                    >
                      Proceed to Seat Selection <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
