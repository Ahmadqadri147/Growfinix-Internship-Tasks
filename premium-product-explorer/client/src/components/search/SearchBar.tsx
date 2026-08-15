import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, Clock, TrendingUp, Package, Tag, ImageIcon, CornerDownLeft, Trash2 } from "lucide-react";
import { useSuggestions } from "@/hooks/useSuggestions";
import { useTrendingSearches } from "@/hooks/useTrendingSearches";
import { useSearchStore } from "@/store/searchStore";
import { searchService } from "@/services/search.service";
import { productService } from "@/services/product.service";
import { highlightMatch } from "@/utils/format";
import { formatCurrency, TRENDING_SEARCHES } from "@/constants";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SearchBarProps {
  size?: "default" | "large";
  autoFocus?: boolean;
  defaultValue?: string;
  onSearch?: () => void;
  className?: string;
}

interface SuggestionItem {
  type: "product" | "category" | "brand";
  id: string;
  title: string;
  subtitle?: string;
  price?: number;
  image?: string;
  href: string;
}

export function SearchBar({ size = "default", autoFocus = false, defaultValue = "", onSearch, className }: SearchBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showHistory, setShowHistory] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { recentSearches, addRecent, clearRecent } = useSearchStore();
  const { data: suggestions, isFetching } = useSuggestions(query, open);
  const { data: trending } = useTrendingSearches();

  const items: SuggestionItem[] = [
    ...(suggestions?.products.map((p) => ({
      type: "product" as const,
      id: p.id,
      title: p.title,
      subtitle: p.brand.name,
      price: p.price,
      image: p.images[0],
      href: `/products/${p.id}`
    })) ?? []),
    ...(suggestions?.categories.map((c) => ({
      type: "category" as const,
      id: c.id,
      title: c.name,
      subtitle: "Category",
      href: `/products?category=${c.slug}`
    })) ?? []),
    ...(suggestions?.brands.map((b) => ({
      type: "brand" as const,
      id: b.id,
      title: b.name,
      subtitle: "Brand",
      href: `/products?brand=${b.slug}`
    })) ?? [])
  ];

  const recordSearch = useCallback((q: string) => {
    void (async () => {
      try {
        const res = await productService.getProducts({ q, page: 1, limit: 1 });
        void searchService.record(q, res.meta.total);
      } catch {
        void searchService.record(q, 0);
      }
    })();
  }, []);

  const submit = useCallback(
    (value?: string) => {
      const q = (value ?? query).trim();
      if (!q) return;
      addRecent(q);
      recordSearch(q);
      setOpen(false);
      onSearch?.();
      navigate(`/products?q=${encodeURIComponent(q)}`);
    },
    [query, addRecent, recordSearch, navigate, onSearch]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setShowHistory(true);
      setActiveIndex((i) => (i + 1) % Math.max(items.length, recentSearches.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? Math.max(items.length, recentSearches.length) - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && items[activeIndex]) {
        addRecent(items[activeIndex].title);
        recordSearch(items[activeIndex].title);
        setOpen(false);
        navigate(items[activeIndex].href);
      } else {
        submit();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showRecentPanel = showHistory && !query.trim();

  const highlight = (text: string): ReactNode =>
    query.trim() ? highlightMatch(text, query) : text;

  const typeIcons: Record<string, ReactNode> = {
    product: <ImageIcon className="h-3.5 w-3.5" />,
    category: <Tag className="h-3.5 w-3.5" />,
    brand: <Package className="h-3.5 w-3.5" />
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div
        className={cn(
          "group flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur-md transition-all duration-300 focus-within:border-primary/60 focus-within:shadow-glow",
          size === "large" ? "h-14 px-5" : "h-10 px-4"
        )}
      >
        <Search className={cn("shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary", size === "large" ? "h-5 w-5" : "h-4 w-4")} />
        <input
          ref={inputRef}
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setShowHistory(false);
          }}
          onFocus={() => {
            setOpen(true);
            if (!query) setShowHistory(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search 50,000+ products, brands, categories..."
          className={cn(
            "w-full bg-transparent outline-none placeholder:text-muted-foreground",
            size === "large" ? "text-base" : "text-sm"
          )}
          role="combobox"
          aria-expanded={open}
          aria-label="Search products"
        />
        {isFetching && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />}
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => submit()}
          className={cn(
            "shrink-0 rounded-full bg-primary font-medium text-primary-foreground shadow transition-all hover:bg-primary/90 active:scale-95",
            size === "large" ? "px-6 py-2 text-sm" : "px-3.5 py-1.5 text-xs"
          )}
        >
          Search
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl"
          >
            {showRecentPanel ? (
              <div className="max-h-96 overflow-y-auto p-2">
                {recentSearches.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between px-2 py-1.5">
                      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <Clock className="h-3 w-3" /> Recent searches
                      </span>
                      <button
                        onClick={() => {
                          clearRecent();
                          if (isAuthenticated) void searchService.clear();
                        }}
                        className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" /> Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 px-2 pb-1">
                      {recentSearches.map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setQuery(q);
                            submit(q);
                          }}
                          className="flex items-center gap-1.5 rounded-full border bg-secondary px-3 py-1 text-xs transition-colors hover:border-primary/50 hover:text-primary"
                        >
                          <Clock className="h-3 w-3" /> {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="px-2 py-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <TrendingUp className="h-3 w-3" /> Trending searches
                  </span>
                  <div className="mt-2 flex flex-col gap-0.5">
                    {(trending?.length ? trending.slice(0, 6) : TRENDING_SEARCHES.map((q) => ({ query: q, count: 0 }))).map(
                      (t, i) => (
                        <button
                          key={t.query}
                          onClick={() => {
                            setQuery(t.query);
                            submit(t.query);
                          }}
                          className="flex items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-accent"
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                            {i + 1}
                          </span>
                          <span>{t.query}</span>
                          {t.count > 0 && (
                            <span className="ml-auto text-xs text-muted-foreground">{t.count} searches</span>
                          )}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : query.trim().length >= 2 ? (
              items.length > 0 ? (
                <div className="max-h-96 overflow-y-auto p-2">
                  {items.map((item, i) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => {
                        addRecent(item.title);
                        recordSearch(item.title);
                        setOpen(false);
                        navigate(item.href);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                        activeIndex === i && "bg-accent"
                      )}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                          className="h-10 w-10 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                          {typeIcons[item.type]}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 font-medium">{highlight(item.title)}</span>
                        <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                      </span>
                      {item.price !== undefined && (
                        <span className="shrink-0 text-sm font-semibold">{formatCurrency(item.price)}</span>
                      )}
                    </button>
                  ))}
                  <button
                    onClick={() => submit()}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg border-t border-border px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                  >
                    Search for "<span className="font-semibold">{query.trim()}</span>"{" "}
                    <CornerDownLeft className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">No results for "{query.trim()}"</p>
                  <p className="text-xs text-muted-foreground">Try a different keyword or browse categories</p>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/products");
                    }}
                    className="mt-1 text-xs font-medium text-primary hover:underline"
                  >
                    Browse all products
                  </button>
                </div>
              )
            ) : (
              <div className="flex flex-wrap gap-1.5 p-3">
                <span className="w-full text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Try searching
                </span>
                {TRENDING_SEARCHES.slice(0, 6).map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setQuery(q);
                      submit(q);
                    }}
                    className="rounded-full border bg-secondary px-3 py-1 text-xs transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
