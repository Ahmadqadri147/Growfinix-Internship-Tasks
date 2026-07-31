import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/layout/PageTransition";
import Hero from "@/components/landing/Hero";
import StorySection from "@/components/landing/StorySection";
import Highlights from "@/components/landing/Highlights";
import Timeline from "@/components/landing/Timeline";
import VenuePreview from "@/components/landing/VenuePreview";
import Stats from "@/components/landing/Stats";
import TicketPreview from "@/components/landing/TicketPreview";
import CTASection from "@/components/landing/CTASection";
import CurtainLoader from "@/components/landing/CurtainLoader";

export default function LandingPage() {
  const [loading, setLoading] = useState(() => {
    const seen = sessionStorage.getItem("seenLoader");
    if (seen) return false;
    sessionStorage.setItem("seenLoader", "true");
    return true;
  });

  useEffect(() => {
    document.title = "Midnight Royale Gala | The Ultimate Luxury Event";
    if (loading) {
      const timer = setTimeout(() => setLoading(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <CurtainLoader key="loader" />
      ) : (
        <PageTransition key="content">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <section id="hero">
              <Hero />
            </section>

            <section id="story">
              <StorySection />
            </section>

            <section id="highlights">
              <Highlights />
            </section>

            <section id="timeline">
              <Timeline />
            </section>

            <section id="venue">
              <VenuePreview />
            </section>

            <section id="stats">
              <Stats />
            </section>

            <section id="tickets">
              <TicketPreview />
            </section>

            <section id="cta">
              <CTASection />
            </section>
          </motion.div>
        </PageTransition>
      )}
    </AnimatePresence>
  );
}
