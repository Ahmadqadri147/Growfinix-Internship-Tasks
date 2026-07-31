import { cn } from "@/lib/utils";

interface GoldenDividerProps {
  className?: string;
  width?: string;
}

export default function GoldenDivider({ className, width = "w-24" }: GoldenDividerProps) {
  return (
    <div
      className={cn("relative mx-auto h-px overflow-hidden", width, className)}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
    </div>
  );
}
