import { clientDay } from '@/components/marketing/content';

const dayStart = 9;
const dayEnd = 18;
const span = dayEnd - dayStart;
const hours = Array.from({ length: span + 1 }, (_, index) => dayStart + index);

const toneClass: Record<string, string> = {
  primary: 'bg-[var(--color-primary)] text-[var(--color-on-primary)]',
  mint: 'bg-[var(--color-mint)] text-[var(--color-secondary)]',
  ink: 'bg-[var(--color-forest)] text-[var(--color-primary)]',
};

/** One client day on a 9-to-6 axis. Segments draw in one after another when the card scrolls into view. */
export default function DayTimeline({ blocks = clientDay }: { blocks?: typeof clientDay }) {
  return (
    <div className="panel p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <p className="font-display text-2xl text-[var(--color-ink)]">Your day, by client</p>
        <span className="eyebrow !py-1 text-xs">7.5 h billable</span>
      </div>

      <div className="relative mt-10 h-16">
        <div className="absolute inset-x-0 top-1/2 h-px bg-[var(--color-border-strong)]" aria-hidden="true" />
        {blocks.map((block, index) => {
          const left = ((block.start - dayStart) / span) * 100;
          const width = ((block.end - block.start) / span) * 100;
          return (
            <div
              key={`${block.client}-${index}`}
              data-timeline-block
              className={`timeline-block absolute top-1/2 flex h-12 -translate-y-1/2 items-center rounded-full px-4 text-sm font-semibold ${toneClass[block.tone]}`}
              style={{ left: `${left}%`, width: `${width}%`, animationDelay: `${index * 180}ms` }}
            >
              <span className="truncate">{block.client}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-between text-xs font-semibold text-[var(--color-text-muted)]">
        {hours.map((hour) => (
          <span key={hour}>{String(hour).padStart(2, '0')}:00</span>
        ))}
      </div>
    </div>
  );
}
