import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface FloatingDustProps {
  className?: string;
}

export default function FloatingDust({ className }: FloatingDustProps) {
  const particles = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: 2 + Math.random() * 2,
      opacity: 0.2 + Math.random() * 0.4,
      duration: 8 + Math.random() * 7,
      delay: Math.random() * 10,
    }));
  }, []);

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <style>{`
        @keyframes dust-drift {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: var(--dust-opacity); }
          90% { opacity: var(--dust-opacity); }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            bottom: "-10px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: 0,
            backgroundColor: "#D4AF37",
            "--dust-opacity": p.opacity,
            animation: `dust-drift ${p.duration}s linear ${p.delay}s infinite`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}