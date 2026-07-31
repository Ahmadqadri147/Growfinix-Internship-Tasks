import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import ScrollReveal from "@/components/animations/ScrollReveal";

const sparkles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: 2 + Math.random() * 3,
  delay: Math.random() * 4,
  duration: 2 + Math.random() * 3,
}));

export default function CTASection() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({
      x: (e.clientX / window.innerWidth - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-midnight-950">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-midnight-900 via-midnight-950 to-midnight-900" />

      {/* Golden sparkle particles */}
      <div className="absolute inset-0 pointer-events-none">
        {sparkles.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-gold-400"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: 0,
              animation: `fadeIn ${s.duration}s ease-in-out ${s.delay}s infinite alternate`,
              boxShadow: "0 0 8px rgba(212, 175, 55, 0.6)",
              transform: `translate(${mousePos.x * (s.id % 3 === 0 ? 15 : -10)}px, ${mousePos.y * (s.id % 2 === 0 ? 12 : -8)}px)`,
              transition: "transform 0.2s ease-out",
            }}
          />
        ))}
      </div>

      {/* Decorative circles */}
      <div
        className="absolute top-1/3 right-[15%] w-72 h-72 rounded-full border border-gold-500/5 pointer-events-none"
        style={{
          transform: `translate(${mousePos.x * -8}px, ${mousePos.y * -5}px)`,
          transition: "transform 0.2s ease-out",
        }}
      />
      <div
        className="absolute bottom-1/4 left-[10%] w-56 h-56 rounded-full border border-gold-500/5 pointer-events-none"
        style={{
          transform: `translate(${mousePos.x * 10}px, ${mousePos.y * 8}px)`,
          transition: "transform 0.2s ease-out",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <ScrollReveal>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Reserve Your Place at the{" "}
            <span className="gold-text">Midnight Royale Gala</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="mt-6 text-lg sm:text-xl text-gold-400 font-medium animate-pulse">
            Limited VIP tables remaining. Don't miss the most exclusive event of
            the year.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="mt-10">
            <Link to="/events/1/tickets">
              <Button variant="primary" size="xl">
                Book Your Experience Now{" "}
                <ArrowRight className="h-5 w-5 ml-1" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
