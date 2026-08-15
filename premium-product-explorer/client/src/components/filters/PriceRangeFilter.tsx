import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/constants";

interface PriceRangeFilterProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

function parseInput(raw: string, fallback: number): number {
  const v = Number(raw);
  return Number.isFinite(v) && raw.trim() !== "" ? v : fallback;
}

export function PriceRangeFilter({ min, max, value, onChange }: PriceRangeFilterProps) {
  const [local, setLocal] = useState<[number, number]>(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const commit = (next: [number, number]) => {
    const clamped: [number, number] = [
      Math.max(min, Math.min(Number.isFinite(next[0]) ? next[0] : min, max)),
      Math.max(min, Math.min(Number.isFinite(next[1]) ? next[1] : max, max))
    ];
    onChange(clamped);
  };

  return (
    <div className="space-y-4">
      <Slider
        min={min}
        max={max}
        step={Math.max(1, Math.round((max - min) / 200))}
        value={local}
        onValueChange={(v) => setLocal(v as [number, number])}
        onValueCommit={(v) => commit(v as [number, number])}
        aria-label="Price range"
      />
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
          <Input
            type="number"
            min={min}
            max={max}
            value={local[0]}
            onChange={(e) => setLocal([parseInput(e.target.value, min), local[1]])}
            onBlur={() => commit(local)}
            className="pl-6 text-sm"
            aria-label="Minimum price"
          />
        </div>
        <span className="text-muted-foreground">–</span>
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
          <Input
            type="number"
            min={min}
            max={max}
            value={local[1]}
            onChange={(e) => setLocal([local[0], parseInput(e.target.value, max)])}
            onBlur={() => commit(local)}
            className="pl-6 text-sm"
            aria-label="Maximum price"
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatCurrency(value[0])}</span>
        <span>{formatCurrency(value[1])}</span>
      </div>
    </div>
  );
}
