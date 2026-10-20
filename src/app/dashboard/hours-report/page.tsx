'use client';

import { useState, type ClipboardEvent } from 'react';
import { ArrowDownTrayIcon, ArrowPathIcon, Bars2Icon, ClipboardDocumentIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { buildReport } from '@/lib/hours-report/buildReport';
import type { Entry, Report } from '@/lib/hours-report/types';
import EmptyState from '@/components/ui/EmptyState';
import { HistoryTrend, ReportInsights } from './ReportInsights';
import { Feedback } from '@/components/ui/Feedback';

type SavedReport = {
  id: string;
  client: string;
  email: string;
  reportDate?: string;
  createdAt: string;
  totalHours: string;
};

const today = () => new Date().toISOString().slice(0, 10);
const displayDate = (value: string) => {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}.${month}.${year}` : value;
};

const field = 'field !rounded-2xl !py-3';
const label = 'grid gap-2 text-sm font-bold text-[var(--color-ink)]';
const th = 'px-4 py-3 text-left text-xs font-bold text-[var(--color-text-muted)]';

export default function HoursReportPage() {
  const [client, setClient] = useState('');
  const [email, setEmail] = useState('');
  const [reportDate, setReportDate] = useState(today);
  const [raw, setRaw] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [tab, setTab] = useState<'create' | 'history'>('create');
  const [history, setHistory] = useState<SavedReport[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  function preservePastedLinks(event: ClipboardEvent<HTMLTextAreaElement>) {
    const html = event.clipboardData.getData('text/html');
    if (!html || !/<a\b/i.test(html)) return;

    const document = new DOMParser().parseFromString(html, 'text/html');
    document.querySelectorAll('a').forEach((anchor) => {
      const href = anchor.getAttribute('href');
      const text = anchor.textContent?.trim();
      if (!href || !text || !/^https?:\/\//i.test(href)) return;
      anchor.replaceWith(document.createTextNode(`[${text}](${href})`));
    });
    document.querySelectorAll('br').forEach((breakElement) => breakElement.replaceWith('\n'));
    document.querySelectorAll('p, div, li, tr').forEach((element) => element.append('\n'));

    const converted = document.body.textContent?.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    if (!converted) return;
    event.preventDefault();
    const textarea = event.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setRaw((current) => `${current.slice(0, start)}${converted}${current.slice(end)}`);
    setTimeout(() => textarea.setSelectionRange(start + converted.length, start + converted.length));
  }

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const response = await fetch('/api/report/history');
      const result = await response.json() as { error?: string; reports?: SavedReport[] };
      if (!response.ok) throw new Error(result.error ?? 'Error');
      setHistory(result.reports ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error');
    } finally {
      setHistoryLoading(false);
    }
  }

  const openHistory = () => {
    setTab('history');
    void loadHistory();
  };

  async function preview() {
    setPreviewing(true);
    setError('');
    setWarnings([]);
    try {
      const response = await fetch('/api/report/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw }),
      });
      const result = await response.json() as { error?: string; entries?: Entry[]; report?: Report; warnings?: string[] };
      if (!response.ok || !result.entries || !result.report) throw new Error(result.error ?? 'Error');
      setEntries(result.entries);
      setReport(result.report);
      setWarnings(result.warnings ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error');
    } finally {
      setPreviewing(false);
    }
  }

  const updateEntry = (index: number, patch: Partial<Entry>) => {
    setEntries((current) => {
      const next = current.map((entry, entryIndex) => entryIndex === index ? { ...entry, ...patch } : entry);
      setReport(buildReport(next));
      return next;
    });
  };

  const removeEntry = (index: number) => {
    setEntries((current) => {
      const next = current.filter((_, entryIndex) => entryIndex !== index);
      setReport(buildReport(next));
      return next;
    });
  };

  const addEntry = () => {
    const next = [...entries, { date: '01/01/2026', category: 'video' as const, project: 'New task', time: '00:00:00' }];
    setEntries(next);
    setReport(buildReport(next));
  };

  const moveEntryTo = (sourceIndex: number, targetCategory: Entry['category'], targetPosition: number) => {
    setEntries((current) => {
      const source = current[sourceIndex];
      if (!source) return current;
      const next = current.filter((_, index) => index !== sourceIndex);
      const targetIndexes = next.reduce<number[]>((indexes, item, index) => {
        if (item.category === targetCategory) indexes.push(index);
        return indexes;
      }, []);
      const sourceSectionPosition = current.slice(0, sourceIndex).filter((item) => item.category === source.category).length;
      const adjustedPosition = source.category === targetCategory && sourceSectionPosition < targetPosition
        ? targetPosition - 1
        : targetPosition;
      const boundedPosition = Math.max(0, Math.min(adjustedPosition, targetIndexes.length));
      const insertIndex = boundedPosition < targetIndexes.length
        ? targetIndexes[boundedPosition]
        : (targetIndexes.at(-1) ?? next.length - 1) + 1;
      next.splice(insertIndex, 0, { ...source, category: targetCategory });
      setReport(buildReport(next));
      return next;
    });
    setDraggedIndex(null);
  };

  async function generate() {
    if (!entries.length) {
      setError('Preview first');
      return;
    }
    setBusy(true);
    setError('');
    setWarnings([]);
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client, email, date: displayDate(reportDate), entries }),
      });
      if (!response.ok) {
        const result = await response.json() as { error?: string };
        throw new Error(result.error ?? 'Error');
      }
      const encodedWarnings = response.headers.get('X-Report-Warnings');
      if (encodedWarnings) setWarnings(JSON.parse(decodeURIComponent(encodedWarnings)) as string[]);
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Hours_Report.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error');
    } finally {
      setBusy(false);
    }
  }

  const segment = (active: boolean) =>
    `rounded-full px-5 py-2.5 text-sm font-bold transition-colors duration-200 ${active
      ? 'bg-[var(--color-ink)] text-white'
      : 'text-[var(--color-text-muted)] hover:text-[var(--color-ink)]'}`;

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-10">
      <div className="inline-flex gap-1 rounded-full bg-[var(--color-surface)] p-1.5 shadow-sm">
        <button type="button" onClick={() => setTab('create')} className={segment(tab === 'create')}>New</button>
        <button type="button" onClick={openHistory} className={segment(tab === 'history')}>History</button>
      </div>

      {tab === 'create' ? (
        <>
          <section className="panel p-7 sm:p-10">
            <div className="grid gap-6 sm:grid-cols-3">
              <label className={label}>
                Client
                <input className={field} value={client} onChange={(event) => setClient(event.target.value)} />
              </label>
              <label className={label}>
                Email
                <input className={field} type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              <label className={label}>
                Date
                <input className={field} type="date" value={reportDate} onChange={(event) => setReportDate(event.target.value)} />
              </label>
            </div>

            <label className={`${label} mt-8`}>
              Clockify export
              <textarea className={`${field} min-h-64 font-mono text-xs`} value={raw} onChange={(event) => setRaw(event.target.value)} onPaste={preservePastedLinks} />
            </label>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <button type="button" onClick={preview} disabled={previewing || !raw.trim()} className="cta-secondary disabled:opacity-40">
                {previewing ? <ArrowPathIcon className="h-5 w-5 spin" aria-hidden="true" /> : <ClipboardDocumentIcon className="h-5 w-5" aria-hidden="true" />}
                Preview
              </button>
              {error ? <Feedback tone="error" label={error} /> : null}
              {warnings.map((warning) => <Feedback key={warning} tone="warning" label={warning} />)}
            </div>
          </section>

          {report ? <ReportInsights entries={entries} /> : null}

          {report ? (
            <section className="panel p-7 sm:p-10">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div>
                  <p className="text-sm font-bold text-[var(--color-text-muted)]">{displayDate(reportDate) || '—'}</p>
                  <h2 className="mt-1">{client || '—'}</h2>
                </div>
                <div className="rounded-3xl bg-[var(--color-primary)] px-6 py-4 text-right">
                  <p className="text-xs font-bold text-[var(--color-on-primary)]/70">Total</p>
                  <p className="font-mono text-3xl font-extrabold text-[var(--color-on-primary)]">{report.grandTotal}</p>
                </div>
              </div>

              {report.sections.map((section) => {
                const sectionCategory = section.title === 'VIDEO EDITING' ? 'video' : 'admin';
                const dropping = dragOverTarget === sectionCategory;
                return (
                  <section
                    key={section.title}
                    className={`mt-8 rounded-[24px] border-2 border-dashed p-3 transition-colors ${dropping ? 'border-[var(--color-ink)] bg-[var(--color-mint)]' : 'border-transparent'}`}
                    onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setDragOverTarget(sectionCategory); }}
                    onDragLeave={() => setDragOverTarget(null)}
                    onDrop={(event) => { event.preventDefault(); event.stopPropagation(); if (draggedIndex !== null) moveEntryTo(draggedIndex, sectionCategory, section.rows.length); setDragOverTarget(null); }}
                  >
                    <div className="mb-3 flex items-center justify-between px-2">
                      <h3 className="text-sm font-extrabold tracking-wide text-[var(--color-ink)]">{section.title === 'VIDEO EDITING' ? 'Video' : 'Admin'}</h3>
                      <span className="rounded-full bg-[var(--color-surface-raised)] px-3 py-1 font-mono text-sm font-bold text-[var(--color-ink)]">{section.total}</span>
                    </div>
                    <div className="overflow-x-auto rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)]">
                      <table className="w-full min-w-[900px] text-sm text-[var(--color-text)]">
                        <thead className="bg-[var(--color-surface-raised)]">
                          <tr>
                            <th className="w-12 px-3 py-3" aria-label="Move" />
                            <th className={th}>Date</th>
                            <th className={th}>Type</th>
                            <th className={th}>Task</th>
                            <th className={th}>Time</th>
                            <th className="w-12 px-3 py-3" aria-label="Remove" />
                          </tr>
                        </thead>
                        <tbody>
                          {section.rows.map((row, rowPosition) => {
                            const index = entries.indexOf(row);
                            const rowTarget = `${sectionCategory}-${rowPosition}`;
                            const marked = dragOverTarget === rowTarget;
                            return (
                              <tr
                                key={`${row.date}-${row.project}-${index}`}
                                onDragOver={(event) => { event.preventDefault(); event.stopPropagation(); event.dataTransfer.dropEffect = 'move'; setDragOverTarget(rowTarget); }}
                                onDrop={(event) => { event.preventDefault(); event.stopPropagation(); if (draggedIndex !== null && draggedIndex !== index) moveEntryTo(draggedIndex, sectionCategory, rowPosition); setDragOverTarget(null); }}
                                className={`border-t border-[var(--color-border)] transition-opacity ${draggedIndex === index ? 'opacity-40' : ''} ${marked ? 'shadow-[inset_0_3px_0_var(--color-ink)]' : ''}`}
                              >
                                <td className="px-3 py-2">
                                  <button
                                    type="button"
                                    draggable
                                    onDragStart={(event) => { event.stopPropagation(); event.dataTransfer.setData('text/plain', String(index)); event.dataTransfer.effectAllowed = 'move'; setDraggedIndex(index); }}
                                    onDragEnd={() => { setDraggedIndex(null); setDragOverTarget(null); }}
                                    className="flex h-9 w-9 cursor-grab items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-ink)] active:cursor-grabbing"
                                    aria-label={`Move ${row.project}`}
                                  >
                                    <Bars2Icon className="h-4 w-4" aria-hidden="true" />
                                  </button>
                                </td>
                                <td className="px-2 py-2"><input className={`${field} w-32 !py-2`} value={row.date} onChange={(event) => updateEntry(index, { date: event.target.value })} /></td>
                                <td className="px-2 py-2">
                                  <select className={`${field} w-40 !py-2`} value={row.category} onChange={(event) => updateEntry(index, { category: event.target.value as Entry['category'] })}>
                                    <option value="video">Video</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                </td>
                                <td className="px-2 py-2"><input className={`${field} !py-2`} value={row.project} onChange={(event) => updateEntry(index, { project: event.target.value })} /></td>
                                <td className="px-2 py-2"><input className={`${field} w-32 font-mono !py-2`} value={row.time} onChange={(event) => updateEntry(index, { time: event.target.value })} /></td>
                                <td className="px-3 py-2">
                                  <button type="button" onClick={() => removeEntry(index)} aria-label="Remove row" className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]">
                                    <TrashIcon className="h-4 w-4" aria-hidden="true" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </section>
                );
              })}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
                <button type="button" onClick={addEntry} className="cta-ghost">
                  <PlusIcon className="h-5 w-5" aria-hidden="true" /> Row
                </button>
                <button type="button" onClick={generate} disabled={busy || !entries.length} className="cta-primary !py-4">
                  {busy ? <ArrowPathIcon className="h-5 w-5 spin" aria-hidden="true" /> : <ArrowDownTrayIcon className="h-5 w-5" aria-hidden="true" />}
                  PDF
                </button>
              </div>
            </section>
          ) : null}
        </>
      ) : (
        <section className="panel p-7 sm:p-10">
          {error ? <Feedback tone="error" label={error} /> : null}
          {historyLoading ? (
            <div className="flex justify-center py-16"><ArrowPathIcon className="h-10 w-10 spin text-[var(--color-ink)]" aria-hidden="true" /></div>
          ) : history.length ? (
            <div className="space-y-6">
            <HistoryTrend reports={history} />
            <div className="overflow-x-auto rounded-[20px] border border-[var(--color-border)]">
              <table className="w-full min-w-[720px] text-sm text-[var(--color-text)]">
                <thead className="bg-[var(--color-surface-raised)]">
                  <tr>
                    <th className={th}>Client</th>
                    <th className={th}>Date</th>
                    <th className={th}>Created</th>
                    <th className={th}>Total</th>
                    <th className={th}>PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)]">
                      <td className="px-4 py-4 font-bold text-[var(--color-ink)]">{item.client}</td>
                      <td className="px-4 py-4">{item.reportDate || '—'}</td>
                      <td className="px-4 py-4 text-[var(--color-text-muted)]">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-4 font-mono font-bold">{item.totalHours}</td>
                      <td className="px-4 py-4">
                        <a href={`/api/report/${encodeURIComponent(item.id)}`} download aria-label="Download PDF" className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] transition-transform hover:scale-110">
                          <ArrowDownTrayIcon className="h-5 w-5" aria-hidden="true" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          ) : (
            <EmptyState scene="report" title="No reports yet" action={<button type="button" onClick={() => setTab('create')} className="cta-primary">New</button>} />
          )}
        </section>
      )}
    </div>
  );
}
