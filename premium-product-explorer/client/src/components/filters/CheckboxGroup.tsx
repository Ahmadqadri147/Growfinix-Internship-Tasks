import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CheckboxGroupProps {
  title: string;
  options: { label: string; value: string; count?: number }[];
  selected: string[];
  onChange: (value: string, checked: boolean) => void;
}

export function CheckboxGroup({ title, options, selected, onChange }: CheckboxGroupProps) {
  return (
    <div className="space-y-2.5">
      <h4 className="text-sm font-semibold">{title}</h4>
      <div className="grid gap-2">
        {options.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-start gap-2.5 text-sm">
            <Checkbox
              checked={selected.includes(option.value)}
              onCheckedChange={(checked) => onChange(option.value, checked === true)}
              className="mt-0.5"
            />
            <span className={cn("leading-snug", selected.includes(option.value) && "font-medium text-primary")}>
              {option.label}
              {option.count !== undefined && (
                <span className="ml-1 text-xs text-muted-foreground">({option.count.toLocaleString()})</span>
              )}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function SizeGroup({ title, options, selected, onChange }: CheckboxGroupProps) {
  return (
    <div className="space-y-2.5">
      <h4 className="text-sm font-semibold">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value, !selected.includes(option.value))}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
              selected.includes(option.value)
                ? "border-primary bg-primary text-primary-foreground shadow"
                : "hover:border-primary/50 hover:text-primary"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ColorGroup({ title, options, selected, onChange }: CheckboxGroupProps) {
  const colorMap: Record<string, string> = {
    Black: "#111111",
    White: "#fafafa",
    Blue: "#2563eb",
    Red: "#dc2626",
    Green: "#16a34a",
    Silver: "#cbd5e1",
    Gold: "#d4af37",
    Purple: "#7c3aed",
    Pink: "#ec4899",
    Gray: "#6b7280",
    Navy: "#1e3a5f",
    Teal: "#0d9488",
    Maroon: "#7f1d1d",
    Cream: "#f5f0e1",
    Orange: "#ea580c",
    Brown: "#78350f",
    Beige: "#e7dcc3",
    Indigo: "#4f46e5",
    Cyan: "#06b6d4",
    Yellow: "#eab308"
  };
  return (
    <div className="space-y-2.5">
      <h4 className="text-sm font-semibold">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value, !selected.includes(option.value))}
            title={option.label}
            aria-label={option.label}
            className={cn(
              "relative h-7 w-7 rounded-full border-2 transition-all hover:scale-110",
              selected.includes(option.value) ? "border-primary ring-2 ring-primary/30" : "border-border"
            )}
            style={{ backgroundColor: colorMap[option.label] ?? "#94a3b8" }}
          >
            {selected.includes(option.value) && (
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white drop-shadow">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export { Label };
