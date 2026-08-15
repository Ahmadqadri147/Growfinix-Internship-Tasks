import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/constants";
import type { ProductQueryParams } from "@/types";

interface FilterChipsProps {
  params: ProductQueryParams;
  onChange: (patch: Partial<ProductQueryParams>) => void;
  onClearAll: () => void;
}

const LABELS: Record<string, (v: string) => string> = {
  q: (v) => `"${v}"`,
  availability: (v) =>
    v === "IN_STOCK" ? "In Stock" : v === "LOW_STOCK" ? "Low Stock" : "Out of Stock"
};

export function FilterChips({ params, onChange, onClearAll }: FilterChipsProps) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (params.q?.trim()) {
    chips.push({
      key: "q",
      label: LABELS.q(params.q),
      onRemove: () => onChange({ q: undefined })
    });
  }
  for (const [key, values] of Object.entries({
    category: params.category,
    brand: params.brand,
    subCategory: params.subCategory,
    color: params.color,
    size: params.size,
    location: params.location,
    seller: params.seller,
    tag: params.tag,
    availability: params.availability
  })) {
    (values ?? []).forEach((v) => {
      chips.push({
        key: `${key}-${v}`,
        label: LABELS[key]?.(v) ?? v,
        onRemove: () => onChange({ [key]: (values ?? []).filter((x) => x !== v) } as Partial<ProductQueryParams>)
      });
    });
  }
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    chips.push({
      key: "price",
      label: `${formatCurrency(params.minPrice ?? 0)} – ${formatCurrency(params.maxPrice ?? Infinity)}`,
      onRemove: () => onChange({ minPrice: undefined, maxPrice: undefined })
    });
  }
  if (params.minRating !== undefined) {
    chips.push({
      key: "rating",
      label: `${params.minRating}★ & up`,
      onRemove: () => onChange({ minRating: undefined })
    });
  }
  if (params.minDiscount !== undefined) {
    chips.push({
      key: "discount",
      label: `${params.minDiscount}%+ off`,
      onRemove: () => onChange({ minDiscount: undefined })
    });
  }
  if (params.featured) {
    chips.push({
      key: "featured",
      label: "Featured",
      onRemove: () => onChange({ featured: undefined })
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <AnimatePresence initial={false}>
        {chips.map((chip) => (
          <motion.span
            key={chip.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-1.5 rounded-full border bg-secondary px-3 py-1 text-xs font-medium"
          >
            {chip.label}
            <button
              onClick={chip.onRemove}
              className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={`Remove ${chip.label} filter`}
            >
              <X className="h-3 w-3" />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
      {chips.length > 1 && (
        <Button variant="ghost" size="sm" onClick={onClearAll} className="h-7 px-2 text-xs text-destructive hover:text-destructive">
          Clear all
        </Button>
      )}
    </div>
  );
}
