import { memo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Heart, ShoppingBag, Zap } from "lucide-react";
import type { Product } from "@/types";
import { availabilityLabel, discountedPrice, formatCurrency, PLACEHOLDER_IMAGE } from "@/constants";
import { RatingStars } from "@/components/common/RatingStars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUiStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const availabilityStyles: Record<string, string> = {
  IN_STOCK: "text-emerald-600",
  LOW_STOCK: "text-amber-600",
  OUT_OF_STOCK: "text-destructive"
};

export const ProductCard = memo(function ProductCard({ product, index = 0 }: ProductCardProps) {
  const navigate = useNavigate();
  const openQuickView = useUiStore((s) => s.openQuickView);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);
  const wishlisted = isWishlisted(product.id);
  const finalPrice = discountedPrice(product);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info("Please sign in to save items to your wishlist");
      navigate("/login");
      return;
    }
    void toggleWishlist(product.id);
  };

  return (
    <div
      style={{ animationDelay: `${Math.min(index % 4, 3) * 60}ms` }}
      className="group animate-fade-in relative overflow-hidden rounded-xl border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted via-muted-foreground/10 to-muted" />
          )}
          <img
            src={product.images?.[0] ?? PLACEHOLDER_IMAGE}
            alt={product.title}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              if (e.currentTarget.src !== PLACEHOLDER_IMAGE) {
                e.currentTarget.src = PLACEHOLDER_IMAGE;
              }
            }}
            className={cn(
              "h-full w-full object-cover transition-[opacity,transform] duration-500 group-hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
          />
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
            {product.featured && (
              <Badge variant="indigo" className="backdrop-blur-sm">
                <Zap className="h-3 w-3" /> Featured
              </Badge>
            )}
            {product.discount > 0 && (
              <Badge variant="destructive" className="backdrop-blur-sm">
                -{product.discount}%
              </Badge>
            )}
          </div>
          <button
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={cn(
              "absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full border bg-background/90 backdrop-blur-sm transition-all hover:scale-110 active:scale-95",
              wishlisted ? "border-rose-300 text-rose-500" : "border-border text-muted-foreground hover:text-rose-500"
            )}
          >
            <Heart className={cn("h-4 w-4", wishlisted && "fill-rose-500")} />
          </button>

          <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-stretch gap-1 bg-gradient-to-t from-black/60 to-transparent p-3 transition-transform duration-300 group-hover:translate-y-0">
            <Button
              size="sm"
              className="flex-1 bg-white/95 text-zinc-900 hover:bg-white"
              onClick={(e) => {
                e.preventDefault();
                openQuickView(product);
              }}
            >
              <Eye className="h-3.5 w-3.5" /> Quick View
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="secondary"
                  className="bg-white/95 text-zinc-900 hover:bg-white"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/products/${product.id}`);
                  }}
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View product</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="space-y-1.5 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {product.brand?.name ?? "Unknown brand"}
            </span>
            <span className={cn("text-xs font-medium", availabilityStyles[product.availability])}>
              {availabilityLabel(product.availability)}
            </span>
          </div>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug transition-colors group-hover:text-primary">
            {product.title}
          </h3>
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
          <div className="flex items-center gap-2 pt-1">
            <span className="text-lg font-bold">{formatCurrency(finalPrice)}</span>
            {product.discount > 0 && (
              <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.price)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
});
