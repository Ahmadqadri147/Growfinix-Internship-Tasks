import { Link } from "react-router-dom";
import { MapPin, Users, Building } from "lucide-react";
import { Button } from "@/components/ui/Button";
import ParallaxSection from "@/components/animations/ParallaxSection";
import ScrollReveal from "@/components/animations/ScrollReveal";

const stats = [
  { icon: Building, label: "10,000 sq ft", sub: "Grand Ballroom" },
  { icon: Users, label: "500+ Guests", sub: "Capacity" },
  { icon: MapPin, label: "City Center", sub: "Location" },
];

export default function VenuePreview() {
  return (
    <ParallaxSection className="relative py-32 sm:py-40 overflow-hidden bg-midnight-900">
      {/* Background with golden mesh pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-midnight-950 via-midnight-900 to-midnight-950" />
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212, 175, 55, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 175, 55, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_60%)] pointer-events-none" />

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-[10%] w-64 h-64 rounded-full border border-gold-500/10 animate-float" />
      <div className="absolute bottom-1/4 right-[15%] w-48 h-48 rounded-full border border-gold-500/10 animate-float" style={{ animationDelay: "1.5s" }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <span className="inline-block font-sans text-sm tracking-[0.3em] uppercase text-gold-400 mb-4">
            The Venue
          </span>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Grand Imperial Ballroom
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <p className="max-w-2xl mx-auto text-gray-400 text-base sm:text-lg leading-relaxed mb-10">
            Located in the heart of the city, the Grand Imperial Ballroom offers
            unparalleled luxury with its soaring crystal chandeliers, marble
            floors, and panoramic views of the city skyline. Every corner of
            this magnificent venue has been designed to inspire awe.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.45}>
          <Link to="/events/1/venue">
            <Button variant="outline" size="lg">
              View Venue Details
            </Button>
          </Link>
        </ScrollReveal>

        {/* Stats row */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <ScrollReveal
                key={stat.label}
                direction="up"
                delay={0.5 + index * 0.1}
              >
                <div className="flex flex-col items-center gap-3 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/10 border border-gold-500/20">
                    <Icon className="h-6 w-6 text-gold-400" />
                  </div>
                  <div>
                    <p className="font-serif text-2xl font-bold text-white">
                      {stat.label}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{stat.sub}</p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </ParallaxSection>
  );
}
