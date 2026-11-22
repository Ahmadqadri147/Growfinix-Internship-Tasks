import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, hint, aside, children, className }: FieldProps) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="field-label mb-0">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {hint ? <p className="mt-2 text-xs leading-relaxed text-muted">{hint}</p> : null}
    </div>
  );
}

interface SegmentedProps {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Segmented({ label, options, value, onChange, className }: SegmentedProps) {
  return (
    <fieldset className={className}>
      <legend className="field-label">{label}</legend>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option)}
              className={cn(
                'rounded-[2px] border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors',
                active
                  ? 'border-ink bg-ink text-canvas'
                  : 'border-line bg-transparent text-ink-soft hover:border-line-strong hover:text-ink'
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

interface RangeFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  hint?: string;
}

export function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
  hint,
}: RangeFieldProps) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label className="field-label mb-0" htmlFor={`range-${label}`}>
          {label}
        </label>
        <span className="font-mono text-[11px] tabular-nums text-ink">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <input
        id={`range-${label}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line accent-accent"
      />
      {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
