import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ListFilter, PackageSearch } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGridSkeleton } from "@/components/common/Skeletons";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Pagination } from "@/components/common/Pagination";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { FilterSidebar } from "@/components/filters/FilterSidebar";
import { FilterChips } from "@/components/filters/FilterChips";
import { SortSelect } from "@/components/filters/SortSelect";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { PAGE_SIZES, SORT_OPTIONS } from "@/constants";
import type { ProductQueryParams, SortKey } from "@/types";

const DEFAULT_PARAMS: ProductQueryParams = { page: 1, limit: 12, sort: "newest" };

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loadMoreMode, setLoadMoreMode] = useState(false);
  const [visiblePages, setVisiblePages] = useState(1);

  const params: ProductQueryParams = useMemo(() => {
    const p: ProductQueryParams = { ...DEFAULT_PARAMS };
    const q = searchParams.get("q");
    if (q) p.q = q;
    const page = Number(searchParams.get("page"));
    if (page > 1) p.page = page;
    const limit = Number(searchParams.get("limit"));
    if ([12, 24, 36, 48].includes(limit)) p.limit = limit;
    const sort = searchParams.get("sort") as SortKey | null;
    if (sort && SORT_OPTIONS.some((s) => s.value === sort)) p.sort = sort;
    const parseList = (key: string) => searchParams.get(key)?.split(",").filter(Boolean) ?? [];
    const listKeys = ["category", "brand", "subCategory", "color", "size", "location", "seller", "tag", "availability"] as const;
    for (const key of listKeys) {
      const values = parseList(key);
      if (values.length) (p as Record<string, unknown>)[key] = values;
    }
    const num = (key: string) => {
      const raw = searchParams.get(key);
      if (raw === null || raw === "") return undefined;
      const v = Number(raw);
      return Number.isFinite(v) ? v : undefined;
    };
    p.minPrice = num("minPrice");
    p.maxPrice = num("maxPrice");
    p.minRating = num("minRating");
    p.minDiscount = num("minDiscount");
    if (searchParams.get("featured") === "true") p.featured = true;
    return p;
  }, [searchParams]);

  const appliedPage = loadMoreMode ? 1 : params.page ?? 1;
  const appliedLimit = loadMoreMode ? (params.limit ?? 12) * visiblePages : params.limit ?? 12;

  const { data, isPending, isError, error, refetch, isFetching } = useProducts({
    ...params,
    page: appliedPage,
    limit: appliedLimit
  });

  const patch = useCallback(
    (next: Partial<ProductQueryParams>) => {
      const merged = { ...params, ...next };
      if (next.page === undefined) merged.page = 1;
      const sp = new URLSearchParams();
      const setIf = (key: string, value: string | undefined) => {
        if (value !== undefined && value !== "") sp.set(key, value);
      };
      setIf("q", merged.q);
      setIf("page", merged.page && merged.page > 1 ? String(merged.page) : undefined);
      setIf("limit", merged.limit && merged.limit !== 12 ? String(merged.limit) : undefined);
      setIf("sort", merged.sort && merged.sort !== "newest" ? merged.sort : undefined);
      setIf("featured", merged.featured ? "true" : undefined);
      setIf("minPrice", merged.minPrice !== undefined ? String(merged.minPrice) : undefined);
      setIf("maxPrice", merged.maxPrice !== undefined ? String(merged.maxPrice) : undefined);
      setIf("minRating", merged.minRating !== undefined ? String(merged.minRating) : undefined);
      setIf("minDiscount", merged.minDiscount !== undefined ? String(merged.minDiscount) : undefined);
      for (const key of ["category", "brand", "subCategory", "color", "size", "location", "seller", "tag", "availability"] as const) {
        const values = merged[key];
        setIf(key, values && values.length ? values.join(",") : undefined);
      }
      setSearchParams(sp, { replace: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [params, setSearchParams]
  );

  const reset = useCallback(() => {
    setSearchParams(new URLSearchParams());
    setLoadMoreMode(false);
    setVisiblePages(1);
  }, [setSearchParams]);

  const activeCount = useMemo(() => {
    let count = 0;
    const listKeys = ["category", "brand", "subCategory", "color", "size", "location", "seller", "tag", "availability"] as const;
    for (const key of listKeys) count += (params[key] ?? []).length;
    if (params.q) count++;
    if (params.minPrice !== undefined || params.maxPrice !== undefined) count++;
    if (params.minRating !== undefined) count++;
    if (params.minDiscount !== undefined) count++;
    if (params.featured) count++;
    return count;
  }, [params]);

  const toggleLoadMore = () => {
    if (loadMoreMode) {
      setLoadMoreMode(false);
      setVisiblePages(1);
      patch({ page: params.page ?? 1, limit: params.limit ?? 12 });
    } else {
      setLoadMoreMode(true);
      setVisiblePages(1);
      patch({ page: 1, limit: (params.limit ?? 12) * 1 });
    }
  };

  const handleLoadMore = () => {
    setVisiblePages((v) => v + 1);
  };

  const total = data?.meta.total ?? 0;
  const title = params.q ? `Results for "${params.q}"` : "All products";

  return (
    <div className="container py-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: "Products" }]} />
        <div className="flex items-center gap-2">
          <SortSelect
            value={params.sort ?? "newest"}
            onChange={(sort) => patch({ sort })}
          />
          <Select
            value={String(params.limit ?? 12)}
            onValueChange={(v) => patch({ limit: Number(v) })}
          >
            <SelectTrigger className="w-28" aria-label="Items per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileFiltersOpen(true)}
            aria-label="Open filters"
          >
            <ListFilter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <h1 className="mb-2 text-2xl font-bold tracking-tight">
        {title}
        <span className="ml-2 text-base font-normal text-muted-foreground">
          {isPending ? "…" : `${total.toLocaleString()} product${total === 1 ? "" : "s"}`}
        </span>
      </h1>

      <FilterChips params={params} onChange={patch} onClearAll={reset} />

      <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-xl border p-4 no-scrollbar">
            <FilterSidebar params={params} onChange={patch} onReset={reset} activeCount={activeCount} />
          </div>
        </aside>

        <div>
          {isPending ? (
            <ProductGridSkeleton count={params.limit ?? 12} />
          ) : isError ? (
            <ErrorState
              message={error instanceof Error ? error.message : undefined}
              onRetry={() => void refetch()}
            />
          ) : data && data.products.length > 0 ? (
            <>
              <motion.div
                key={`${JSON.stringify(params)}-${appliedLimit}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4"
              >
                {data.products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </motion.div>

              {isFetching && !isPending && (
                <p className="mt-6 text-center text-xs text-muted-foreground">Refreshing…</p>
              )}

              <div className="mt-8 flex flex-col items-center gap-4">
                {loadMoreMode ? (
                  data.meta.hasNext && (
                    <Button onClick={handleLoadMore} variant="outline" size="lg" disabled={isFetching}>
                      <PackageSearch className="mr-1 h-4 w-4" /> Load more products
                    </Button>
                  )
                ) : (
                  <Pagination
                    page={params.page ?? 1}
                    totalPages={data.meta.totalPages}
                    onPageChange={(page) => patch({ page })}
                  />
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    Showing{" "}
                    {((params.page ?? 1) - 1) * appliedLimit + 1}–
                    {Math.min((params.page ?? 1) * appliedLimit, total)} of {total.toLocaleString()}
                  </span>
                  <button
                    onClick={toggleLoadMore}
                    className="font-medium text-primary transition-opacity hover:opacity-80"
                  >
                    Switch to {loadMoreMode ? "pagination" : "load more"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              icon="search"
              title="No products found"
              description="Try adjusting your search terms or clearing some filters to see more results."
              actionLabel="Clear all filters"
              onAction={reset}
            />
          )}
        </div>
      </div>

      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="left" className="w-full max-w-sm overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Refine your product search</SheetDescription>
          </SheetHeader>
          <FilterSidebar
            params={params}
            onChange={(p) => {
              patch(p);
              setMobileFiltersOpen(false);
            }}
            onReset={() => {
              reset();
              setMobileFiltersOpen(false);
            }}
            activeCount={activeCount}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
