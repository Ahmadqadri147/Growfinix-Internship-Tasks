import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, ShoppingBag, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { discountedPrice, formatCurrency, PLACEHOLDER_IMAGE } from "@/constants";
import { RatingStars } from "@/components/common/RatingStars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useUiStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const QuickViewDialog = memo(function QuickViewDialog() {
  const navigate = useNavigate();
  const product = useUiStore((s) => s.quickViewProduct);
  const openQuickView = useUiStore((s) => s.openQuickView);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isWishlisted, toggleWishlist } = useWishlist();

  if (!product) return null;
  const finalPrice = discountedPrice(product);
  const wishlisted = isWishlisted(product.id);

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to save items to your wishlist");
      openQuickView(null);
      navigate("/login");
      return;
    }
    void toggleWishlist(product.id);
  };

  return (
    <AnimatePresence>
      <Dialog open={Boolean(product)} onOpenChange={(open) => !open && openQuickView(null)}>
        <DialogContent className="max-w-3xl gap-6 p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{product.title}</DialogTitle>
            <DialogDescription>Quick view of {product.title}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-0 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="relative aspect-square overflow-hidden bg-muted"
            >
              <img
                  src={product.images?.[0] ?? PLACEHOLDER_IMAGE}
                  alt={product.title}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    if (e.currentTarget.src !== PLACEHOLDER_IMAGE) {
                      e.currentTarget.src = PLACEHOLDER_IMAGE;
                    }
                  }}
                  className="h-full w-full object-cover"
                />
              {product.discount > 0 && (
                <Badge variant="destructive" className="absolute left-3 top-3">
                  -{product.discount}%
                </Badge>
              )}
              <button
                onClick={handleWishlist}
                className={cn(
                  "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border bg-background/90 backdrop-blur-sm transition-transform hover:scale-110",
                  wishlisted ? "border-rose-300 text-rose-500" : "border-border text-muted-foreground"
                )}
                aria-label="Toggle wishlist"
              >
                <Heart className={cn("h-4 w-4", wishlisted && "fill-rose-500")} />
              </button>
            </motion.div>

            <div className="flex flex-col gap-4 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{product.category?.name ?? "General"}</Badge>
                <Badge variant="outline">{product.brand?.name ?? "Unknown"}</Badge>
                {product.featured && <Badge variant="indigo">Featured</Badge>}
              </div>
              <h3 className="text-xl font-bold leading-snug">{product.title}</h3>
              <RatingStars rating={product.rating} showValue reviewCount={product.reviewCount} />
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-primary">{formatCurrency(finalPrice)}</span>
                {product.discount > 0 && (
                  <span className="text-lg text-muted-foreground line-through">{formatCurrency(product.price)}</span>
                )}
              </div>
              <p className="line-clamp-3 text-sm text-muted-foreground">{product.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {product.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="mt-auto space-y-2 text-xs text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5" />
                  {product.shipping?.free ? "Free" : `$${product.shipping?.standard?.cost ?? 5}`} standard shipping
                  ({product.shipping?.standard?.days ?? 5} days)
                </p>
                <p className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5" /> 1-year warranty included
                </p>
                <p className="flex items-center gap-2">
                  <RotateCcw className="h-3.5 w-3.5" /> 30-day free returns
                </p>
              </div>
              <Button size="lg" className="w-full" onClick={() => navigate(`/products/${product.id}`)}>
                <ShoppingBag className="mr-1" /> View Full Details
              </Button>
            </div>
          </div>
          <button
            onClick={() => openQuickView(null)}
            className="absolute right-4 top-4 rounded-full bg-background/80 p-1 opacity-80 transition-opacity hover:opacity-100"
            aria-label="Close quick view"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
});
