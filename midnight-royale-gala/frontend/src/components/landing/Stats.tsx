import {
  Users,
  Layout,
  Star,
  Briefcase,
  DollarSign,
  type LucideIcon,
} from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import ScrollReveal from "@/components/animations/ScrollReveal";

interface Stat {
  icon: LucideIcon;
  target: number;
  label: string;
  suffix?: string;
  prefix?: string;
}

const stats: Stat[] = [
  { icon: Users, target: 500, label: "Guests", suffix: "+" },
  { icon: Layout, target: 200, label: "VIP Tables" },
  { icon: Star, target: 50, label: "Artists", suffix: "+" },
  { icon: Briefcase, target: 30, label: "Sponsors" },
  { icon: DollarSign, target: 5, label: "Budget", prefix: "$", suffix: "M+" },
];

export default function Stats() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-midnight-950">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-midnight-950 via-midnight-900 to-gold-500/5 animate-aurora bg-[length:400%_400%] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionTitle
            title="By the Numbers"
            subtitle="The scale of Midnight Royale Gala"
            align="center"
          />
        </ScrollReveal>

        <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <ScrollReveal
                key={stat.label}
                direction="up"
                delay={index * 0.1}
              >
                <div className="flex flex-col items-center text-center p-6">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold-500/10 border border-gold-500/20">
                    <Icon className="h-6 w-6 text-gold-400" />
                  </div>
                  <AnimatedCounter
                    target={stat.target}
                    suffix={stat.suffix ?? ""}
                    prefix={stat.prefix ?? ""}
                    className="font-serif text-3xl sm:text-4xl font-bold gold-text"
                  />
                  <p className="mt-2 text-sm text-gray-300 font-medium">
                    {stat.label}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
