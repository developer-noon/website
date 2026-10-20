'use client';

import { useState, type ReactNode } from 'react';
import { ChartBarIcon, TableCellsIcon } from '@heroicons/react/24/outline';

export type TableView = { columns: string[]; rows: (string | number)[][] };

/** Titled chart panel with a Chart / Table toggle, so every infographic also has a readable table view. */
export default function ChartCard({ title, subtitle, table, children, className = '' }: { title: string; subtitle?: string; table: TableView; children: ReactNode; className?: string }) {
  const [view, setView] = useState<'chart' | 'table'>('chart');

  return (
    <section className={`panel p-6 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-[var(--color-text-muted)]">{subtitle}</p> : null}
        </div>
        <div className="flex shrink-0 rounded-full border border-[var(--color-border)] p-1" role="group" aria-label={`${title} view`}>
          {(['chart', 'table'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setView(option)}
              aria-pressed={view === option}
              aria-label={option === 'chart' ? 'Show chart' : 'Show table'}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${view === option ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-ink)]'}`}
            >
              {option === 'chart' ? <ChartBarIcon className="h-4 w-4" aria-hidden="true" /> : <TableCellsIcon className="h-4 w-4" aria-hidden="true" />}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {view === 'chart' ? children : (
          <div className="max-h-80 overflow-auto rounded-xl border border-[var(--color-border)]">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-[var(--color-surface-raised)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                <tr>{table.columns.map((column) => <th key={column} className="px-4 py-2.5 font-semibold">{column}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {table.rows.map((row, index) => (
                  <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex} className={`px-4 py-2.5 ${cellIndex ? 'font-mono tabular-nums text-[var(--color-text)]' : 'font-semibold text-[var(--color-ink)]'}`}>{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
