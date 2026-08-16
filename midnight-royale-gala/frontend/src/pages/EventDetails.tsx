import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Clock, Star, Music, Wine, Sparkles, Users } from "lucide-react";
import { Button, GlassCard, SectionTitle, Badge, Skeleton } from "@/components/ui";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { useEvent } from "@/hooks/useEvents";
import { formatDate, formatCurrency } from "@/lib/utils";

const highlightIcons = [
  { icon: Star, label: "World-Class Performances" },
  { icon: Music, label: "Live Orchestra" },
  { icon: Wine, label: "Champagne Reception" },
  { icon: Sparkles, label: "Fireworks Display" },
  { icon: Users, label: "Exclusive VIP Lounge" },
];

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading, error } = useEvent(id!);

  useEffect(() => {
    if (event) document.title = `${event.title} | Midnight Royale Gala`;
  }, [event]);

  if (isLoading) {
    return (
      <div className="min-h-screen space-y-8 bg-midnight-950 p-8 pt-24">
        <Skeleton className="h-[60vh] w-full rounded-gold-xl" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-6 w-1/3" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-midnight-950">
        <h1 className="font-serif text-4xl font-bold text-white">Event Not Found</h1>
        <p className="mt-2 text-gray-400">The event you're looking for doesn't exist.</p>
        <Button variant="primary" className="mt-6" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" /> Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-950">
      <div className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-900/40 via-midnight-900 to-midnight-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent" />
        <motion.div
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"
        />
        <button
          onClick={() => navigate(-1)}
          className="absolute left-6 top-24 z-10 flex items-center gap-2 rounded-lg bg-black/40 px-4 py-2 text-sm text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-midnight-950 to-transparent p-8">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-serif text-3xl font-bold gold-text sm:text-4xl md:text-5xl lg:text-7xl"
          >
            {event.title}
          </motion.h1>
        </div>
      </div>

      <div className="sticky top-16 z-30 border-b border-white/10 bg-midnight-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3 text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gold-400" />
            {formatDate(event.date)}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gold-400" />
            {event.time}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gold-400" />
            {typeof event.venue === 'string' ? event.venue : event.venue?.name || "Venue"}
          </div>
          <div className="ml-auto">
            <Button size="sm" onClick={() => navigate(`/events/${event.id}/tickets`)}>
              Book Now
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-20 px-6 py-12">
        <ScrollReveal>
          <section>
            <SectionTitle title="About the Event" subtitle={event.description?.slice(0, 120)} />
            <div className="mx-auto max-w-4xl text-center text-lg leading-relaxed text-gray-300">
              {event.description}
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <section>
            <SectionTitle title="Highlights" subtitle="What awaits you" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {highlightIcons.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <GlassCard className="flex flex-col items-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold-500/10">
                      <item.icon className="h-7 w-7 text-gold-400" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-white">{item.label}</h3>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <section>
            <SectionTitle title="Gallery" subtitle="A glimpse into the grandeur" />
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative aspect-[4/3] overflow-hidden rounded-gold-lg"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${
                    ["from-gold-800/30 via-midnight-800 to-midnight-900",
                     "from-purple-800/30 via-midnight-800 to-midnight-900",
                     "from-blue-800/30 via-midnight-800 to-midnight-900",
                     "from-rose-800/30 via-midnight-800 to-midnight-900"][i]
                  }`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-gold-400/50" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </motion.div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <section>
            <SectionTitle title="Ticket Types" subtitle="Choose your experience" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {event.ticketTypes?.map((ticket, i) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <GlassCard hover glow={i === 0}>
                    <Badge variant={i === 0 ? "gold" : "info"} className="mb-3">
                      {ticket.name}
                    </Badge>
                    <p className="mb-2 font-serif text-3xl font-bold text-white">
                      {formatCurrency(ticket.price)}
                    </p>
                    <p className="text-sm text-gray-400">{ticket.description}</p>
                    <p className="mt-3 text-xs text-gray-500">
                      {ticket.available} / {ticket.quantity} available
                    </p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <section className="pb-20">
            <SectionTitle title="Venue Information" />
            <GlassCard className="mx-auto max-w-2xl">
              <div className="flex items-center gap-4">
                <MapPin className="h-8 w-8 text-gold-400" />
                <div>
                  <h3 className="font-serif text-xl font-semibold text-white">
                    {typeof event.venue === 'string' ? event.venue : event.venue?.name || "Grand Imperial Ballroom"}
                  </h3>
                  <p className="mt-1 text-gray-400">
                    {typeof event.venue === 'object' && event.venue ? `${event.venue.address || '123 Luxury Avenue'}, ${event.venue.city || 'New York'}` : "Grand Imperial Ballroom, 123 Luxury Avenue"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                <Users className="h-4 w-4" />
                Capacity: {typeof event.venue === "object" && event.venue ? ("capacity" in event.venue ? event.venue.capacity.toLocaleString() : "500") : "500"} guests
              </div>
            </GlassCard>
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
}
