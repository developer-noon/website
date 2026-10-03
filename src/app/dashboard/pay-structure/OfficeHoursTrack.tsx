'use client';

import {
  ArrowTrendingUpIcon,
  ArrowUpTrayIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PencilSquareIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ALLOWED_OFFICE_HOUR_CLIENTS, durationToSeconds, formatDuration, sanitizeOfficeHoursStore } from '@/lib/office-hours';

type Tab = 'clients' | 'hours' | 'pay' | 'income';
type Client = { id: string; name: string; company: string; rate: number; status: 'Active' | 'Archived' };
type Entry = {
  id: string;
  date: string;
  arrival: string;
  leaving: string;
  clientId: string;
  task: string;
  hours: string;
  cycleId: string;
};
type Cycle = { id: string; label: string; closedAt: string; notes: string };
type Store = { clients: Client[]; entries: Entry[]; cycles: Cycle[]; basePay: number; exchangeRate: number; officeStart: string; officeEnd: string };

const today = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 10);
const initialStore: Store = {
  clients: [
    ...ALLOWED_OFFICE_HOUR_CLIENTS.map((name, index) => ({ id: `client-${index + 1}`, name, company: name, rate: 2475, status: 'Active' as const })),
  ],
  entries: [],
  cycles: [],
  basePay: 50000,
  exchangeRate: 275,
  officeStart: '14:00',
  officeEnd: '00:00',
};

const money = (value: number) => `${Math.round(value).toLocaleString('en-US')} PKR`;
const officeSpanSeconds = (start: string, end: string) => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes < 0) minutes += 24 * 60;
  return minutes * 60;
};
const monthLabel = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

export default function OfficeHoursTrack() {
  const searchParams = useSearchParams();
  const queryTab = searchParams.get('tab') as Tab | null;
  const [importStatus, setImportStatus] = useState('');
  const [dbLoaded, setDbLoaded] = useState(false);
  const [store, setStore] = useState<Store>(initialStore);
  const selectedTab: Tab = queryTab && ['clients', 'hours', 'pay', 'income'].includes(queryTab) ? queryTab : 'hours';
  useEffect(() => {
    window.localStorage.setItem('office-hours-track', JSON.stringify(store));
    if (dbLoaded) {
      const timeout = window.setTimeout(() => {
        void fetch('/api/office-hours', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ store }) });
      }, 400);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [dbLoaded, store]);
  useEffect(() => {
    let mounted = true;
    const saved = window.localStorage.getItem('office-hours-track');
    let localStore: Store | null = null;
    if (saved) {
      try {
        localStore = sanitizeOfficeHoursStore(JSON.parse(saved) as Store);
      } catch {
        window.localStorage.removeItem('office-hours-track');
      }
    }
    void fetch('/api/office-hours')
      .then((response) => response.json() as Promise<{ store?: Store | null }>)
      .then((result) => {
        if (mounted && result.store) setStore(sanitizeOfficeHoursStore(result.store));
        else if (mounted && localStore) setStore(localStore);
        if (mounted) setDbLoaded(true);
      })
      .catch(() => {
        if (mounted && localStore) setStore(localStore);
        if (mounted) setDbLoaded(true);
      });
    return () => { mounted = false; };
  }, []);

  const activeEntries = store.entries.filter((entry) => entry.cycleId === 'active');
  const totalClientHours = activeEntries.reduce((sum, entry) => sum + durationToSeconds(entry.hours), 0) / 3600;
  const totalOfficeSeconds = [...new Map(activeEntries.map((entry) => [entry.date, entry])).values()]
    .reduce((sum, entry) => sum + officeSpanSeconds(entry.arrival, entry.leaving), 0);
  const updateStore = <K extends keyof Store>(key: K, value: Store[K]) => setStore((current) => ({ ...current, [key]: value }));
  const updateEntry = (id: string, patch: Partial<Entry>) => setStore((current) => ({ ...current, entries: current.entries.map((entry) => entry.id === id ? { ...entry, ...patch } : entry) }));
  const addEntry = () => setStore((current) => ({ ...current, entries: [{ id: uid(), date: today(), arrival: current.officeStart, leaving: current.officeEnd, clientId: current.clients[0]?.id ?? '', task: '', hours: '00:00:00', cycleId: 'active' }, ...current.entries] }));
  const addClient = () => setStore((current) => ({ ...current, clients: [...current.clients, { id: uid(), name: 'New client', company: '', rate: 2475, status: 'Active' }] }));
  const closeMonth = () => {
    const date = window.prompt('Close this cycle through date (YYYY-MM-DD):', today());
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    const cycleEntries = store.entries.filter((entry) => entry.cycleId === 'active' && entry.date <= date);
    if (!cycleEntries.length) return;
    const cycle: Cycle = { id: `cycle-${uid()}`, label: monthLabel(date), closedAt: date, notes: '' };
    setStore((current) => ({ ...current, cycles: [...current.cycles, cycle], entries: current.entries.map((entry) => entry.cycleId === 'active' && entry.date <= date ? { ...entry, cycleId: cycle.id } : entry) }));
  };
  const importCsv = async (file: File) => {
    setImportStatus('Importing CSV…');
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/office-hours/import', { method: 'POST', body: formData });
    const result = await response.json() as { error?: string; store?: Store; imported?: number };
    if (!response.ok || !result.store) {
      setImportStatus(result.error ?? 'CSV import failed.');
      return;
    }
    setStore(result.store);
    setImportStatus(`${result.imported ?? 0} rows imported to MongoDB.`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f6f8fb] text-[#16202f]">
      <div className="border-b border-[#e7ebf1] bg-white px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">Operations workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-[#111827]">OfficeHours<span className="text-[#2563eb]">Track</span></h1><p className="mt-1 text-sm text-[#64748b]">Your client work, office time, and payout in one place.</p></div>
            <div className="flex items-center gap-2 rounded-xl border border-[#dbe3ee] bg-[#f8fafc] px-3 py-2 text-xs font-medium text-[#475569]"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Autosaved locally</div>
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8">
        {selectedTab === 'clients' && <ClientsView store={store} updateStore={updateStore} addClient={addClient} />}
        {selectedTab === 'hours' && <HoursView store={store} entries={store.entries} updateStore={updateStore} updateEntry={updateEntry} addEntry={addEntry} closeMonth={closeMonth} importCsv={importCsv} importStatus={importStatus} />}
        {selectedTab === 'pay' && <PayView store={store} hours={totalClientHours} totalOfficeSeconds={totalOfficeSeconds} updateStore={updateStore} />}
        {selectedTab === 'income' && <IncomeView store={store} updateStore={updateStore} />}
      </main>
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) { return <section className={`rounded-2xl border border-[#e6ebf2] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] ${className}`}>{children}</section>; }
function Stat({ label, value, detail, icon }: { label: string; value: string; detail?: string; icon: React.ReactNode }) { return <Card className="p-5"><div className="flex items-center justify-between"><span className="text-sm font-medium text-[#64748b]">{label}</span><span className="rounded-lg bg-[#eff4ff] p-2 text-[#2563eb]">{icon}</span></div><p className="mt-4 text-2xl font-bold text-[#111827]">{value}</p>{detail && <p className="mt-1 text-xs text-[#94a3b8]">{detail}</p>}</Card>; }
function Field({ label, value, onChange, type = 'text', className = '' }: { label?: string; value: string | number; onChange: (value: string) => void; type?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      {label ? <span className="mb-1.5 block text-xs font-semibold text-[#64748b]">{label}</span> : null}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-[#dbe3ee] bg-white px-3 py-2 text-sm text-[#1e293b] outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10" />
    </label>
  );
}

function ClientsView({ store, updateStore, addClient }: { store: Store; updateStore: <K extends keyof Store>(key: K, value: Store[K]) => void; addClient: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const updateClient = (id: string, patch: Partial<Client>) => updateStore('clients', store.clients.map((client) => client.id === id ? { ...client, ...patch } : client));
  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-bold text-[#111827]">Clients</h2><p className="mt-1 text-sm text-[#64748b]">Manage client details and rates connected to your time entries.</p></div><button type="button" onClick={addClient} className="flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20"><PlusIcon className="h-4 w-4" /> Add client</button></div><Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#94a3b8]"><tr>{['Client', 'Company / Brand', 'Hourly value', 'Current cycle hours', 'Generated value', 'Status', ''].map((heading) => <th key={heading} className="px-5 py-4 font-semibold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-[#eef2f7]">{store.clients.map((client) => { const editing = editingId === client.id; const seconds = store.entries.filter((entry) => entry.clientId === client.id && entry.cycleId === 'active').reduce((sum, entry) => sum + durationToSeconds(entry.hours), 0); return <tr key={client.id} className="hover:bg-[#fbfdff]"><td className="px-5 py-4">{editing ? <input value={client.name} onChange={(event) => updateClient(client.id, { name: event.target.value })} className="w-full rounded-lg border border-[#dbe3ee] px-3 py-2 outline-none focus:border-[#2563eb]" /> : <span className="font-semibold text-[#1e293b]">{client.name}</span>}</td><td className="px-5 py-4">{editing ? <input value={client.company} onChange={(event) => updateClient(client.id, { company: event.target.value })} className="w-full rounded-lg border border-[#dbe3ee] px-3 py-2 outline-none focus:border-[#2563eb]" /> : <span className="text-[#64748b]">{client.company || '—'}</span>}</td><td className="px-5 py-4">{editing ? <input type="number" value={client.rate} onChange={(event) => updateClient(client.id, { rate: Number(event.target.value) || 0 })} className="w-32 rounded-lg border border-[#dbe3ee] px-3 py-2 outline-none focus:border-[#2563eb]" /> : <span className="font-medium">{money(client.rate)} / hr</span>}</td><td className="px-5 py-4 font-medium">{formatDuration(seconds)}</td><td className="px-5 py-4">{money((seconds / 3600) * client.rate)}</td><td className="px-5 py-4">{editing ? <select value={client.status} onChange={(event) => updateClient(client.id, { status: event.target.value as Client['status'] })} className="rounded-lg border border-[#dbe3ee] px-3 py-2 text-sm outline-none"><option>Active</option><option>Archived</option></select> : <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${client.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{client.status}</span>}</td><td className="px-5 py-4 text-right">{editing ? <button type="button" onClick={() => setEditingId(null)} className="rounded-lg bg-[#2563eb] px-3 py-2 text-xs font-semibold text-white">Done</button> : <button type="button" onClick={() => setEditingId(client.id)} aria-label={`Edit ${client.name}`} className="rounded-lg p-2 text-[#64748b] transition hover:bg-[#eff6ff] hover:text-[#2563eb]"><PencilSquareIcon className="h-4 w-4" /></button>}</td></tr>; })}</tbody></table></div></Card></div>;
}

function HoursView({ store, entries, updateStore, updateEntry, addEntry, closeMonth, importCsv, importStatus }: { store: Store; entries: Entry[]; updateStore: <K extends keyof Store>(key: K, value: Store[K]) => void; updateEntry: (id: string, patch: Partial<Entry>) => void; addEntry: () => void; closeMonth: () => void; importCsv: (file: File) => Promise<void>; importStatus: string }) {
  const [range, setRange] = useState('all'); const [clientFilter, setClientFilter] = useState('all'); const [cycleFilter, setCycleFilter] = useState('all'); const [query, setQuery] = useState(''); const [fromDate, setFromDate] = useState(''); const [toDate, setToDate] = useState('');
  const filtered = entries.filter((entry) => { const date = new Date(`${entry.date}T12:00:00`); const now = new Date(); const monthStart = new Date(now.getFullYear(), now.getMonth(), 1); const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1); const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0); const inRange = range === 'all' || (range === '7' && date >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)) || (range === '30' && date >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29)) || (range === 'month' && date >= monthStart && date < new Date(now.getFullYear(), now.getMonth() + 1, 1)) || (range === 'last-month' && date >= previousMonthStart && date <= previousMonthEnd) || (range === 'custom' && (!fromDate || entry.date >= fromDate) && (!toDate || entry.date <= toDate)); return inRange && (cycleFilter === 'all' || entry.cycleId === cycleFilter) && (clientFilter === 'all' || entry.clientId === clientFilter) && (!query || entry.task.toLowerCase().includes(query.toLowerCase())); });
  const updateOffice = (key: 'officeStart' | 'officeEnd', value: string) => updateStore(key, value);
  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-bold text-[#111827]">Hours track</h2><p className="mt-1 text-sm text-[#64748b]">Edit directly in the grid. Every keystroke is saved automatically.</p></div><div className="flex flex-wrap gap-2"><label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#dbe3ee] bg-white px-4 py-2.5 text-sm font-semibold text-[#475569]"><ArrowUpTrayIcon className="h-4 w-4" /> Import CSV<input type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importCsv(file); event.currentTarget.value = ''; }} /></label><button type="button" onClick={closeMonth} className="rounded-lg border border-[#dbe3ee] bg-white px-4 py-2.5 text-sm font-semibold text-[#475569]">Close month</button><button type="button" onClick={addEntry} className="flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white"><PlusIcon className="h-4 w-4" /> Add time entry</button></div></div>{importStatus ? <p className={`text-sm ${importStatus.includes('failed') || importStatus.includes('must') || importStatus.includes('Invalid') ? 'text-red-600' : 'text-emerald-600'}`}>{importStatus}</p> : null}<div className="grid gap-4 sm:grid-cols-3"><Stat label="Client hours" value={formatDuration(entries.reduce((sum, entry) => sum + durationToSeconds(entry.hours), 0))} detail="Active billing cycle" icon={<ClockIcon className="h-5 w-5" />} />  <Stat label="Office span" value={formatDuration([...new Set(entries.map((entry) => entry.date))].reduce((sum, date) => { const row = entries.find((entry) => entry.date === date); return sum + (row ? officeSpanSeconds(row.arrival, row.leaving) : 0); }, 0))} detail={`Default ${store.officeStart} – ${store.officeEnd}`} icon={<CalendarDaysIcon className="h-5 w-5" />} /><Stat label="Tracked value" value={money(entries.reduce((sum, entry) => sum + (durationToSeconds(entry.hours) / 3600) * (store.clients.find((client) => client.id === entry.clientId)?.rate ?? 0), 0))} detail="Across active clients" icon={<CurrencyDollarIcon className="h-5 w-5" />} /></div><Card className="p-4"><div className="flex flex-wrap items-end gap-3"><label className="text-xs font-semibold text-[#64748b]">Date range<select value={range} onChange={(event) => setRange(event.target.value)} className="mt-1 block rounded-lg border border-[#dbe3ee] bg-white px-3 py-2 text-sm font-medium text-[#334155]"><option value="all">All time</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option>  <option value="month">This month</option><option value="last-month">Last month</option><option value="custom">Custom range</option></select>  </label>{range === 'custom' ? <><Field label="From" type="date" value={fromDate} onChange={setFromDate} className="w-36" /><Field label="To" type="date" value={toDate} onChange={setToDate} className="w-36" /></> : null}<label className="text-xs font-semibold text-[#64748b]">Cycle<select value={cycleFilter} onChange={(event) => setCycleFilter(event.target.value)} className="mt-1 block rounded-lg border border-[#dbe3ee] bg-white px-3 py-2 text-sm font-medium text-[#334155]"><option value="all">All cycles</option><option value="active">Active cycle</option>{store.cycles.map((cycle) => <option key={cycle.id} value={cycle.id}>{cycle.label}</option>)}</select></label><label className="text-xs font-semibold text-[#64748b]">Client<select value={clientFilter} onChange={(event) => setClientFilter(event.target.value)} className="mt-1 block rounded-lg border border-[#dbe3ee] bg-white px-3 py-2 text-sm font-medium text-[#334155]"><option value="all">All clients</option>{store.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label><Field value={query} onChange={setQuery} className="max-w-xs" /></div></Card><Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-[#eef2f7] px-5 py-4"><h3 className="font-bold text-[#111827]">Daily log</h3><span className="text-xs text-[#94a3b8]">{filtered.length} entries · inline editing</span></div><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#94a3b8]"><tr>{['Date', 'Arrival', 'Leaving', 'Office hours', 'Client', 'Task description', 'Client hours', ''].map((heading) => <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-[#eef2f7]">{filtered.map((entry) => <tr key={entry.id} className="align-top hover:bg-[#fbfdff]"><td className="px-4 py-3"><input type="date" value={entry.date} onChange={(event) => updateEntry(entry.id, { date: event.target.value })} className="rounded border border-transparent bg-transparent px-1 py-1 text-sm hover:border-[#dbe3ee] focus:border-[#2563eb] focus:outline-none" /></td><td className="px-4 py-3"><input type="time" value={entry.arrival} onChange={(event) => updateEntry(entry.id, { arrival: event.target.value })} className="rounded border border-transparent bg-transparent px-1 py-1 text-sm hover:border-[#dbe3ee] focus:border-[#2563eb] focus:outline-none" /></td><td className="px-4 py-3"><input type="time" value={entry.leaving} onChange={(event) => updateEntry(entry.id, { leaving: event.target.value })} className="rounded border border-transparent bg-transparent px-1 py-1 text-sm hover:border-[#dbe3ee] focus:border-[#2563eb] focus:outline-none" /></td><td className="px-4 py-3">  <span className="inline-flex rounded-md bg-[#f1f5f9] px-2 py-1 text-xs font-semibold text-[#475569]">{formatDuration(officeSpanSeconds(entry.arrival, entry.leaving))}</span></td><td className="px-4 py-3"><select value={entry.clientId} onChange={(event) => updateEntry(entry.id, { clientId: event.target.value })} className="max-w-[150px] rounded border border-transparent bg-transparent px-1 py-1 text-sm hover:border-[#dbe3ee] focus:border-[#2563eb] focus:outline-none">{store.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></td><td className="px-4 py-3"><textarea value={entry.task} onChange={(event) => updateEntry(entry.id, { task: event.target.value })} rows={2} placeholder="What did you work on?" className="w-full min-w-[220px] resize-y rounded border border-transparent bg-transparent px-1 py-1 text-sm leading-5 hover:border-[#dbe3ee] focus:border-[#2563eb] focus:outline-none" /></td><td className="px-4 py-3">  <input type="text" inputMode="numeric" placeholder="HH:MM:SS" value={entry.hours} onChange={(event) => updateEntry(entry.id, { hours: event.target.value })} className="w-20 rounded border border-transparent bg-transparent px-2 py-1 text-sm font-semibold hover:border-[#dbe3ee] focus:border-[#2563eb] focus:outline-none" /></td><td className="px-4 py-3"><button type="button" aria-label="Delete time entry" onClick={() => updateStore('entries', store.entries.filter((item) => item.id !== entry.id))} className="rounded p-1 text-[#94a3b8] hover:bg-red-50 hover:text-red-500"><XMarkIcon className="h-4 w-4" /></button></td></tr>)}</tbody></table></div></Card><Card className="flex flex-wrap items-center gap-5 p-5"><div><p className="text-sm font-bold text-[#111827]">Office timing defaults</p><p className="mt-1 text-xs text-[#64748b]">Set the default span for new entries. Individual rows remain editable.</p></div><Field label="Start" type="time" value={store.officeStart} onChange={(value) => updateOffice('officeStart', value)} className="w-32" /><Field label="End" type="time" value={store.officeEnd} onChange={(value) => updateOffice('officeEnd', value)} className="w-32" /></Card></div>;
}

function getTier(hours: number) { if (hours >= 200) return { rate: .2, label: '20%', next: null, from: 200 }; if (hours >= 150) return { rate: .15, label: '15%', next: 200, from: 150 }; if (hours >= 100) return { rate: .1, label: '10%', next: 150, from: 100 }; if (hours >= 75) return { rate: .05, label: '5%', next: 100, from: 75 }; return { rate: 0, label: '0%', next: 75, from: 0 }; }
function PayView({ store, hours, totalOfficeSeconds, updateStore }: { store: Store; hours: number; totalOfficeSeconds: number; updateStore: <K extends keyof Store>(key: K, value: Store[K]) => void }) {
  const [editing, setEditing] = useState(false);
  const [basePay, setBasePay] = useState(String(store.basePay));
  const [exchangeRate, setExchangeRate] = useState(String(store.exchangeRate));
  const tier = getTier(hours); const hourlyValue = hours * 9 * store.exchangeRate; const commission = hourlyValue * tier.rate; const payout = store.basePay + commission; const progress = tier.next ? Math.min(100, Math.max(0, ((hours - tier.from) / (tier.next - tier.from)) * 100)) : 100;
  const finishEditing = () => {
    updateStore('basePay', Number(basePay) || 0);
    updateStore('exchangeRate', Number(exchangeRate) || 0);
    setEditing(false);
  };
  return <div className="space-y-6"><div><h2 className="text-2xl font-bold text-[#111827]">Pay structure</h2><p className="mt-1 text-sm text-[#64748b]">Your payout updates from the active Hours Track cycle.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Final payout" value={money(payout)} detail={`$${(payout / store.exchangeRate).toFixed(0)} USD`} icon={<BanknotesIcon className="h-5 w-5" />} /><Stat label="Client hours" value={`${hours.toFixed(1)}h`} detail={`${formatDuration(totalOfficeSeconds)} in office`} icon={<ClockIcon className="h-5 w-5" />} /><Stat label="Hourly value" value={money(hourlyValue)} detail="$9 × exchange rate" icon={<CurrencyDollarIcon className="h-5 w-5" />} /><Stat label="Active tier" value={tier.label} detail="Commission rate" icon={<ArrowTrendingUpIcon className="h-5 w-5" />} /></div><div className="grid gap-6 lg:grid-cols-5"><Card className="p-6 lg:col-span-2"><div className="flex items-center justify-between"><h3 className="font-bold text-[#111827]">Configuration</h3>{editing ? <button type="button" onClick={finishEditing} className="rounded-lg bg-[#2563eb] px-3 py-1.5 text-xs font-semibold text-white">Done</button> : <button type="button" onClick={() => { setBasePay(String(store.basePay)); setExchangeRate(String(store.exchangeRate)); setEditing(true); }} className="rounded-lg border border-[#dbe3ee] px-3 py-1.5 text-xs font-semibold text-[#2563eb]">Edit</button>}</div><div className="mt-5 grid gap-4">{editing ? <><Field label="Base pay (PKR)" type="number" value={basePay} onChange={setBasePay} /><Field label="USD → PKR conversion" type="number" value={exchangeRate} onChange={setExchangeRate} /></> : <><Metric label="Base pay (PKR)" value={money(store.basePay)} /><Metric label="USD → PKR conversion" value={String(store.exchangeRate)} /></>}</div><div className="mt-6 rounded-xl bg-[#f8fafc] p-4 text-xs leading-6 text-[#64748b]"><strong className="text-[#334155]">Commission slabs</strong><br />&lt;75h 0% · 75–99h 5% · 100–149h 10%<br />150–199h 15% · 200h+ 20%</div></Card><Card className="p-6 lg:col-span-3"><div className="flex items-center justify-between"><div><h3 className="font-bold text-[#111827]">Tier progress</h3><p className="mt-1 text-sm text-[#64748b]">{tier.next ? `${(tier.next - hours).toFixed(1)}h to the ${getTier(tier.next).label} tier` : 'Highest tier reached'}</p></div><span className="text-2xl font-bold text-[#2563eb]">{Math.round(progress)}%</span></div><div className="mt-6 h-3 overflow-hidden rounded-full bg-[#e8eef7]"><div className="h-full rounded-full bg-[#2563eb] transition-all" style={{ width: `${progress}%` }} /></div><div className="mt-8 grid gap-4 sm:grid-cols-3"><Metric label="Effective hourly rate" value={hours ? money(payout / hours) : '—'} /><Metric label="Commission / hour" value={hours ? money(commission / hours) : '—'} /><Metric label="Weekly average pace" value={`${(hours / 4.33).toFixed(1)}h`} /></div><div className="mt-6 rounded-xl border border-[#dbeafe] bg-[#eff6ff] p-4 text-sm text-[#1d4ed8]">{tier.next ? `Working ${(tier.next - hours).toFixed(1)} more hours will push you into the ${getTier(tier.next).label} tier.` : 'You are maximizing the available commission tier.'}</div></Card></div></div>;
}
function Metric({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-[#64748b]">{label}</p><p className="mt-1 font-bold text-[#111827]">{value}</p></div>; }

function IncomeView({ store, updateStore }: { store: Store; updateStore: <K extends keyof Store>(key: K, value: Store[K]) => void }) {
  const active = store.entries.filter((entry) => entry.cycleId === 'active'); const groups = [...store.cycles].map((cycle) => ({ id: cycle.id, label: cycle.label, entries: store.entries.filter((entry) => entry.cycleId === cycle.id), closed: true, notes: cycle.notes })); if (active.length) groups.unshift({ id: 'active', label: monthLabel(active[0].date), entries: active, closed: false, notes: '' });
  return <div className="space-y-6"><div><h2 className="text-2xl font-bold text-[#111827]">Monthly income</h2><p className="mt-1 text-sm text-[#64748b]">A historical ledger of every billing cycle and payout.</p></div><Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#94a3b8]"><tr>{['Billing cycle', 'Office hours', 'Client hours', 'Hourly value', 'Tier', 'Base pay', 'Final payout', 'Status', 'Notes'].map((heading) => <th key={heading} className="px-5 py-4 font-semibold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-[#eef2f7]">{groups.length ? groups.map((group) => { const officeDates = [...new Set(group.entries.map((entry) => entry.date))]; const office = officeDates.reduce((sum, date) => { const row = group.entries.find((entry) => entry.date === date); return sum + (row ? officeSpanSeconds(row.arrival, row.leaving) : 0); }, 0); const clientHours = group.entries.reduce((sum, entry) => sum + durationToSeconds(entry.hours), 0) / 3600; const value = group.entries.reduce((sum, entry) => sum + (durationToSeconds(entry.hours) / 3600) * (store.clients.find((client) => client.id === entry.clientId)?.rate ?? 0), 0); const tier = getTier(clientHours); const payout = store.basePay + value * tier.rate; return <tr key={group.id}><td className="px-5 py-4 font-semibold text-[#1e293b]">{group.label}</td><td className="px-5 py-4">{formatDuration(office)}</td><td className="px-5 py-4">{formatDuration(clientHours * 3600)}</td><td className="px-5 py-4">{money(value)}</td><td className="px-5 py-4"><span className="rounded-full bg-[#eff6ff] px-2 py-1 text-xs font-bold text-[#2563eb]">{tier.label}</span></td><td className="px-5 py-4">{money(store.basePay)}</td><td className="px-5 py-4 font-bold">{money(payout)}</td><td className="px-5 py-4"><span className={`inline-flex items-center gap-1 text-xs font-semibold ${group.closed ? 'text-slate-500' : 'text-emerald-600'}`}>{group.closed ? <CheckCircleIcon className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-emerald-500" />}{group.closed ? 'Closed' : 'Active'}</span></td><td className="px-5 py-4"><input value={group.notes} placeholder="Add note..." onChange={(event) => group.closed && updateStore('cycles', store.cycles.map((cycle) => cycle.id === group.id ? { ...cycle, notes: event.target.value } : cycle))} className="w-32 rounded border border-transparent bg-transparent px-2 py-1 text-xs hover:border-[#dbe3ee] focus:border-[#2563eb] focus:outline-none" /></td></tr>; }) : <tr><td colSpan={9} className="px-5 py-12 text-center text-[#94a3b8]">No cycles yet. Close a month from Hours Track to create a ledger record.</td></tr>}</tbody></table></div></Card></div>;
}
