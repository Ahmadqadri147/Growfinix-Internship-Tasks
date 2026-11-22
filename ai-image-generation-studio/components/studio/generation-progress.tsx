'use client';

const STAGES = [
  'Reading the brief',
  'Composing the scene',
  'Setting light and surface',
  'Rendering detail',
  'Finishing the frame',
];

interface GenerationProgressProps {
  count: number;
  elapsed: number;
  aspectRatio: string;
}

export function GenerationProgress({ count, elapsed, aspectRatio }: GenerationProgressProps) {
  const stageIndex = Math.min(Math.floor(elapsed / 7), STAGES.length - 1);
  const stage = STAGES[stageIndex];

  return (
    <div className="surface p-5 sm:p-6" aria-live="polite">
      <div className="flex items-center justify-between gap-4">
        <p className="eyebrow">Rendering</p>
        <span className="font-mono text-[11px] tabular-nums text-ink-soft">
          {elapsed.toFixed(1)}s
        </span>
      </div>

      <div className="progress-track mt-4" role="presentation" />

      <p className="mt-5 font-serif text-2xl leading-tight">{stage}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Working on {count} {count === 1 ? 'frame' : 'frames'}. Large frames can take up to a
        minute.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2">
        {Array.from({ length: Math.min(count, 4) }).map((_, index) => (
          <div
            key={index}
            className="skeleton overflow-hidden rounded-[2px] border border-line"
            style={{ aspectRatio: aspectRatio.replace(':', ' / ') }}
          />
        ))}
      </div>
    </div>
  );
}
