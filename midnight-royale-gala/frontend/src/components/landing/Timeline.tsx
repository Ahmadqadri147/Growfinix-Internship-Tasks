import { useEffect, useRef } from "react";
import {
  Stars,
  Wine,
  Music,
  UtensilsCrossed,
  Mic,
  Sparkles,
  Clock,
  type LucideIcon,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionTitle from "@/components/ui/SectionTitle";
import ScrollReveal from "@/components/animations/ScrollReveal";

gsap.registerPlugin(ScrollTrigger);

interface TimelineItem {
  time: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const timelineData: TimelineItem[] = [
  {
    time: "7:00 PM",
    title: "Red Carpet Arrival",
    description:
      "Guests arrive in style with a grand entrance and professional photography",
    icon: Stars,
  },
  {
    time: "7:30 PM",
    title: "Welcome Champagne",
    description:
      "Exquisite champagne reception with live harp music in the grand foyer",
    icon: Wine,
  },
  {
    time: "8:00 PM",
    title: "Live Orchestra Performance",
    description:
      "The philharmonic opens the evening with a stirring overture",
    icon: Music,
  },
  {
    time: "8:45 PM",
    title: "Gourmet Dinner Service",
    description:
      "A six-course culinary masterpiece prepared by Michelin-starred chefs",
    icon: UtensilsCrossed,
  },
  {
    time: "9:30 PM",
    title: "Celebrity Performances",
    description:
      "Exclusive live performances by internationally acclaimed artists",
    icon: Mic,
  },
  {
    time: "10:15 PM",
    title: "Fireworks Display",
    description:
      "A breathtaking pyrotechnic spectacle synchronized to a live symphony",
    icon: Sparkles,
  },
  {
    time: "11:00 PM",
    title: "Midnight Toast",
    description:
      "Raise a glass to an unforgettable evening as the clock strikes midnight",
    icon: Clock,
  },
];

export default function Timeline() {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lineRef.current) return;
    gsap.fromTo(
      lineRef.current,
      { scaleY: 0, transformOrigin: "top center" },
      {
        scaleY: 1,
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: lineRef.current,
          start: "top 80%",
          end: "bottom 20%",
          scrub: 1,
        },
      },
    );
  }, []);

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-midnight-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,0.03),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionTitle
            title="Evening Timeline"
            subtitle="A night meticulously planned to perfection"
            align="center"
          />
        </ScrollReveal>

        <div className="relative mt-20">
          {/* Vertical golden line - centered on desktop, left on mobile */}
          <div
            ref={lineRef}
            className="absolute left-[15px] md:left-1/2 md:-translate-x-px top-0 w-[2px] h-full bg-gradient-to-b from-gold-500/40 via-gold-500/60 to-gold-500/40 origin-top"
          />

          {/* Timeline items */}
          <div className="space-y-16 md:space-y-24">
            {timelineData.map((item, index) => {
              const Icon = item.icon;
              const isLeft = index % 2 === 0;

              return (
                <ScrollReveal
                  key={item.time}
                  direction={isLeft ? "left" : "right"}
                  delay={index * 0.08}
                >
                  <div
                    className={`relative flex items-start gap-8 md:gap-0 ${
                      isLeft
                        ? "md:flex-row md:pr-[calc(50%+2rem)]"
                        : "md:flex-row-reverse md:pl-[calc(50%+2rem)]"
                    }`}
                  >
                    {/* Gold dot on timeline */}
                    <div className="absolute left-[7px] md:left-1/2 md:-translate-x-1/2 z-10 mt-1.5">
                      <div className="w-[18px] h-[18px] rounded-full bg-midnight-950 border-2 border-gold-500 shadow-[0_0_12px_rgba(212,175,55,0.4)]" />
                    </div>

                    {/* Content card */}
                    <div className="ml-10 md:ml-0 flex-1">
                      <div className="glass rounded-gold-lg p-6 border border-gold-500/10 hover:border-gold-500/20 transition-colors duration-300">
                        <div className="flex items-start gap-4">
                          <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-gold-500/10">
                            <Icon className="h-5 w-5 text-gold-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-sans text-sm font-semibold tracking-wider text-gold-400 uppercase">
                              {item.time}
                            </span>
                            <h3 className="font-serif text-xl font-semibold text-white mt-1">
                              {item.title}
                            </h3>
                            <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
