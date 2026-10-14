'use client';

import { useState, type ClipboardEvent } from 'react';
import { buildReport } from '@/lib/hours-report/buildReport';
import type { Entry, Report } from '@/lib/hours-report/types';

type SavedReport = {
  id: string;
  client: string;
  email: string;
  reportDate: string;
  createdAt: string;
  totalHours: string;
};

const today = () => new Date().toISOString().slice(0, 10);
const displayDate = (value: string) => {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}.${month}.${year}`;
};

export default function HoursReportPage() {
  const [client, setClient] = useState('Summer Huntington');
  const [email, setEmail] = useState('summerhuntington@gmail.com');
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
      const label = anchor.textContent?.trim();
      if (!href || !label || !/^https?:\/\//i.test(href)) return;
      anchor.replaceWith(document.createTextNode(`[${label}](${href})`));
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
      if (!response.ok) throw new Error(result.error ?? 'Unable to load report history.');
      setHistory(result.reports ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load report history.');
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
      if (!response.ok || !result.entries || !result.report) throw new Error(result.error ?? 'Unable to preview the report.');
      setEntries(result.entries);
      setReport(result.report);
      setWarnings(result.warnings ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to preview the report.');
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
      setError('Preview the Clockify report before downloading the PDF.');
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
        throw new Error(result.error ?? 'Unable to generate the report.');
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
      setError(cause instanceof Error ? cause.message : 'Unable to generate the report.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-3 py-8 sm:px-5 lg:px-8">
      <div className="mb-6 flex gap-1 border-b border-[#dbe3ee]">
        <button type="button" onClick={() => setTab('create')} className={`border-b-2 px-4 py-3 text-sm font-semibold ${tab === 'create' ? 'border-[#111827] text-[#111827]' : 'border-transparent text-[#64748b]'}`}>Create report</button>
        <button type="button" onClick={openHistory} className={`border-b-2 px-4 py-3 text-sm font-semibold ${tab === 'history' ? 'border-[#111827] text-[#111827]' : 'border-transparent text-[#64748b]'}`}>Report history</button>
      </div>
      <div className={tab === 'history' ? 'hidden' : ''}>
      <div className="brand-card border-t-0 bg-white p-8 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">Dashboard / Hours report</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-[#111827]">Generate an hours report</h1>
        <p className="mt-4 max-w-2xl text-[#64748b]">Paste the Clockify summary export and download a Brandefy-formatted PDF grouped into video editing and business admin.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[#374151]">Client<input className="input mt-1" value={client} onChange={(event) => setClient(event.target.value)} /></label>
          <label className="text-sm font-semibold text-[#374151]">Email<input className="input mt-1" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label className="text-sm font-semibold text-[#374151]">Report date<input className="input mt-1" type="date" value={reportDate} onChange={(event) => setReportDate(event.target.value)} /></label>
        </div>
        <label className="mt-4 block text-sm font-semibold text-[#374151]">Clockify report<textarea className="input mt-1 min-h-72 font-mono text-xs" value={raw} onChange={(event) => setRaw(event.target.value)} onPaste={preservePastedLinks} placeholder="Paste the Clockify report here" /></label>
        <button type="button" onClick={preview} disabled={previewing || !raw.trim()} className="mt-5 rounded-none border border-[#111827] px-5 py-3 text-sm font-semibold text-[#111827] disabled:cursor-not-allowed disabled:opacity-50">{previewing ? 'Preparing preview…' : 'Preview report'}</button>
        {error ? <p className="mt-4 text-sm text-red-700" role="alert">{error}</p> : null}
        {warnings.map((warning) => <p key={warning} className="mt-3 text-sm text-amber-700">Warning: {warning}</p>)}
      </div>
      {report ? <div className="mt-8 space-y-6">
        <div className="brand-card border-t-0 bg-white p-8 shadow-sm sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#dbe3ee] pb-5">
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">Editable preview</p><h2 className="mt-2 text-2xl font-semibold text-[#111827]">Hours report</h2></div>
            <div className="text-right text-sm text-[#64748b]"><p>{client || 'No client'}</p><p>{email || 'No email'}</p><p>{displayDate(reportDate) || 'No date'}</p></div>
          </div>
          {report.sections.map((section) => { const sectionCategory = section.title === 'VIDEO EDITING' ? 'video' : 'admin'; return <section key={section.title} className={`mt-6 rounded-md border-2 p-2 transition ${dragOverTarget === sectionCategory ? 'border-[#2563eb] bg-[#eff6ff]' : 'border-transparent'}`} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setDragOverTarget(sectionCategory); }} onDragLeave={() => setDragOverTarget(null)} onDrop={(event) => { event.preventDefault(); event.stopPropagation(); if (draggedIndex !== null) moveEntryTo(draggedIndex, sectionCategory, section.rows.length); setDragOverTarget(null); }}><h3 className="mb-2 text-sm font-bold tracking-wide text-[#111827]">{section.title}</h3><div className="overflow-x-auto"><table className="w-full min-w-[950px] text-left text-sm"><thead className="bg-[#2b2b2b] text-xs text-white"><tr><th className="w-12 px-3 py-2" aria-label="Drag handle" /><th className="px-3 py-2">Date</th><th className="px-3 py-2">Category</th><th className="px-3 py-2">Project / task</th><th className="px-3 py-2">Time</th><th className="px-3 py-2">Action</th></tr></thead><tbody>{section.rows.map((row, rowPosition) => { const index = entries.indexOf(row); const rowTarget = `${sectionCategory}-${rowPosition}`; return <tr key={`${row.date}-${row.project}-${index}`} onDragOver={(event) => { event.preventDefault(); event.stopPropagation(); event.dataTransfer.dropEffect = 'move'; setDragOverTarget(rowTarget); }} onDrop={(event) => { event.preventDefault(); event.stopPropagation(); if (draggedIndex !== null && draggedIndex !== index) moveEntryTo(draggedIndex, sectionCategory, rowPosition); setDragOverTarget(null); }} className={`border-b border-[#e5e7eb] ${draggedIndex === index ? 'opacity-40' : ''} ${dragOverTarget === rowTarget ? 'border-t-2 border-t-[#2563eb]' : ''}`}><td className="px-2 py-2"><button type="button" draggable onDragStart={(event) => { event.stopPropagation(); event.dataTransfer.setData('text/plain', String(index)); event.dataTransfer.effectAllowed = 'move'; setDraggedIndex(index); }} onDragEnd={() => { setDraggedIndex(null); setDragOverTarget(null); }} className="flex cursor-grab touch-none flex-col gap-0.5 rounded p-2 text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#111827] active:cursor-grabbing" aria-label={`Drag ${row.project}`}><span className="flex gap-1"><span className="h-1 w-1 rounded-full bg-current" /><span className="h-1 w-1 rounded-full bg-current" /></span><span className="flex gap-1"><span className="h-1 w-1 rounded-full bg-current" /><span className="h-1 w-1 rounded-full bg-current" /></span><span className="flex gap-1"><span className="h-1 w-1 rounded-full bg-current" /><span className="h-1 w-1 rounded-full bg-current" /></span></button></td><td className="px-2 py-2"><input className="input w-32" value={row.date} onChange={(event) => updateEntry(index, { date: event.target.value })} /></td><td className="px-2 py-2"><select className="input w-36" value={row.category} onChange={(event) => updateEntry(index, { category: event.target.value as Entry['category'] })}><option value="video">Video Editing</option><option value="admin">Business Admin</option></select></td><td className="px-2 py-2"><input className="input" value={row.project} onChange={(event) => updateEntry(index, { project: event.target.value })} /></td><td className="px-2 py-2"><input className="input w-32" value={row.time} onChange={(event) => updateEntry(index, { time: event.target.value })} /></td><td className="px-2 py-2"><button type="button" onClick={() => removeEntry(index)} className="text-sm font-semibold text-red-700">Remove</button></td></tr>; })}</tbody></table></div><p className="mt-2 text-right text-sm font-semibold text-[#374151]">Subtotal: {section.total}</p></section>; })}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#111827] pt-4"><p className="font-bold text-[#111827]">TOTAL HOURS: {report.grandTotal}</p><button type="button" onClick={addEntry} className="rounded-none border border-[#dbe3ee] px-4 py-2 text-sm font-semibold text-[#111827]">Add row</button></div>
        </div>
        <button type="button" onClick={generate} disabled={busy || !entries.length} className="rounded-none bg-[#111827] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Generating…' : 'Download PDF'}</button>
      </div> : null}
      </div>
      {tab === 'history' ? <div className="mt-6 brand-card border-t-0 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">Saved reports</p><h2 className="mt-2 text-2xl font-semibold text-[#111827]">Report history</h2></div><button type="button" onClick={() => void loadHistory()} className="text-sm font-semibold text-[#2563eb]">Refresh</button></div>
        {error ? <p className="mt-6 text-sm text-red-700" role="alert">{error}</p> : null}
        {!error && (historyLoading ? <p className="mt-6 text-sm text-[#64748b]">Loading report history…</p> : history.length ? <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#2b2b2b] text-xs text-white"><tr><th className="px-4 py-3">Client</th><th className="px-4 py-3">Report date</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Hours</th><th className="px-4 py-3">Action</th></tr></thead><tbody>{history.map((item) => <tr key={item.id} className="border-b border-[#e5e7eb]"><td className="px-4 py-4 font-semibold text-[#111827]">{item.client}</td><td className="px-4 py-4">{item.reportDate}</td><td className="px-4 py-4">{new Date(item.createdAt).toLocaleString()}</td><td className="px-4 py-4 font-semibold">{item.totalHours}</td><td className="px-4 py-4"><a href={`/api/report/${encodeURIComponent(item.id)}`} download className="font-semibold text-[#2563eb]">Download PDF</a></td></tr>)}</tbody></table></div> : <p className="mt-6 text-sm text-[#64748b]">No saved reports yet. Generate a PDF to create the first history record.</p>)}
      </div> : null}
    </div>
  );
}
