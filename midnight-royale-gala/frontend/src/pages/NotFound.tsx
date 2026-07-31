import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";

const floatingVariants = (delay: number, duration: number) => ({
  animate: {
    y: [-15, 15, -15],
    rotate: [0, 10, -10, 0],
    transition: {
      duration,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    },
  },
});

export default function NotFound() {
  useEffect(() => {
    document.title = "404 - Lost in the Midnight | Midnight Royale Gala";
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-midnight-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.05),transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center"
      >
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="font-serif text-9xl font-bold gold-text leading-none"
        >
          404
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-4 font-serif text-3xl font-semibold text-white"
        >
          Lost in the Midnight
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-3 text-gray-400"
        >
          The page you're looking for doesn't exist or has been moved.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-8"
        >
          <Link to="/">
            <Button variant="primary" size="lg" icon={<ArrowLeft className="h-5 w-5" />}>
              Return Home
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        {...floatingVariants(0, 4)}
        className="absolute left-1/4 top-1/4 h-16 w-16 rounded-full border border-gold-500/30"
      />
      <motion.div
        {...floatingVariants(1, 5)}
        className="absolute right-1/3 top-1/3 h-20 w-20 border border-gold-500/20"
        style={{ transform: "rotate(45deg)" }}
      />
      <motion.div
        {...floatingVariants(0.5, 4.5)}
        className="absolute bottom-1/4 right-1/4"
      >
        <svg width="60" height="60" viewBox="0 0 60 60" className="text-gold-500/20">
          <polygon
            points="30,5 55,50 5,50"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </motion.div>
    </div>
  );
}
