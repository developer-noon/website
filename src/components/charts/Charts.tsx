'use client';

import { useState, type ComponentType } from 'react';
import { useTweenedValues } from './useTweenedValues';

/*
 * Chart palette: forest and lime for categorical series, on the Wise surfaces.
 * Re-check contrast and colour-blind separation after changing these values.
 * Single-series charts use the brand accent. Labels always use text tokens, never series colours.
 */
export const SERIES = ['#163300', '#8DD65F'] as const;
export const ACCENT = '#9fe870';

export const hours = (seconds: number) => `${(seconds / 3600).toFixed(1)}h`;

/* ---------- Stat tile ---------- */

export function StatTile({ label, value, format, Icon }: { label: string; value: number; format: (value: number) => string; Icon: ComponentType<{ className?: string }> }) {
  const [animated] = useTweenedValues([value], 1.2);
  return (
    <div className="panel flex items-center gap-4 p-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-mint)] text-[var(--color-secondary)]">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{label}</p>
        <p className="mt-1 truncate font-mono text-2xl font-bold tabular-nums text-[var(--color-ink)]" aria-label={`${label}: ${format(value)}`}>{format(animated ?? 0)}</p>
      </div>
    </div>
  );
}

/* ---------- Donut (2–3 parts of a whole) ---------- */

export function Donut({ segments, format, centerLabel }: { segments: { label: string; value: number; color: string }[]; format: (value: number) => string; centerLabel: string }) {
  const animated = useTweenedValues(segments.map((segment) => segment.value));
  const [active, setActive] = useState<number | null>(null);
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const targetTotal = segments.reduce((sum, segment) => sum + segment.value, 0);
  const gap = segments.filter((segment) => segment.value > 0).length > 1 ? 4 : 0;
  const shares = segments.map((_, index) => (targetTotal ? (animated[index] ?? 0) / targetTotal : 0));
  const offsets = shares.map((_, index) => shares.slice(0, index).reduce((sum, share) => sum + share, 0) * circumference);

  const focus = active === null ? null : segments[active];
  const percent = (value: number) => (targetTotal ? Math.round((value / targetTotal) * 100) : 0);

  return (
    <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
      <svg viewBox="0 0 200 200" className="mx-auto h-48 w-48" role="img" aria-label={segments.map((segment) => `${segment.label} ${format(segment.value)}`).join(', ')}>
        <circle cx="100" cy="100" r={radius} fill="none" stroke="var(--color-surface-raised)" strokeWidth="24" />
        <g transform="rotate(-90 100 100)">
          {segments.map((segment, index) => {
            const share = shares[index];
            const length = Math.max(0, share * circumference - gap);
            const dash = `${length} ${circumference - length}`;
            const node = (
              <circle
                key={segment.label}
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={active === index ? 30 : 24}
                strokeDasharray={dash}
                strokeDashoffset={-offsets[index]}
                opacity={active === null || active === index ? 1 : 0.3}
                className="cursor-pointer transition-[stroke-width,opacity] duration-200"
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive(null)}
              />
            );
            return node;
          })}
        </g>
        <text x="100" y="94" textAnchor="middle" className="fill-[var(--color-text-muted)] text-[11px] font-semibold uppercase tracking-wider">
          {focus ? focus.label : centerLabel}
        </text>
        <text x="100" y="120" textAnchor="middle" className="fill-[var(--color-ink)] font-mono text-[22px] font-bold">
          {focus ? `${percent(focus.value)}%` : format(targetTotal)}
        </text>
      </svg>

      <ul className="grid gap-2">
        {segments.map((segment, index) => (
          <li key={segment.label}>
            <button
              type="button"
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${active === index ? 'border-[var(--color-border-strong)] bg-[var(--color-surface-raised)]' : 'border-transparent'}`}
            >
              <span className="h-3 w-3 shrink-0 rounded-[3px]" style={{ backgroundColor: segment.color }} aria-hidden="true" />
              <span className="flex-1 text-sm font-semibold text-[var(--color-ink)]">{segment.label}</span>
              <span className="font-mono text-sm tabular-nums text-[var(--color-text)]">{format(segment.value)}</span>
              <span className="w-10 text-right font-mono text-xs tabular-nums text-[var(--color-text-muted)]">{percent(segment.value)}%</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Vertical bars (one series over an ordered axis) ---------- */

export function BarChart({ data, format, color = ACCENT, height = 200 }: { data: { label: string; value: number }[]; format: (value: number) => string; color?: string; height?: number }) {
  const animated = useTweenedValues(data.map((item) => item.value));
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((item) => item.value));
  const maxIndex = data.findIndex((item) => item.value === max);
  const labelEvery = Math.max(1, Math.ceil(data.length / 10));

  return (
    <div>
      <div className="relative" style={{ height }}>
        {/* Recessive grid: quarter lines */}
        {[0.25, 0.5, 0.75, 1].map((line) => (
          <div key={line} className="absolute inset-x-0 border-t border-dashed border-[var(--color-border)]" style={{ bottom: `${line * 100}%` }} aria-hidden="true" />
        ))}
        <span className="absolute -top-5 left-0 font-mono text-[11px] text-[var(--color-text-muted)]">{format(max)}</span>
        <div className="absolute inset-0 flex items-end gap-[2px]">
          {data.map((item, index) => {
            const share = (animated[index] ?? 0) / max;
            return (
              <button
                key={`${item.label}-${index}`}
                type="button"
                className="group relative flex h-full flex-1 items-end focus-visible:outline-none"
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
                aria-label={`${item.label}: ${format(item.value)}`}
              >
                <span
                  className="block w-full rounded-t-[4px] transition-opacity duration-200"
                  style={{ height: `${share * 100}%`, backgroundColor: color, opacity: active === null || active === index ? 1 : 0.4 }}
                />
                {active === index || (active === null && index === maxIndex) ? (
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-2.5 py-1.5 text-xs shadow-[var(--shadow-card)]" style={{ bottom: `${share * 100}%` }}>
                    <span className="block text-[var(--color-text-muted)]">{item.label}</span>
                    <span className="font-mono font-bold text-[var(--color-ink)]">{format(item.value)}</span>
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex gap-[2px] border-t border-[var(--color-border-strong)] pt-2">
        {data.map((item, index) => (
          <span key={`${item.label}-${index}`} className="flex-1 truncate text-center font-mono text-[10px] text-[var(--color-text-muted)]">
            {index % labelEvery === 0 ? item.label : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Ranked horizontal bars ---------- */

export function HBarList({ data, format, color = ACCENT }: { data: { label: string; value: number }[]; format: (value: number) => string; color?: string }) {
  const animated = useTweenedValues(data.map((item) => item.value));
  const max = Math.max(1, ...data.map((item) => item.value));
  return (
    <ol className="grid gap-3">
      {data.map((item, index) => (
        <li key={`${item.label}-${index}`} className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5">
          <span className="truncate text-sm font-semibold text-[var(--color-ink)]" title={item.label}>{item.label}</span>
          <span className="font-mono text-sm tabular-nums text-[var(--color-text)]">{format(item.value)}</span>
          <span className="col-span-2 h-2.5 overflow-hidden rounded-full bg-[var(--color-surface-raised)]">
            <span
              className="block h-full rounded-full transition-[filter] duration-200 group-hover:brightness-125"
              style={{ width: `${((animated[index] ?? 0) / max) * 100}%`, backgroundColor: color }}
            />
          </span>
        </li>
      ))}
    </ol>
  );
}

/* ---------- Two-series stacked horizontal bars ---------- */

export function StackedHBar({ rows, series, format }: { rows: { label: string; parts: [number, number] }[]; series: [string, string]; format: (value: number) => string }) {
  const animated = useTweenedValues(rows.flatMap((row) => row.parts));
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...rows.map((row) => row.parts[0] + row.parts[1]));

  return (
    <div>
      <ul className="mb-5 flex flex-wrap gap-4" aria-label="Legend">
        {series.map((name, index) => (
          <li key={name} className="flex items-center gap-2 text-sm text-[var(--color-text)]">
            <span className="h-3 w-3 rounded-[3px]" style={{ backgroundColor: SERIES[index] }} aria-hidden="true" />
            {name}
          </li>
        ))}
      </ul>
      <ol className="grid gap-4">
        {rows.map((row, rowIndex) => {
          const first = animated[rowIndex * 2] ?? 0;
          const second = animated[rowIndex * 2 + 1] ?? 0;
          return (
            <li
              key={`${row.label}-${rowIndex}`}
              className="relative"
              onMouseEnter={() => setActive(rowIndex)}
              onMouseLeave={() => setActive(null)}
            >
              <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">
                <span className="truncate font-semibold text-[var(--color-ink)]">{row.label}</span>
                <span className="font-mono tabular-nums text-[var(--color-text)]">{format(row.parts[0] + row.parts[1])}</span>
              </div>
              <div className={`flex h-3 gap-[2px] overflow-hidden rounded-full bg-[var(--color-surface-raised)] transition-opacity ${active === null || active === rowIndex ? 'opacity-100' : 'opacity-40'}`}>
                {first > 0 ? <span className="h-full rounded-l-full" style={{ width: `${(first / max) * 100}%`, backgroundColor: SERIES[0] }} /> : null}
                {second > 0 ? <span className="h-full rounded-r-full" style={{ width: `${(second / max) * 100}%`, backgroundColor: SERIES[1] }} /> : null}
              </div>
              {active === rowIndex ? (
                <div className="absolute right-0 top-full z-10 mt-2 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-2 text-xs shadow-[var(--shadow-card)]">
                  {series.map((name, index) => (
                    <p key={name} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: SERIES[index] }} aria-hidden="true" />
                      <span className="text-[var(--color-text-muted)]">{name}</span>
                      <span className="ml-auto pl-3 font-mono font-bold text-[var(--color-ink)]">{format(row.parts[index])}</span>
                    </p>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
