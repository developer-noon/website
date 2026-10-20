'use client';

import { useEffect, useState } from 'react';
import { CheckCircleIcon, ClockIcon, DocumentArrowDownIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const days = [
  { label: 'M', hours: 7.5 },
  { label: 'T', hours: 6.2 },
  { label: 'W', hours: 8.0 },
  { label: 'T', hours: 5.4 },
  { label: 'F', hours: 7.1 },
];
const maxHours = 8;
const startSeconds = 2 * 3600 + 14 * 60 + 9;

function format(total: number) {
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60].map((part) => String(part).padStart(2, '0'));
}

/** Product preview: a live timer, a week of bars, and a billed-state chip. Flat shapes only. */
export default function HeroPreview() {
  const [elapsed, setElapsed] = useState(startSeconds);

  useEffect(() => {
    const interval = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const [hh, mm, ss] = format(elapsed);

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -right-4 -top-6 hidden h-28 w-28 rounded-full bg-[var(--color-primary)] sm:block" aria-hidden="true" />
      <div className="absolute -bottom-8 -left-6 hidden h-20 w-20 rounded-3xl bg-[var(--color-mint)] sm:block" aria-hidden="true" />

      <div className="panel relative overflow-hidden p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-bold text-[var(--color-ink)]">
            <span className="pulse-dot relative inline-block h-2.5 w-2.5 rounded-full bg-[var(--color-success)]" aria-hidden="true" />
            Tracking
          </span>
          <span className="eyebrow !py-1 text-xs">Acme Ltd</span>
        </div>

        <div className="mt-5 rounded-3xl bg-[var(--color-on-primary)] p-6 text-center">
          <p className="font-mono text-4xl font-bold tabular-nums text-[var(--color-primary)] sm:text-5xl" suppressHydrationWarning>
            {hh}
            <span className="blink-colon">:</span>
            {mm}
            <span className="blink-colon">:</span>
            {ss}
          </p>
          <p className="mt-2 text-sm text-[var(--color-primary)]/80">Client onboarding</p>
        </div>

        <div className="mt-6 flex h-36 items-end justify-between gap-3 px-1">
          {days.map((day, index) => (
            <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div className="flex h-full w-full items-end">
                <div className="grow-bar w-full rounded-t-2xl bg-[var(--color-primary)]" style={{ height: `${(day.hours / maxHours) * 100}%`, animationDelay: `${index * 110}ms` }} />
              </div>
              <span className="text-xs font-semibold text-[var(--color-text-muted)]">{day.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {[
            { Icon: ClockIcon, value: '34.2h' },
            { Icon: CheckCircleIcon, value: '21.0h' },
            { Icon: DocumentArrowDownIcon, value: 'PDF' },
          ].map(({ Icon, value }, index) => (
            <div key={index} className="flex flex-col items-center gap-1 rounded-2xl bg-[var(--color-surface-raised)] py-3">
              <Icon className="h-5 w-5 text-[var(--color-ink)]" aria-hidden="true" />
              <span className="text-sm font-bold text-[var(--color-ink)]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel absolute -right-6 top-44 hidden items-center gap-3 p-3 pr-5 sm:flex">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]">
          <UserGroupIcon className="h-5 w-5 text-[var(--color-on-primary)]" aria-hidden="true" />
        </span>
        <span className="text-sm font-bold text-[var(--color-ink)]">3 teammates</span>
      </div>
    </div>
  );
}
