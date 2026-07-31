import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import SectionTitle from "@/components/ui/SectionTitle";
import ScrollReveal from "@/components/animations/ScrollReveal";

interface Tier {
  name: string;
  price: string;
  accent: string;
  benefits: string[];
  featured?: boolean;
}

const tiers: Tier[] = [
  {
    name: "Silver",
    price: "$200",
    accent: "text-gray-400",
    benefits: [
      "Standard Entry",
      "Welcome Drink",
      "Canapés",
      "Live Music Access",
    ],
  },
  {
    name: "Gold",
    price: "$500",
    accent: "text-gold-400",
    benefits: [
      "Priority Entry",
      "Champagne Reception",
      "Gourmet Dinner",
      "Live Music",
      "Celebrity Access",
      "Gift Bag",
    ],
  },
  {
    name: "Diamond",
    price: "$1,000",
    accent: "text-blue-300",
    featured: true,
    benefits: [
      "All Gold Benefits",
      "VIP Seating",
      "Private Butler",
      "Exclusive After-Party",
    ],
  },
  {
    name: "VIP",
    price: "$2,500",
    accent: "text-purple-400",
    benefits: [
      "All Diamond Benefits",
      "Private Suite",
      "Limousine Service",
      "Personal Concierge",
      "Meet & Greet",
    ],
  },
];

export default function TicketPreview() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-midnight-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.03),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionTitle
            title="Choose Your Experience"
            subtitle="Select the tier that matches your expectations of luxury"
            align="center"
          />
        </ScrollReveal>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {tiers.map((tier, index) => (
            <ScrollReveal
              key={tier.name}
              direction="up"
              delay={index * 0.1}
            >
              <div className="relative h-full">
                {/* "Most Popular" badge */}
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gold-500 blur-sm rounded-full" />
                      <span className="relative inline-block px-4 py-1 bg-gold-gradient text-midnight-950 text-xs font-bold tracking-wider uppercase rounded-full">
                        Most Popular
                      </span>
                    </div>
                  </div>
                )}

                <GlassCard
                  glow={tier.featured}
                  className={`h-full flex flex-col ${
                    tier.featured
                      ? "border-gold-500/40"
                      : "border-gold-500/10"
                  }`}
                >
                  <div className="flex flex-col h-full">
                    {/* Tier header */}
                    <div className="text-center pb-6 border-b border-white/5">
                      <h3
                        className={`font-serif text-2xl font-bold gold-text ${
                          tier.featured ? "text-3xl" : ""
                        }`}
                      >
                        {tier.name}
                      </h3>
                      <p
                        className={`mt-4 font-serif text-4xl sm:text-5xl font-bold text-white`}
                      >
                        {tier.price}
                      </p>
                    </div>

                    {/* Benefits */}
                    <ul className="flex-1 space-y-3 py-6 px-2">
                      {tier.benefits.map((benefit) => (
                        <li
                          key={benefit}
                          className="flex items-start gap-3 text-sm"
                        >
                          <Check
                            className={`h-4 w-4 mt-0.5 shrink-0 ${
                              tier.featured
                                ? "text-gold-400"
                                : "text-gray-400"
                            }`}
                          />
                          <span className="text-gray-300">{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="pt-4">
                      <Link to="/events/1/tickets" className="block w-full">
                        <Button
                          variant={tier.featured ? "primary" : "outline"}
                          className="w-full"
                        >
                          Select <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
