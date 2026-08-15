import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Heart,
  Link2,
  MapPin,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  ThumbsUp,
  Truck,
  Zap
} from "lucide-react";
import { useProduct, useRelatedProducts } from "@/hooks/useProducts";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuthStore } from "@/store/authStore";
import { reviewService } from "@/services/search.service";
import { orderService } from "@/services/commerce.service";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGridSkeleton } from "@/components/common/Skeletons";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { RatingStars } from "@/components/common/RatingStars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { availabilityLabel, discountedPrice, formatCurrency, formatDate, timeAgo, PLACEHOLDER_IMAGE } from "@/constants";
import { cn } from "@/lib/utils";

const availabilityStyles: Record<string, string> = {
  IN_STOCK: "text-emerald-600",
  LOW_STOCK: "text-amber-600",
  OUT_OF_STOCK: "text-destructive"
};

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: product, isPending, isError, error, refetch } = useProduct(id);
  const { data: related } = useRelatedProducts(id, product?.categoryId);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewTab, setReviewTab] = useState<"reviews" | "write">("reviews");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  const { data: reviewPage } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => reviewService.getByProduct(id!, 1, 8, "newest"),
    enabled: Boolean(id),
    staleTime: 60 * 1000
  });

  const { data: breakdown } = useQuery({
    queryKey: ["review-breakdown", id],
    queryFn: () => reviewService.getBreakdown(id!),
    enabled: Boolean(id),
    staleTime: 60 * 1000
  });

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
  }, [id]);

  const finalPrice = useMemo(
    () => (product ? discountedPrice(product) : 0),
    [product]
  );

  const placeOrder = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast.info("Please sign in to place an order");
      navigate("/login");
      return;
    }
    setPlacingOrder(true);
    try {
      const order = await orderService.create([{ productId: product.id, quantity }]);
      toast.success(`Order placed! Total: ${formatCurrency(order.total)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  const submitReview = async () => {
    if (!id) return;
    if (reviewComment.trim().length < 3) {
      toast.error("Please write a comment");
      return;
    }
    try {
      await reviewService.create(id, { rating: reviewRating, title: reviewTitle || undefined, comment: reviewComment });
      toast.success("Review submitted!");
      setReviewComment("");
      setReviewTitle("");
      setReviewTab("reviews");
      await queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      await queryClient.invalidateQueries({ queryKey: ["review-breakdown", id] });
      await queryClient.invalidateQueries({ queryKey: ["product", id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit review");
    }
  };

  if (isPending) {
    return (
      <div className="container grid gap-10 py-8 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container py-16">
        <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => void refetch()} />
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to save items to your wishlist");
      navigate("/login");
      return;
    }
    void toggleWishlist(product.id);
  };

  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(product.title)}&url=${url}`, "_blank");
    }
  };

  const specs = [
    { label: "SKU", value: product.sku },
    { label: "Brand", value: product.brand.name },
    { label: "Category", value: product.category.name },
    { label: "Sub-category", value: product.subCategory },
    { label: "Seller", value: product.seller ?? "Official Store" },
    { label: "Location", value: product.location ?? "N/A" },
    { label: "Colors", value: product.color.join(", ") || "N/A" },
    { label: "Sizes", value: product.sizes.join(", ") || "One size" },
    { label: "Added", value: formatDate(product.createdAt) },
    { label: "Views", value: (product.viewCount ?? 0).toLocaleString() }
  ];

  return (
    <div className="container py-6">
      <Breadcrumbs
        items={[
          { label: product.category.name, href: `/products?category=${product.category.slug}` },
          { label: product.brand.name, href: `/products?brand=${product.brand.slug}` },
          { label: product.title }
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-2xl border bg-muted"
          >
            <img
              key={activeImage}
              src={product.images?.[activeImage] ?? product.images?.[0] ?? PLACEHOLDER_IMAGE}
              alt={product.title}
              fetchPriority="high"
              onError={(e) => {
                if (e.currentTarget.src !== PLACEHOLDER_IMAGE) {
                  e.currentTarget.src = PLACEHOLDER_IMAGE;
                }
              }}
              className="aspect-square w-full object-cover"
            />
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              {product.featured && (
                <Badge variant="indigo" className="backdrop-blur-sm">
                  <Zap className="h-3 w-3" /> Featured
                </Badge>
              )}
              {product.discount > 0 && (
                <Badge variant="destructive" className="backdrop-blur-sm">-{product.discount}%</Badge>
              )}
            </div>
            <button
              onClick={handleWishlist}
              className={cn(
                "absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border bg-background/90 backdrop-blur-sm transition-transform hover:scale-110",
                wishlisted ? "border-rose-300 text-rose-500" : "text-muted-foreground"
              )}
              aria-label="Toggle wishlist"
            >
              <Heart className={cn("h-5 w-5", wishlisted && "fill-rose-500")} />
            </button>
          </motion.div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {product.images.map((img, i) => (
              <button
                key={img}
                onClick={() => setActiveImage(i)}
                className={cn(
                  "overflow-hidden rounded-lg border-2 transition-all",
                  activeImage === i ? "border-primary shadow-glow" : "border-transparent opacity-70 hover:opacity-100"
                )}
                aria-label={`View image ${i + 1}`}
              >
                <img
                  src={img}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    if (e.currentTarget.src !== PLACEHOLDER_IMAGE) {
                      e.currentTarget.src = PLACEHOLDER_IMAGE;
                    }
                  }}
                  className="aspect-square w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{product.category.name}</Badge>
              <Badge variant="outline">{product.brand.name}</Badge>
              <span className={cn("text-sm font-medium", availabilityStyles[product.availability])}>
                {availabilityLabel(product.availability)}
              </span>
            </div>
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{product.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <RatingStars rating={product.rating} size={16} showValue reviewCount={product.reviewCount} />
              <button
                onClick={() => document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" })}
                className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                Read all reviews
              </button>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap items-baseline gap-4">
            <span className="text-4xl font-extrabold text-primary">{formatCurrency(finalPrice)}</span>
            {product.discount > 0 && (
              <>
                <span className="text-xl text-muted-foreground line-through">{formatCurrency(product.price)}</span>
                <Badge variant="success">Save {formatCurrency(product.price - finalPrice)}</Badge>
              </>
            )}
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="flex flex-wrap gap-1.5">
            {product.tags.map((tag) => (
              <Link
                key={tag}
                to={`/products?tag=${encodeURIComponent(tag)}`}
                className="rounded-full bg-secondary px-3 py-1 text-xs transition-colors hover:bg-primary/10 hover:text-primary"
              >
                #{tag}
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 rounded-xl border bg-muted/30 p-4 sm:grid-cols-3">
            <div className="flex items-center gap-2.5 text-sm">
              <Truck className="h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium">{product.shipping?.free ? "Free shipping" : `$${product.shipping?.standard?.cost ?? 5}`}</p>
                <p className="text-xs text-muted-foreground">{product.shipping?.standard?.days ?? 5} business days</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium">1-year warranty</p>
                <p className="text-xs text-muted-foreground">Manufacturer covered</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <RotateCcw className="h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium">30-day returns</p>
                <p className="text-xs text-muted-foreground">Money-back guarantee</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2.5 transition-colors hover:text-primary disabled:opacity-40"
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                className="p-2.5 transition-colors hover:text-primary disabled:opacity-40"
                disabled={quantity >= 99 || product.stock <= quantity}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button size="lg" className="flex-1" onClick={() => void placeOrder()} disabled={placingOrder || product.stock === 0}>
              {placingOrder ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Placing…
                </span>
              ) : (
                <>
                  <ShoppingBag className="mr-1" /> {product.stock === 0 ? "Out of stock" : "Buy now"}
                </>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-11 w-11" aria-label="Share">
                  <Share2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => void share()}>
                  <Link2 className="mr-2" /> Copy link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(product.title)}`, "_blank")}>
                  <Share2 className="mr-2" /> Share on X
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Ships from {product.location ?? "US"}</span>
            <span className="flex items-center gap-1"><Store className="h-3 w-3" /> Sold by {product.seller ?? "Official Store"}</span>
            <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {product.stock} units in stock</span>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 text-sm font-semibold">Specifications</h3>
            <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              {specs.map((spec) => (
                <div key={spec.label} className="flex justify-between border-b border-dashed py-2 text-sm">
                  <span className="text-muted-foreground">{spec.label}</span>
                  <span className="max-w-[60%] truncate font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section id="reviews-section" className="mt-16">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Customer reviews</h2>
          {isAuthenticated && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant={reviewTab === "write" ? "default" : "outline"} onClick={() => setReviewTab("write")}>
                  <Star className="mr-1 h-4 w-4" /> Write a review
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Write a review</DialogTitle>
                  <DialogDescription>Share your experience with this product</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Your rating</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button key={r} onClick={() => setReviewRating(r)} className="transition-transform hover:scale-110" aria-label={`${r} stars`}>
                          <Star className={cn("h-7 w-7", r <= reviewRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <input
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="Great value for money"
                      className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Comment</Label>
                    <Textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="What did you like or dislike?"
                      rows={4}
                    />
                  </div>
                  <Button className="w-full" onClick={() => void submitReview()}>Submit review</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {breakdown && (
            <div className="h-fit rounded-xl border p-5">
              <div className="flex items-center gap-4">
                <span className="text-5xl font-extrabold">{breakdown.average.toFixed(1)}</span>
                <div>
                  <RatingStars rating={breakdown.average} size={16} />
                  <p className="mt-1 text-xs text-muted-foreground">{breakdown.total} reviews</p>
                </div>
              </div>
              <div className="mt-5 space-y-2">
                {breakdown.breakdown.map((b) => (
                  <div key={b.stars} className="flex items-center gap-2 text-xs">
                    <span className="w-8 shrink-0 text-muted-foreground">{b.stars}★</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${b.percent}%` }} />
                    </div>
                    <span className="w-8 shrink-0 text-right text-muted-foreground">{b.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {(reviewPage?.reviews ?? []).length > 0 ? (
              reviewPage!.reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/80 to-blue-500/80 text-sm font-bold text-white">
                        {review.user.name.charAt(0)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{review.user.name}</p>
                        <p className="text-xs text-muted-foreground">{timeAgo(review.createdAt)}</p>
                      </div>
                    </div>
                    <RatingStars rating={review.rating} size={13} />
                  </div>
                  {review.title && <h4 className="mt-3 text-sm font-semibold">{review.title}</h4>}
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 px-2 text-xs text-muted-foreground"
                      onClick={() => {
                        if (!isAuthenticated) {
                          toast.info("Sign in to mark reviews as helpful");
                          return;
                        }
                        void reviewService.markHelpful(review.id);
                        toast.success("Thanks for the feedback!");
                      }}
                    >
                      <ThumbsUp className="h-3 w-3" /> Helpful ({review.helpful})
                    </Button>
                  </div>
                </motion.div>
              ))
            ) : (
              <EmptyState
                icon="default"
                title="No reviews yet"
                description="Be the first to review this product!"
              />
            )}
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="mt-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">You might also like</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/products?category=${product.category.slug}`)}
          >
            View all in {product.category.name} <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        {related ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.slice(0, 8).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <ProductGridSkeleton count={4} />
        )}
      </section>
    </div>
  );
}
