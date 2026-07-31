import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
}

export default function SplitText({
  text,
  className,
  delay = 0,
  duration = 0.5,
  as: Tag = "p",
}: SplitTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const words = text.split(" ");

  return (
    <div ref={ref} className={cn("inline", className)}>
      <Tag className="inline">
        {words.map((word, i) => {
          const chars = word.split("");
          return (
            <span key={i} className="inline-block whitespace-nowrap">
              {chars.map((char, j) => (
                <motion.span
                  key={j}
                  className="inline-block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isInView
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 20 }
                  }
                  transition={{
                    duration,
                    delay: delay + (i * chars.length + j) * 0.03,
                    ease: [0.25, 0.25, 0, 1],
                  }}
                >
                  {char}
                </motion.span>
              ))}
              <span className="inline-block">&nbsp;</span>
            </span>
          );
        })}
      </Tag>
    </div>
  );
}
