import { useNavigate } from "react-router-dom";
import { useWishlist } from "@/hooks/useWishlist";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGridSkeleton } from "@/components/common/Skeletons";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

export default function WishlistPage() {
  const navigate = useNavigate();
  const { wishlist } = useWishlist();

  return (
    <div className="container py-6">
      <Breadcrumbs items={[{ label: "Wishlist" }]} />
      <h1 className="mb-2 mt-4 text-2xl font-bold tracking-tight">
        My wishlist
        {wishlist.data && (
          <span className="ml-2 text-base font-normal text-muted-foreground">
            {wishlist.data.meta.total} saved item{wishlist.data.meta.total === 1 ? "" : "s"}
          </span>
        )}
      </h1>

      {wishlist.isPending ? (
        <ProductGridSkeleton count={8} />
      ) : wishlist.isError ? (
        <ErrorState onRetry={() => void wishlist.refetch()} />
      ) : wishlist.data && wishlist.data.items.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {wishlist.data.items.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            icon="default"
            title="Your wishlist is empty"
            description="Tap the heart icon on any product to save it here for later."
            actionLabel="Browse products"
            onAction={() => navigate("/products")}
          />
        </div>
      )}
    </div>
  );
}
