import {
  Music,
  Star,
  ChefHat,
  Gift,
  Sparkles,
  Handshake,
  type LucideIcon,
} from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";
import GlassCard from "@/components/ui/GlassCard";
import ScrollReveal from "@/components/animations/ScrollReveal";

interface Highlight {
  icon: LucideIcon;
  title: string;
  description: string;
}

const highlights: Highlight[] = [
  {
    icon: Music,
    title: "Live Orchestra",
    description:
      "The world's finest philharmonic orchestra performing exclusive compositions",
  },
  {
    icon: Star,
    title: "Celebrity Guests",
    description:
      "A-list celebrities and industry icons from around the globe",
  },
  {
    icon: ChefHat,
    title: "Premium Dining",
    description:
      "Michelin-starred cuisine crafted by world-renowned chefs",
  },
  {
    icon: Gift,
    title: "Luxury Gifts",
    description:
      "Curated luxury gift bags worth over $5,000 for every guest",
  },
  {
    icon: Sparkles,
    title: "Fireworks Display",
    description:
      "Spectacular fireworks choreographed to a live symphony",
  },
  {
    icon: Handshake,
    title: "VIP Networking",
    description:
      "Exclusive networking opportunities with industry leaders",
  },
];

export default function Highlights() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-midnight-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.05),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionTitle
            title="Event Highlights"
            subtitle="Experience the extraordinary"
            align="center"
          />
        </ScrollReveal>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <ScrollReveal
                key={item.title}
                direction="up"
                delay={index * 0.1}
              >
                <GlassCard glow className="group h-full">
                  <div className="flex flex-col items-center text-center p-2">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/10 border border-gold-500/20 group-hover:bg-gold-500/20 transition-colors duration-500">
                      <Icon className="h-7 w-7 text-gold-400" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </GlassCard>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
