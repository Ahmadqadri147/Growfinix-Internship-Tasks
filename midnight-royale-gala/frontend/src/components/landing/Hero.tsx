import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import MagneticButton from "@/components/animations/MagneticButton";

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 4,
  delay: Math.random() * 5,
  duration: 3 + Math.random() * 4,
  opacity: 0.2 + Math.random() * 0.5,
}));

const spotlights = [
  { x: "20%", y: "-10%", size: "40rem", delay: "0s" },
  { x: "50%", y: "-20%", size: "50rem", delay: "-2s" },
  { x: "80%", y: "-5%", size: "35rem", delay: "-4s" },
];

export default function Hero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showScroll, setShowScroll] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);
  const y = useTransform(scrollY, [0, 300], [0, 100]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY < 100);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [handleMouseMove]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.25, 0, 1] },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-midnight-950"
    >
      {/* Layer 1: Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-midnight-950 via-midnight-900 to-midnight-950" />

      {/* Layer 2: Animated grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
          animation: "grain 0.5s steps(4) infinite",
        }}
      />

      {/* Layer 3: Golden particle dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-gold-400"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
              boxShadow: "0 0 6px rgba(212, 175, 55, 0.4)",
            }}
          />
        ))}
      </div>

      {/* Decorative golden geometric frame */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-[5%] border border-gold-500/10"
          style={{
            clipPath: "polygon(0 5%, 100% 0, 100% 95%, 0% 100%)",
            transform: `translate(${mousePos.x * 3}px, ${mousePos.y * 3}px)`,
            transition: "transform 0.1s ease-out",
          }}
        />
        <div
          className="absolute inset-[8%] border border-gold-500/5"
          style={{
            clipPath: "polygon(5% 0, 95% 5%, 100% 95%, 5% 100%)",
            transform: `translate(${mousePos.x * -2}px, ${mousePos.y * -2}px)`,
            transition: "transform 0.1s ease-out",
          }}
        />
        <div
          className="absolute top-[15%] left-[10%] w-px h-[70%] bg-gradient-to-b from-transparent via-gold-500/10 to-transparent"
          style={{ transform: `translate(${mousePos.x * 5}px, 0)` }}
        />
        <div
          className="absolute top-[15%] right-[10%] w-px h-[70%] bg-gradient-to-b from-transparent via-gold-500/10 to-transparent"
          style={{ transform: `translate(${mousePos.x * -5}px, 0)` }}
        />
      </div>

      {/* Spotlight beams */}
      {spotlights.map((s, i) => (
        <div
          key={i}
          className="absolute pointer-events-none rounded-full opacity-[0.08]"
          style={{
            width: s.size,
            height: s.size,
            left: `calc(${s.x} + ${mousePos.x * 15}px)`,
            top: `calc(${s.y} + ${mousePos.y * 10}px)`,
            background:
              "radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%)",
            transition: "left 0.3s ease-out, top 0.3s ease-out",
          }}
        />
      ))}

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ opacity, y }}
      >
        {/* Logo Text with shimmer */}
        <motion.div variants={childVariants} className="mb-6">
          <h1 className="relative inline-block font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-wider gold-text">
            MIDNIGHT
            <br className="sm:hidden" />
            <span className="sm:ml-4">ROYALE</span>
            <br className="sm:hidden" />
            <span className="sm:ml-4">GALA</span>
            <div className="absolute inset-0 shimmer-bg rounded-lg" />
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.div variants={childVariants} className="mb-10">
          <p className="font-sans text-lg sm:text-xl text-gray-300 tracking-[0.2em] uppercase">
            The Most Anticipated Event of the Year
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={childVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
        >
          <MagneticButton>
            <Link to="/events/1">
              <Button variant="primary" size="xl">
                Book Now
              </Button>
            </Link>
          </MagneticButton>
          <MagneticButton>
            <Link to="/events/1">
              <Button variant="outline" size="xl">
                Explore Event
              </Button>
            </Link>
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <AnimatePresence>
        {showScroll && (
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs tracking-widest uppercase text-gray-500">
              Scroll to explore
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="w-5 h-5 text-gold-500" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
