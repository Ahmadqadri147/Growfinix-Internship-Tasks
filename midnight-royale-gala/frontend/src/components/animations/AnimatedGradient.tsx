import { cn } from "@/lib/utils";

interface AnimatedGradientProps {
  className?: string;
  colors?: string[];
  speed?: number;
}

export default function AnimatedGradient({
  className,
  speed = 15,
}: AnimatedGradientProps) {
  return (
    <div
      className={cn(
        "animate-aurora bg-[length:400%_400%]",
        "bg-gradient-to-br from-midnight-950 via-midnight-900 to-midnight-800",
        className,
      )}
      style={{
        animationDuration: `${speed}s`,
      }}
    />
  );
}
