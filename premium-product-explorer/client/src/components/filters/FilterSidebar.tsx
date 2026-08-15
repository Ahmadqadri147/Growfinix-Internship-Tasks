import { RotateCcw } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CheckboxGroup, SizeGroup, ColorGroup } from "./CheckboxGroup";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { AVAILABILITY_OPTIONS, RATING_OPTIONS, DISCOUNT_OPTIONS } from "@/constants";
import { useFacets } from "@/hooks/useProducts";
import type { ProductQueryParams } from "@/types";

interface FilterSidebarProps {
  params: ProductQueryParams;
  onChange: (patch: Partial<ProductQueryParams>) => void;
  onReset: () => void;
  activeCount: number;
}

function toggleInList(current: string[] | undefined, value: string, add: boolean): string[] | undefined {
  const list = current ?? [];
  if (add) return [...new Set([...list, value])];
  return list.filter((v) => v !== value);
}

export function FilterSidebar({ params, onChange, onReset, activeCount }: FilterSidebarProps) {
  const { data: facets } = useFacets();
  const priceRange: [number, number] = [
    params.minPrice ?? Math.floor(facets?.priceRange.min ?? 0),
    params.maxPrice ?? Math.ceil(facets?.priceRange.max ?? 1000)
  ];

  const patch = (p: Partial<ProductQueryParams>) => onChange(p);

  return (
    <div className="space-y-1">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={activeCount === 0}
          className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-primary"
        >
          <RotateCcw className="h-3 w-3" /> Reset all
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["category", "brand", "price", "availability"]}>
        <AccordionItem value="category">
          <AccordionTrigger>Category</AccordionTrigger>
          <AccordionContent>
            <CheckboxGroup
              title=""
              options={(facets?.categories ?? []).slice(0, 12).map((c) => ({
                label: c.name,
                value: c.slug,
                count: c._count?.products
              }))}
              selected={params.category ?? []}
              onChange={(v, checked) => patch({ category: toggleInList(params.category, v, checked) })}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="brand">
          <AccordionTrigger>Brand</AccordionTrigger>
          <AccordionContent>
            <CheckboxGroup
              title=""
              options={(facets?.brands ?? []).slice(0, 12).map((b) => ({
                label: b.name,
                value: b.slug,
                count: b._count?.products
              }))}
              selected={params.brand ?? []}
              onChange={(v, checked) => patch({ brand: toggleInList(params.brand, v, checked) })}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <PriceRangeFilter
              min={Math.floor(facets?.priceRange.min ?? 0)}
              max={Math.ceil(facets?.priceRange.max ?? 1000)}
              value={priceRange}
              onChange={(v) => patch({ minPrice: v[0], maxPrice: v[1] })}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="availability">
          <AccordionTrigger>Availability</AccordionTrigger>
          <AccordionContent>
            <CheckboxGroup
              title=""
              options={AVAILABILITY_OPTIONS.map((a) => ({ label: a.label, value: a.value }))}
              selected={(params.availability ?? []) as string[]}
              onChange={(v, checked) =>
                patch({ availability: (toggleInList(params.availability, v, checked) ?? []) as ProductQueryParams["availability"] })
              }
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rating">
          <AccordionTrigger>Rating</AccordionTrigger>
          <AccordionContent>
            <CheckboxGroup
              title=""
              options={RATING_OPTIONS.map((r) => ({ label: r.label, value: String(r.value) }))}
              selected={params.minRating !== undefined ? [String(params.minRating)] : []}
              onChange={(v, checked) => patch({ minRating: checked ? Number(v) : undefined })}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="discount">
          <AccordionTrigger>Discount</AccordionTrigger>
          <AccordionContent>
            <CheckboxGroup
              title=""
              options={DISCOUNT_OPTIONS.map((d) => ({ label: d.label, value: String(d.value) }))}
              selected={params.minDiscount !== undefined ? [String(params.minDiscount)] : []}
              onChange={(v, checked) => patch({ minDiscount: checked ? Number(v) : undefined })}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="color">
          <AccordionTrigger>Color</AccordionTrigger>
          <AccordionContent>
            <ColorGroup
              title=""
              options={(facets?.colors ?? []).map((c) => ({ label: c, value: c }))}
              selected={params.color ?? []}
              onChange={(v, checked) => patch({ color: toggleInList(params.color, v, checked) })}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="size">
          <AccordionTrigger>Size</AccordionTrigger>
          <AccordionContent>
            <SizeGroup
              title=""
              options={(facets?.sizes ?? []).map((s) => ({ label: s, value: s }))}
              selected={params.size ?? []}
              onChange={(v, checked) => patch({ size: toggleInList(params.size, v, checked) })}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="location">
          <AccordionTrigger>Location</AccordionTrigger>
          <AccordionContent>
            <CheckboxGroup
              title=""
              options={(facets?.locations ?? []).filter(Boolean).map((l) => ({ label: l!, value: l! }))}
              selected={params.location ?? []}
              onChange={(v, checked) => patch({ location: toggleInList(params.location, v, checked) })}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="seller">
          <AccordionTrigger>Seller</AccordionTrigger>
          <AccordionContent>
            <CheckboxGroup
              title=""
              options={(facets?.sellers ?? []).filter(Boolean).map((s) => ({ label: s!, value: s! }))}
              selected={params.seller ?? []}
              onChange={(v, checked) => patch({ seller: toggleInList(params.seller, v, checked) })}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tags">
          <AccordionTrigger>Tags</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-1.5">
              {(facets?.tags ?? []).slice(0, 20).map((tag) => (
                <button
                  key={tag}
                  onClick={() => patch({ tag: toggleInList(params.tag, tag, !params.tag?.includes(tag)) })}
                  className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                    params.tag?.includes(tag)
                      ? "border-primary bg-primary/10 font-medium text-primary"
                      : "hover:border-primary/40"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
