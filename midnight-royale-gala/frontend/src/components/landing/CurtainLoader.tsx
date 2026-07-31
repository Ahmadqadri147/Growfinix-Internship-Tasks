import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CurtainLoaderProps {
  onLoadingComplete?: () => void;
}

export default function CurtainLoader({ onLoadingComplete }: CurtainLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      onLoadingComplete?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.25, 0, 1] }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-midnight-950" />

          {/* Left curtain */}
          <motion.div
            className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-midnight-950 via-midnight-900 to-midnight-950 z-10"
            initial={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 1, ease: [0.65, 0, 0.35, 1] }}
          >
            <div className="absolute inset-y-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-gold-500/20 to-transparent" />
          </motion.div>

          {/* Right curtain */}
          <motion.div
            className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-midnight-950 via-midnight-900 to-midnight-950 z-10"
            initial={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 1, ease: [0.65, 0, 0.35, 1] }}
          >
            <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-gold-500/20 to-transparent" />
          </motion.div>

          {/* Center content */}
          <div className="relative z-20 flex flex-col items-center gap-8">
            {/* Title with shimmer */}
            <div className="relative">
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-[0.15em] gold-text text-center leading-tight">
                MIDNIGHT
                <br />
                ROYALE
                <br />
                GALA
              </h1>
              <div className="absolute inset-0 shimmer-bg rounded-lg pointer-events-none" />
            </div>

            {/* Loading indicator */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gold-gradient rounded-full"
                  initial={{ scaleX: 0, transformOrigin: "left center" }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: 2.5,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <span className="text-xs tracking-[0.3em] uppercase text-gold-500/70">
                Loading
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
