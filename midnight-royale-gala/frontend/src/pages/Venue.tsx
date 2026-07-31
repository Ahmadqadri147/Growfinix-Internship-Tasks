import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, Users, Car, Building2, Wind, Music2, Utensils, Shield, Crown, Maximize, Sofa, ChevronRight,
} from "lucide-react";
import { Button, GlassCard, SectionTitle, Skeleton } from "@/components/ui";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { useEvent } from "@/hooks/useEvents";

const amenities = [
  { icon: Car, label: "Parking" },
  { icon: Building2, label: "Valet" },
  { icon: Wind, label: "Air Conditioning" },
  { icon: Music2, label: "Stage" },
  { icon: Maximize, label: "Sound System" },
  { icon: Utensils, label: "Catering Kitchen" },
  { icon: Crown, label: "VIP Lounge" },
  { icon: Shield, label: "Security" },
];

const capacityStats = [
  { label: "Total Capacity", value: "2,500", icon: Users },
  { label: "Seated Dining", value: "800", icon: Sofa },
  { label: "Standing Reception", value: "1,700", icon: Users },
  { label: "VIP Capacity", value: "200", icon: Crown },
];

export default function Venue() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading, error } = useEvent(id!);

  useEffect(() => {
    document.title = "Venue | Midnight Royale Gala";
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-midnight-950 p-8 pt-24">
        <Skeleton className="h-[50vh] w-full rounded-gold-xl" />
        <div className="mx-auto mt-8 max-w-4xl space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-midnight-950">
        <h1 className="font-serif text-4xl font-bold text-white">Venue Not Found</h1>
        <p className="mt-2 text-gray-400">The venue you're looking for doesn't exist.</p>
        <Button variant="primary" className="mt-6" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" /> Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-950">
      <div className="relative h-[50vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-midnight-900 via-midnight-950 to-black" />
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle at 30% 40%, rgba(212,175,55,0.15) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(212,175,55,0.1) 0%, transparent 50%)",
          }}
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
            className="font-serif text-5xl font-bold gold-text lg:text-6xl"
          >
            {typeof event?.venue === 'string' ? event.venue : event?.venue?.name || "Grand Imperial Ballroom"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-2 flex items-center gap-2 text-gray-400"
          >
            <MapPin className="h-4 w-4 text-gold-400" />
            123 Luxury Avenue, New York
          </motion.p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-20 px-6 py-12">
        <ScrollReveal>
          <section>
            <SectionTitle title="About the Venue" />
            <p className="mx-auto max-w-4xl text-center text-lg leading-relaxed text-gray-300">
              Step into a world of unparalleled elegance at the Grand Imperial Ballroom. 
              Spanning over 20,000 square feet of meticulously designed space, this venue 
              combines classic architecture with modern luxury to create an unforgettable 
              backdrop for the Midnight Royale Gala. Crystal chandeliers, marble floors, 
              and floor-to-ceiling windows overlooking the city skyline set the stage for 
              an extraordinary evening.
            </p>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <section>
            <SectionTitle title="Gallery" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  viewport={{ once: true }}
                  className={`group relative overflow-hidden rounded-gold-lg ${
                    i === 0 ? "col-span-2 row-span-2" : ""
                  } ${i === 3 ? "col-span-2" : ""}`}
                >
                  <div className={`aspect-[4/3] bg-gradient-to-br ${
                    ["from-gold-800/20 via-midnight-800 to-midnight-900",
                     "from-purple-800/20 via-midnight-800 to-midnight-900",
                     "from-blue-800/20 via-midnight-800 to-midnight-900",
                     "from-rose-800/20 via-midnight-800 to-midnight-900",
                     "from-emerald-800/20 via-midnight-800 to-midnight-900",
                     "from-amber-800/20 via-midnight-800 to-midnight-900"][i]
                  }`}>
                    <div className="flex h-full items-center justify-center">
                      <Building2 className="h-12 w-12 text-white/20" />
                    </div>
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="text-sm font-medium text-white">View Gallery</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <section>
            <SectionTitle title="Amenities" subtitle="Everything you need for a perfect event" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {amenities.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                >
                  <GlassCard className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-500/10">
                      <item.icon className="h-5 w-5 text-gold-400" />
                    </div>
                    <span className="font-medium text-white">{item.label}</span>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <section>
            <SectionTitle title="Capacity" subtitle="Space designed for grandeur" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {capacityStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <GlassCard className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/10">
                      <stat.icon className="h-6 w-6 text-gold-400" />
                    </div>
                    <p className="font-serif text-3xl font-bold text-white">{stat.value}</p>
                    <p className="mt-1 text-sm text-gray-400">{stat.label}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <section className="pb-20">
            <SectionTitle title="Location" />
            <GlassCard className="relative mx-auto h-80 w-full max-w-5xl overflow-hidden">
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-midnight-800 to-midnight-950">
                <div className="text-center">
                  <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <MapPin className="mx-auto h-12 w-12 text-gold-400" />
                  </motion.div>
                  <p className="mt-4 font-serif text-2xl font-semibold text-white">
                    Grand Imperial Ballroom
                  </p>
                  <p className="mt-2 text-gray-400">123 Luxury Avenue, New York</p>
                </div>
              </div>
            </GlassCard>
            <div className="mt-8 text-center">
              <Button size="lg" onClick={() => navigate(`/events/${id}/tickets`)}>
                Book This Venue <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
}
