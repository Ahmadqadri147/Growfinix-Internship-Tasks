import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  size?: number;
  className?: string;
  showValue?: boolean;
  reviewCount?: number;
}

export function RatingStars({ rating, size = 14, className, showValue = false, reviewCount }: RatingStarsProps) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.4;

  return (
    <div className={cn("flex items-center gap-1", className)} aria-label={`Rated ${rating} out of 5`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => {
          if (i < full) {
            return <Star key={i} style={{ width: size, height: size }} className="fill-amber-400 text-amber-400" />;
          }
          if (i === full && hasHalf) {
            return (
              <div key={i} className="relative" style={{ width: size, height: size }}>
                <Star style={{ width: size, height: size }} className="absolute text-muted-foreground/40" />
                <StarHalf
                  style={{ width: size, height: size }}
                  className="absolute fill-amber-400 text-amber-400"
                />
              </div>
            );
          }
          return (
            <Star key={i} style={{ width: size, height: size }} className="text-muted-foreground/40" />
          );
        })}
      </div>
      {showValue && (
        <span className="text-xs font-semibold text-foreground">
          {rating.toFixed(1)}
          {reviewCount !== undefined && (
            <span className="ml-1 font-normal text-muted-foreground">({reviewCount.toLocaleString()})</span>
          )}
        </span>
      )}
    </div>
  );
}
