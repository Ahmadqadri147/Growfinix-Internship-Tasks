import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: boolean;
  hover?: boolean;
}

export default function GlassCard({
  children,
  className,
  glow = false,
  hover = true,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-gold-lg p-6",
        hover && "glass-hover",
        glow && "animate-glowPulse",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
