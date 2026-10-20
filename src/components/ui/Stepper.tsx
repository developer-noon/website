import { CheckIcon } from '@heroicons/react/24/outline';

/** Dots joined by a line. Completed steps show a tick. */
export default function Stepper({ steps, current }: { steps: number; current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label={`Step ${current + 1} of ${steps}`}>
      {Array.from({ length: steps }, (_, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={index} className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors duration-300 ${
                done || active ? 'border-[var(--color-primary)]' : 'border-[var(--color-border-strong)]'
              }`}
              style={{
                backgroundColor: done ? 'var(--color-mint)' : active ? 'var(--color-primary)' : 'transparent',
                color: done ? 'var(--color-secondary)' : active ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
              }}
            >
              {done ? <CheckIcon className="h-4 w-4" aria-hidden="true" /> : index + 1}
            </span>
            {index < steps - 1 ? <span className={`h-0.5 w-8 rounded-full ${done ? 'bg-[var(--color-ink)]' : 'bg-[var(--color-border)]'}`} /> : null}
          </li>
        );
      })}
    </ol>
  );
}
