import { type ReactNode, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  distance?: number;
}

const offsets: Record<string, { x?: number; y?: number }> = {
  up: { y: 60 },
  down: { y: -60 },
  left: { x: 60 },
  right: { x: -60 },
};

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.7,
  className,
  once = true,
  distance = 60,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-50px" });
  const offset = offsets[direction] ?? offsets.up;
  const resolvedOffset = { x: offset.x, y: offset.y };
  if (resolvedOffset.x !== undefined) resolvedOffset.x = (resolvedOffset.x! / 60) * distance;
  if (resolvedOffset.y !== undefined) resolvedOffset.y = (resolvedOffset.y! / 60) * distance;

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div
        initial={{ opacity: 0, ...resolvedOffset }}
        animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...resolvedOffset }}
        transition={{ duration, delay, ease: [0.25, 0.25, 0, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
