import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, ZoomIn, ZoomOut, Clock, ChevronRight } from "lucide-react";
import { Button, GlassCard, Badge, Input, Skeleton } from "@/components/ui";
import { useEventSeats, useLockSeat, useReleaseSeat } from "@/hooks/useSeats";
import { useEvent } from "@/hooks/useEvents";
import { useSocket } from "@/hooks/useSocket";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useBookingStore } from "@/stores/bookingStore";
import { formatCurrency } from "@/lib/utils";
import type { Seat } from "@/types";

const tierLabels: Record<string, string> = {
  VIP: "VIP",
  DIAMOND: "Diamond",
  GOLD: "Gold",
  SILVER: "Silver",
};

export default function SeatSelection() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { data: event, isLoading: eventLoading } = useEvent(id!);
  const { data: seats = [], isLoading: seatsLoading } = useEventSeats(id!);
  const lockSeat = useLockSeat(id!);
  const releaseSeat = useReleaseSeat(id!);
  const { selectedSeats, addSeat, removeSeat, subtotal: ticketSubtotal } = useBookingStore();
  const socket = useSocket(id);

  const [zoom, setZoom] = useState(1);
  const [timeLeft, setTimeLeft] = useState(600);
  const [coupon, setCoupon] = useState("");

  useEffect(() => {
    if (event) document.title = `Select Seats | ${event.title}`;
  }, [event]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 120;

  const rows = "ABCDEFGHIJ".split("").slice(0, 10);
  const maxSeats = Math.max(...seats.map((s: Seat) => s.number), 20);
  const cols = Array.from({ length: maxSeats }, (_, i) => i + 1);

  const handleSeatClick = useCallback(
    (seat: Seat) => {
      if (seat.status === "BOOKED" || seat.status === "RESERVED" || seat.status === "locked") return;
      const isSelected = selectedSeats.find((s) => s.id === seat.id);
      if (isSelected) {
        removeSeat(seat.id);
        releaseSeat.mutate({ seatId: seat.id, sessionId: seat.lockedBy || "" });
      } else {
        addSeat(seat);
        lockSeat.mutate(seat.id);
      }
    },
    [selectedSeats, addSeat, removeSeat, lockSeat, releaseSeat],
  );

  const getSeatColor = (seat: Seat) => {
    const isSelected = selectedSeats.find((s) => s.id === seat.id);
    if (isSelected) return "bg-gold-500 border-gold-400 shadow-gold-sm";
    if (seat.status === "BOOKED") return "bg-red-900/50 border-red-700/50 cursor-not-allowed";
    if (seat.status === "RESERVED") return "bg-gray-800/50 border-gray-700/50 cursor-not-allowed";
    const tier = seat.tier;
    if (tier === "VIP") return "bg-yellow-900/30 border-yellow-600/40 hover:bg-yellow-800/40";
    if (tier === "DIAMOND") return "bg-purple-900/30 border-purple-600/40 hover:bg-purple-800/40";
    if (tier === "GOLD") return "bg-blue-900/30 border-blue-600/40 hover:bg-blue-800/40";
    return "bg-gray-700/30 border-gray-500/40 hover:bg-gray-600/40";
  };

  if (eventLoading || seatsLoading) {
    return (
      <div className="min-h-screen bg-midnight-950 p-8 pt-24">
        <Skeleton className="h-10 w-64" />
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr,320px]">
          <Skeleton className="h-[500px] w-full" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-950">
      <div className="mx-auto max-w-7xl px-6 pt-24">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 text-sm ${isUrgent ? "text-red-400" : "text-gray-400"}`}>
              <Clock className="h-4 w-4" />
              <span className="font-mono">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition-colors hover:border-gold-500/30 hover:text-gold-400"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-xs text-gray-500">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition-colors hover:border-gold-500/30 hover:text-gold-400"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1">
            <GlassCard className="overflow-auto p-4 sm:p-6">
              <div
                className="mx-auto min-w-[560px] origin-top-center transition-transform duration-200"
                style={{ transform: `scale(${zoom})` }}
              >
                <div className="mb-8 flex justify-center">
                  <div className="w-3/4 rounded-t-2xl border border-white/10 bg-white/5 py-2 text-center text-xs text-gray-500">
                    STAGE
                  </div>
                </div>
                <div className="grid grid-cols-[30px_repeat(20,1fr)_30px]" style={{ gap: "3px" }}>
                  <div />
                  {cols.slice(0, 20).map((c) => (
                    <div key={c} className="text-center text-[10px] text-gray-600">
                      {c}
                    </div>
                  ))}
                  <div />
                  {rows.map((row) => (
                    <>
                      <div key={row} className="flex items-center text-[10px] text-gray-600">
                        {row}
                      </div>
                      {cols.slice(0, 20).map((col) => {
                        const seat = seats.find(
                          (s: Seat) => s.row === row && s.number === col,
                        );
                        const isSelected = seat && selectedSeats.find((s) => s.id === seat.id);
                        const status = seat ? (isSelected ? "selected" : seat.status === "BOOKED" ? "booked" : seat.status === "RESERVED" ? "locked" : "available") : "available";
                        return (
                          <div
                            key={`${row}-${col}`}
                            onClick={() => seat && handleSeatClick(seat)}
                            className={`aspect-square cursor-pointer rounded border text-[8px] transition-all duration-150 ${
                              status === "selected"
                                ? "border-gold-400 bg-gold-500 shadow-gold-sm"
                                : status === "booked"
                                  ? "cursor-not-allowed border-red-700/50 bg-red-900/50"
                                  : status === "locked"
                                    ? "cursor-not-allowed border-gray-700/50 bg-gray-800/50"
                                    : "border-gold-500/20 bg-white/5 hover:bg-gold-500/20 hover:border-gold-500/40"
                            }`}
                          >
                            {status === "locked" && (
                              <Lock className="h-full w-full p-0.5 text-gray-600" />
                            )}
                          </div>
                        );
                      })}
                      <div className="flex items-center text-[10px] text-gray-600">
                        {row}
                      </div>
                    </>
                  ))}
                  <div />
                  {cols.slice(0, 20).map((c) => (
                    <div key={c} className="text-center text-[10px] text-gray-600">
                      {c}
                    </div>
                  ))}
                  <div />
                </div>
              </div>
            </GlassCard>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="h-3 w-3 rounded border border-gold-500/20 bg-white/5" />
                Available
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="h-3 w-3 rounded border border-gold-400 bg-gold-500" />
                Selected
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="h-3 w-3 rounded border border-red-700/50 bg-red-900/50" />
                Booked
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="flex h-3 w-3 items-center justify-center rounded border border-gray-700/50 bg-gray-800/50">
                  <Lock className="h-2 w-2" />
                </div>
                Reserved
              </div>
              <div className="ml-auto flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-gray-400">
                  <div className="h-2 w-2 rounded bg-yellow-900/30 border border-yellow-600/40" />
                  VIP
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                  <div className="h-2 w-2 rounded bg-purple-900/30 border border-purple-600/40" />
                  Diamond
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                  <div className="h-2 w-2 rounded bg-blue-900/30 border border-blue-600/40" />
                  Gold
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                  <div className="h-2 w-2 rounded bg-gray-700/30 border border-gray-500/40" />
                  Silver
                </span>
              </div>
            </div>
          </div>

          <div className="lg:w-80">
            <div className="sticky top-24">
              <GlassCard>
                <h3 className="mb-4 font-serif text-lg font-semibold text-white">
                  Your Seats
                </h3>
                {selectedSeats.length === 0 ? (
                  <p className="text-sm text-gray-500">Click on a seat to select it</p>
                ) : (
                  <div className="space-y-3">
                    <div className="max-h-48 space-y-2 overflow-y-auto">
                      {selectedSeats.map((seat) => (
                        <div
                          key={seat.id}
                          className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
                        >
                          <div>
                            <span className="text-sm font-medium text-white">
                              Row {seat.row} - {seat.number}
                            </span>
                            <Badge variant={seat.tier === "VIP" ? "gold" : "info"} size="sm" className="ml-2">
                              {tierLabels[seat.tier] || seat.tier}
                            </Badge>
                          </div>
                          <span className="text-sm text-gold-400">
                            {formatCurrency(seat.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <hr className="border-white/10" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Seats ({selectedSeats.length})</span>
                      <span className="text-white">
                        {formatCurrency(selectedSeats.reduce((s, seat) => s + seat.price, 0))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Tickets</span>
                      <span className="text-white">{formatCurrency(ticketSubtotal)}</span>
                    </div>
                    <hr className="border-white/10" />
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Total</span>
                      <span className="font-serif text-xl font-bold text-gold-400">
                        {formatCurrency(
                          ticketSubtotal + selectedSeats.reduce((s, seat) => s + seat.price, 0),
                        )}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Coupon code"
                        value={coupon}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoupon(e.target.value)}
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm" className="shrink-0">
                        Apply
                      </Button>
                    </div>
                    {isUrgent && (
                      <p className="text-center text-xs text-red-400">
                        Seats will auto-release in {minutes}:{String(seconds).padStart(2, "0")}
                      </p>
                    )}
                    <Button
                      className="w-full"
                      size="lg"
                      disabled={selectedSeats.length === 0}
                      onClick={() => navigate(`/checkout`)}
                    >
                      Confirm Seats <ChevronRight className="h-5 w-5" />
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
