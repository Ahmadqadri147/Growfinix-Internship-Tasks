import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function getPageItems(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "...")[] = [1];
  if (current > 3) items.push("...");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) items.push(p);
  if (current < total - 2) items.push("...");
  items.push(total);
  return items;
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  const [jumpTo, setJumpTo] = useState("");
  const items = getPageItems(page, totalPages);

  const goTo = (p: number) => {
    const clamped = Math.min(Math.max(1, p), totalPages);
    if (clamped !== page) onPageChange(clamped);
  };

  return (
    <nav className={cn("flex flex-wrap items-center justify-center gap-2", className)} aria-label="Pagination">
      <Button variant="outline" size="icon-sm" onClick={() => goTo(1)} disabled={page === 1} aria-label="First page">
        <ChevronsLeft />
      </Button>
      <Button variant="outline" size="icon-sm" onClick={() => goTo(page - 1)} disabled={page === 1} aria-label="Previous page">
        <ChevronLeft />
      </Button>

      {items.map((item, i) =>
        item === "..." ? (
          <span key={`dots-${i}`} className="px-1 text-muted-foreground">
            ...
          </span>
        ) : (
          <Button
            key={item}
            variant={item === page ? "default" : "outline"}
            size="icon-sm"
            onClick={() => goTo(item)}
            className={item === page ? "shadow-glow" : ""}
          >
            {item}
          </Button>
        )
      )}

      <Button variant="outline" size="icon-sm" onClick={() => goTo(page + 1)} disabled={page >= totalPages} aria-label="Next page">
        <ChevronRight />
      </Button>
      <Button variant="outline" size="icon-sm" onClick={() => goTo(totalPages)} disabled={page >= totalPages} aria-label="Last page">
        <ChevronsRight />
      </Button>

      <div className="ml-2 flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Jump to</span>
        <Input
          type="number"
          min={1}
          max={totalPages}
          value={jumpTo}
          onChange={(e) => setJumpTo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              goTo(Number(jumpTo) || 1);
              setJumpTo("");
            }
          }}
          className="h-8 w-16 text-center text-sm"
          aria-label="Jump to page"
        />
      </div>
    </nav>
  );
}
