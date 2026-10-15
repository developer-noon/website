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
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
import { durationToSeconds, formatDuration, sanitizeOfficeHoursStore, type OfficeHoursProject, type OfficeHoursReport, type OfficeHoursTeamMember } from '@/lib/office-hours';

type Tab = 'clients' | 'projects' | 'team' | 'hours' | 'pay' | 'income' | 'reports' | 'analytics';
type Client = { id: string; name: string; company: string; rate: number; status: 'Active' | 'Archived' };
type Project = OfficeHoursProject;
type Entry = {
  id: string;
  date: string;
  arrival: string;
  leaving: string;
  clientId: string;
  projectId: string;
  memberId: string;
  task: string;
  hours: string;
  cycleId: string;
  billed: boolean;
  startedAt?: string;
  stoppedAt?: string;
};
type ActiveTimer = { entryId: string; startedAt: string };
type Cycle = { id: string; label: string; closedAt: string; notes: string };
type TeamMember = OfficeHoursTeamMember;
type Store = { clients: Client[]; projects: Project[]; team: TeamMember[]; entries: Entry[]; cycles: Cycle[]; reports: OfficeHoursReport[]; basePay: number; exchangeRate: number; officeStart: string; officeEnd: string; activeTimer?: ActiveTimer };

const today = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 10);
const initialStore: Store = {
  clients: [],
  projects: [],
  team: [],
  entries: [],
  cycles: [],
  reports: [],
  basePay: 50000,
  exchangeRate: 275,
  officeStart: '14:00',
  officeEnd: '00:00',
  activeTimer: undefined,
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
const weekStart = (date: string) => {
  const value = new Date(`${date}T12:00:00`);
  const day = value.getDay();
  value.setDate(value.getDate() - (day === 0 ? 6 : day - 1));
  return value.toISOString().slice(0, 10);
};
const weekLabel = (date: string) => `Week of ${new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
const elapsedDuration = (startedAt: string, stoppedAt = new Date().toISOString()) => formatDuration(Math.max(0, Math.floor((new Date(stoppedAt).getTime() - new Date(startedAt).getTime()) / 1000)));
const entryDurationSeconds = (entry: Entry, activeTimer?: ActiveTimer, now = Date.now()) => activeTimer?.entryId === entry.id
  ? Math.max(0, Math.floor((now - new Date(activeTimer.startedAt).getTime()) / 1000))
  : durationToSeconds(entry.hours);

export default function OfficeHoursTrack() {
  const searchParams = useSearchParams();
  const queryTab = searchParams.get('tab') as Tab | null;
  const [importStatus, setImportStatus] = useState('');
  const [dbLoaded, setDbLoaded] = useState(false);
  const [store, setStore] = useState<Store>(initialStore);
  const selectedTab: Tab = queryTab && ['clients', 'projects', 'team', 'hours', 'pay', 'income', 'reports', 'analytics'].includes(queryTab) ? queryTab : 'hours';
  useEffect(() => {
    window.localStorage.setItem('office-hours-track', JSON.stringify(store));
    if (dbLoaded) {
      const timeout = window.setTimeout(() => {
        void fetch('/api/office-hours', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ store }) })
          .then((response) => {
            if (!response.ok) throw new Error('Autosave failed.');
          })
          .catch(() => setImportStatus('Autosave failed. Your local changes are still available.'));
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
        else if (mounted) setStore(initialStore);
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
  const addEntry = () => setStore((current) => {
    const clientId = current.clients[0]?.id ?? '';
    const projectId = current.projects.find((project) => project.clientId === clientId)?.id ?? '';
    const memberId = current.team.find((member) => member.status === 'Active')?.id ?? current.team[0]?.id ?? '';
    return { ...current, entries: [{ id: uid(), date: today(), arrival: current.officeStart, leaving: current.officeEnd, clientId, projectId, memberId, task: '', hours: '00:00:00', cycleId: 'active', billed: false }, ...current.entries] };
  });
  const addClient = () => setStore((current) => {
    const clientId = uid();
    return { ...current, clients: [...current.clients, { id: clientId, name: 'New client', company: '', rate: 2475, status: 'Active' }], projects: [...current.projects, { id: uid(), clientId, name: 'General', status: 'Active' }] };
  });
  const closeMonth = () => {
    const date = window.prompt('Close this cycle through date (YYYY-MM-DD):', today());
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    const cycleEntries = store.entries.filter((entry) => entry.cycleId === 'active' && entry.date <= date);
    if (!cycleEntries.length) return;
    const cycle: Cycle = { id: `cycle-${uid()}`, label: monthLabel(date), closedAt: date, notes: '' };
    setStore((current) => {
      const entries = current.entries.map((entry) => entry.cycleId === 'active' && entry.date <= date ? { ...entry, cycleId: cycle.id } : entry);
      const reports = createMonthlyReports(current, date);
      return { ...current, cycles: [...current.cycles, cycle], reports: [...current.reports, ...reports], entries };
    });
  };
  const importCsv = async (file: File) => {
    setImportStatus('Importing CSV…');
    try {
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
    } catch {
      setImportStatus('CSV import failed. Check your connection and try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f6f8fb] text-[#16202f]">
      <div className="border-b border-[#e7ebf1] bg-white px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">Operations workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-[#111827]">OfficeHours<span className="text-[#2563eb]">Track</span></h1><p className="mt-1 text-sm text-[#64748b]">Your client work, office time, and payout in one place.</p></div>
            <div className="flex items-center gap-2 rounded-none border border-[#dbe3ee] bg-[#f8fafc] px-3 py-2 text-xs font-medium text-[#475569]"><span className="h-2 w-2 rounded-none bg-emerald-500" /> Autosaved locally</div>
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8">
        {selectedTab === 'clients' && <ClientsView store={store} updateStore={updateStore} addClient={addClient} />}
        {selectedTab === 'projects' && <ProjectsView store={store} updateStore={updateStore} />}
        {selectedTab === 'team' && <TeamView store={store} updateStore={updateStore} />}
        {selectedTab === 'hours' && <HoursView store={store} entries={store.entries} updateStore={updateStore} updateEntry={updateEntry} addEntry={addEntry} closeMonth={closeMonth} importCsv={importCsv} importStatus={importStatus} />}
        {selectedTab === 'pay' && <PayView store={store} hours={totalClientHours} totalOfficeSeconds={totalOfficeSeconds} updateStore={updateStore} />}
        {selectedTab === 'income' && <IncomeView store={store} updateStore={updateStore} />}
        {selectedTab === 'reports' && <ReportsView store={store} updateStore={updateStore} />}
        {selectedTab === 'analytics' && <AnalyticsView store={store} />}
      </main>
    </div>
  );
}

function availableSeconds(store: Store, entry: Entry) {
  const used = store.reports.flatMap((report) => report.lines).filter((line) => line.entryId === entry.id).reduce((sum, line) => sum + line.seconds, 0);
  return Math.max(0, durationToSeconds(entry.hours) - used);
}

function createReport(store: Store, clientId: string, requestedHours: number, periodEnd: string, kind: OfficeHoursReport['kind'], label: string, projectId?: string): OfficeHoursReport | null {
  const remaining = Math.round(requestedHours * 3600);
  if (!Number.isFinite(remaining) || remaining <= 0) return null;
  let left = remaining;
  const lines: { entryId: string; seconds: number }[] = [];
  for (const entry of [...store.entries].filter((item) => item.clientId === clientId && (!projectId || item.projectId === projectId) && item.date <= periodEnd).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))) {
    const available = availableSeconds(store, entry);
    if (!available) continue;
    const seconds = Math.min(left, available);
    lines.push({ entryId: entry.id, seconds });
    left -= seconds;
    if (!left) break;
  }
  if (left) return null;
  const client = store.clients.find((item) => item.id === clientId);
  return {
    id: `report-${uid()}`,
    number: `R-${new Date().getFullYear()}-${uid().toUpperCase()}`,
    clientId,
    label,
    hours: remaining / 3600,
    amount: (remaining / 3600) * (client?.rate ?? 0),
    createdAt: new Date().toISOString(),
    periodEnd,
    kind,
    lines,
  };
}

function createMonthlyReports(store: Store, periodEnd: string) {
  const reports: OfficeHoursReport[] = [];
  for (const client of store.clients) {
    const seconds = store.entries.filter((entry) => entry.clientId === client.id && entry.date <= periodEnd).reduce((sum, entry) => sum + availableSeconds(store, entry), 0);
    const report = createReport({ ...store, reports: [...store.reports, ...reports] }, client.id, seconds / 3600, periodEnd, 'monthly', `Monthly report · ${monthLabel(periodEnd)}`);
    if (report) reports.push(report);
  }
  return reports;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) { return <section className={`rounded-none border border-[#e6ebf2] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] ${className}`}>{children}</section>; }
function Stat({ label, value, detail, icon }: { label: string; value: string; detail?: string; icon: React.ReactNode }) { return <Card className="p-5"><div className="flex items-center justify-between"><span className="text-sm font-medium text-[#64748b]">{label}</span><span className="rounded-none bg-[#eff4ff] p-2 text-[#2563eb]">{icon}</span></div><p className="mt-4 text-2xl font-bold text-[#111827]">{value}</p>{detail && <p className="mt-1 text-xs text-[#94a3b8]">{detail}</p>}</Card>; }
function Field({ label, value, onChange, type = 'text', className = '' }: { label?: string; value: string | number; onChange: (value: string) => void; type?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      {label ? <span className="mb-1.5 block text-xs font-semibold text-[#64748b]">{label}</span> : null}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-none border border-[#dbe3ee] bg-white px-3 py-2 text-sm text-[#1e293b] outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10" />
    </label>
  );
}

function ClientsView({ store, updateStore, addClient }: { store: Store; updateStore: <K extends keyof Store>(key: K, value: Store[K]) => void; addClient: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const updateClient = (id: string, patch: Partial<Client>) => updateStore('clients', store.clients.map((client) => client.id === id ? { ...client, ...patch } : client));
  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-bold text-[#111827]">Clients</h2><p className="mt-1 text-sm text-[#64748b]">Manage client details and rates connected to your time entries.</p></div><button type="button" onClick={addClient} className="flex items-center gap-2 rounded-none bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20"><PlusIcon className="h-4 w-4" /> Add client</button></div><Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#94a3b8]"><tr>{['Client', 'Company / Brand', 'Hourly value', 'Status', ''].map((heading) => <th key={heading} className="px-5 py-4 font-semibold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-[#eef2f7]">{store.clients.map((client) => { const editing = editingId === client.id; return <tr key={client.id} className="hover:bg-[#fbfdff]"><td className="px-5 py-4">{editing ? <input value={client.name} onChange={(event) => updateClient(client.id, { name: event.target.value })} className="w-full rounded-none border border-[#dbe3ee] px-3 py-2 outline-none focus:border-[#2563eb]" /> : <span className="font-semibold text-[#1e293b]">{client.name}</span>}</td><td className="px-5 py-4">{editing ? <input value={client.company} onChange={(event) => updateClient(client.id, { company: event.target.value })} className="w-full rounded-none border border-[#dbe3ee] px-3 py-2 outline-none focus:border-[#2563eb]" /> : <span className="text-[#64748b]">{client.company || '—'}</span>}</td><td className="px-5 py-4">{editing ? <input type="number" value={client.rate} onChange={(event) => updateClient(client.id, { rate: Number(event.target.value) || 0 })} className="w-32 rounded-none border border-[#dbe3ee] px-3 py-2 outline-none focus:border-[#2563eb]" /> : <span className="font-medium">{money(client.rate)} / hr</span>}</td><td className="px-5 py-4">{editing ? <select value={client.status} onChange={(event) => updateClient(client.id, { status: event.target.value as Client['status'] })} className="rounded-none border border-[#dbe3ee] px-3 py-2 text-sm outline-none"><option>Active</option><option>Archived</option></select> : <span className={`rounded-none px-2.5 py-1 text-xs font-semibold ${client.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{client.status}</span>}</td><td className="px-5 py-4 text-right">{editing ? <button type="button" onClick={() => setEditingId(null)} className="rounded-none bg-[#2563eb] px-3 py-2 text-xs font-semibold text-white">Done</button> : <button type="button" onClick={() => setEditingId(client.id)} aria-label={`Edit ${client.name}`} className="rounded-none p-2 text-[#64748b] transition hover:bg-[#eff6ff] hover:text-[#2563eb]"><PencilSquareIcon className="h-4 w-4" /></button>}</td></tr>; })}</tbody></table></div></Card></div>;
}

function ProjectsView({ store, updateStore }: { store: Store; updateStore: <K extends keyof Store>(key: K, value: Store[K]) => void }) {
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState(store.clients[0]?.id ?? '');
  const [editingId, setEditingId] = useState('');
  const addProject = () => {
    const trimmed = name.trim();
    if (!trimmed || !clientId) return;
    updateStore('projects', editingId
      ? store.projects.map((project) => project.id === editingId ? { ...project, name: trimmed, clientId } : project)
      : [...store.projects, { id: uid(), clientId, name: trimmed, status: 'Active' }]);
    setName('');
    setEditingId('');
  };
  const removeProject = (projectId: string) => {
    if (store.entries.some((entry) => entry.projectId === projectId)) return;
    updateStore('projects', store.projects.filter((project) => project.id !== projectId));
  };
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-[#111827]">Projects</h2><p className="mt-1 text-sm text-[#64748b]">Every time entry belongs to one of these client projects.</p></div>
      <Card className="p-5"><div className="flex flex-wrap items-end gap-3"><label className="text-xs font-semibold text-[#64748b]">Client<select value={clientId} onChange={(event) => setClientId(event.target.value)} className="mt-1 block min-w-52 rounded-none border border-[#dbe3ee] bg-white px-3 py-2 text-sm">{store.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label><Field label="Project name" value={name} onChange={setName} className="min-w-56" /><button type="button" onClick={addProject} disabled={!name.trim() || !clientId} className="rounded-none bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{editingId ? 'Save project' : 'Add project'}</button>{editingId ? <button type="button" onClick={() => { setEditingId(''); setName(''); }} className="rounded-none border border-[#dbe3ee] px-4 py-2.5 text-sm font-semibold">Cancel</button> : null}</div></Card>
      <Card className="overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#94a3b8]"><tr><th className="px-5 py-4">Project</th><th className="px-5 py-4">Client</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Actions</th></tr></thead><tbody className="divide-y divide-[#eef2f7]">{store.projects.map((project) => <tr key={project.id}><td className="px-5 py-4 font-semibold">{project.name}</td><td className="px-5 py-4">{store.clients.find((client) => client.id === project.clientId)?.name ?? 'Unknown client'}</td><td className="px-5 py-4"><button type="button" onClick={() => updateStore('projects', store.projects.map((item) => item.id === project.id ? { ...item, status: item.status === 'Active' ? 'Archived' : 'Active' } : item))} className="font-semibold">{project.status}</button></td><td className="px-5 py-4"><button type="button" onClick={() => { setEditingId(project.id); setName(project.name); setClientId(project.clientId); }} className="mr-3 font-semibold text-[#2563eb]">Edit</button><button type="button" onClick={() => removeProject(project.id)} disabled={store.entries.some((entry) => entry.projectId === project.id)} className="font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-40">Delete</button></td></tr>)}</tbody></table></Card>
    </div>
  );
}

function TeamView({ store, updateStore }: { store: Store; updateStore: <K extends keyof Store>(key: K, value: Store[K]) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [editingId, setEditingId] = useState('');
  const saveMember = () => {
    if (!name.trim()) return;
    const member = { name: name.trim(), email: email.trim() };
    updateStore('team', editingId ? store.team.map((item) => item.id === editingId ? { ...item, ...member } : item) : [...store.team, { id: uid(), ...member, status: 'Active' as const }]);
    setName('');
    setEmail('');
    setEditingId('');
  };
  const removeMember = (memberId: string) => {
    if (store.entries.some((entry) => entry.memberId === memberId)) return;
    updateStore('team', store.team.filter((member) => member.id !== memberId));
  };
  return <div className="space-y-6"><div><h2 className="text-2xl font-bold text-[#111827]">Team</h2><p className="mt-1 text-sm text-[#64748b]">Every time entry records the person who added or tracked it.</p></div><Card className="p-5"><div className="flex flex-wrap items-end gap-3"><Field label="Name" value={name} onChange={setName} className="min-w-48" /><Field label="Email (optional)" value={email} onChange={setEmail} type="email" className="min-w-56" /><button type="button" onClick={saveMember} disabled={!name.trim()} className="rounded-none bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{editingId ? 'Save member' : 'Add member'}</button>{editingId ? <button type="button" onClick={() => { setEditingId(''); setName(''); setEmail(''); }} className="rounded-none border border-[#dbe3ee] px-4 py-2.5 text-sm font-semibold">Cancel</button> : null}</div></Card><Card className="overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#94a3b8]"><tr><th className="px-5 py-4">Person</th><th className="px-5 py-4">Email</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Actions</th></tr></thead><tbody className="divide-y divide-[#eef2f7]">{store.team.map((member) => <tr key={member.id}><td className="px-5 py-4 font-semibold">{member.name}</td><td className="px-5 py-4">{member.email || '—'}</td><td className="px-5 py-4"><button type="button" onClick={() => updateStore('team', store.team.map((item) => item.id === member.id ? { ...item, status: item.status === 'Active' ? 'Archived' : 'Active' } : item))} className="font-semibold">{member.status}</button></td><td className="px-5 py-4"><button type="button" onClick={() => { setEditingId(member.id); setName(member.name); setEmail(member.email); }} className="mr-3 font-semibold text-[#2563eb]">Edit</button><button type="button" onClick={() => removeMember(member.id)} disabled={store.entries.some((entry) => entry.memberId === member.id)} className="font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-40">Delete</button></td></tr>)}</tbody></table></Card></div>;
}

function LiveTimer({ store, updateStore, updateEntry }: { store: Store; updateStore: <K extends keyof Store>(key: K, value: Store[K]) => void; updateEntry: (id: string, patch: Partial<Entry>) => void }) {
  const [clientId, setClientId] = useState(store.clients[0]?.id ?? '');
  const [projectId, setProjectId] = useState(store.projects.find((project) => project.clientId === store.clients[0]?.id)?.id ?? '');
  const [memberId, setMemberId] = useState(store.team.find((member) => member.status === 'Active')?.id ?? store.team[0]?.id ?? '');
  const [task, setTask] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const activeTimer = store.activeTimer;
  const activeEntry = activeTimer ? store.entries.find((entry) => entry.id === activeTimer.entryId) : undefined;

  useEffect(() => {
    if (!activeTimer) return undefined;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [activeTimer]);

  const start = () => {
    if (!clientId || !projectId || !task.trim() || activeTimer) return;
    const startedAt = new Date().toISOString();
    const entry: Entry = {
      id: uid(),
      date: today(),
      arrival: store.officeStart,
      leaving: store.officeEnd,
      clientId,
      projectId,
      memberId,
      task: task.trim(),
      hours: '00:00:00',
      cycleId: 'active',
      billed: false,
      startedAt,
    };
    updateStore('entries', [entry, ...store.entries]);
    updateStore('activeTimer', { entryId: entry.id, startedAt });
    setTask('');
  };

  const stop = () => {
    if (!activeTimer) return;
    const stoppedAt = new Date().toISOString();
    updateEntry(activeTimer.entryId, { hours: elapsedDuration(activeTimer.startedAt, stoppedAt), stoppedAt });
    updateStore('activeTimer', undefined);
  };

  return <Card className="border-[#b9dcae] bg-[#f8fff6] p-5">
    <div className="flex flex-wrap items-end gap-3">
      <div className="mr-auto"><h3 className="font-bold text-[#111827]">Live timer</h3><p className="mt-1 text-sm text-[#64748b]">{activeEntry ? `Tracking: ${activeEntry.task}` : 'Start a real-time task timer.'}</p></div>
      {activeTimer ? <><span className="rounded-none bg-[#0B353B] px-3 py-2 font-mono text-sm font-bold text-white">{elapsedDuration(activeTimer.startedAt, new Date(now).toISOString())}</span><button type="button" onClick={stop} className="rounded-none bg-red-600 px-4 py-2.5 text-sm font-semibold text-white">Stop timer</button></> : <><label className="text-xs font-semibold text-[#64748b]">Person<select value={memberId} onChange={(event) => setMemberId(event.target.value)} className="mt-1 block rounded-none border border-[#dbe3ee] bg-white px-3 py-2 text-sm font-medium text-[#334155]">{store.team.filter((member) => member.status === 'Active').map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label><label className="text-xs font-semibold text-[#64748b]">Client<select value={clientId} onChange={(event) => { const nextClientId = event.target.value; setClientId(nextClientId); setProjectId(store.projects.find((project) => project.clientId === nextClientId)?.id ?? ''); }} className="mt-1 block rounded-none border border-[#dbe3ee] bg-white px-3 py-2 text-sm font-medium text-[#334155]">{store.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label><label className="text-xs font-semibold text-[#64748b]">Project<select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="mt-1 block rounded-none border border-[#dbe3ee] bg-white px-3 py-2 text-sm font-medium text-[#334155]">{store.projects.filter((project) => project.clientId === clientId && project.status === 'Active').map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><label className="min-w-56 flex-1 text-xs font-semibold text-[#64748b]">Task description<input value={task} onChange={(event) => setTask(event.target.value)} placeholder="What are you working on?" className="mt-1 w-full rounded-none border border-[#dbe3ee] bg-white px-3 py-2 text-sm text-[#334155] outline-none focus:border-[#2563eb]" /></label><button type="button" onClick={start} disabled={!clientId || !projectId || !memberId || !task.trim()} className="rounded-none bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#2563eb] disabled:text-white">Start timer</button></>}
    </div>
  </Card>;
}

function HoursView({ store, entries, updateStore, updateEntry, addEntry, closeMonth, importCsv, importStatus }: { store: Store; entries: Entry[]; updateStore: <K extends keyof Store>(key: K, value: Store[K]) => void; updateEntry: (id: string, patch: Partial<Entry>) => void; addEntry: () => void; closeMonth: () => void; importCsv: (file: File) => Promise<void>; importStatus: string }) {
  const [range, setRange] = useState('all'); const [now, setNow] = useState(() => Date.now()); const activeTimer = store.activeTimer; useEffect(() => { if (!activeTimer) return undefined; const interval = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(interval); }, [activeTimer]); const [clientFilter, setClientFilter] = useState('all'); const [cycleFilter, setCycleFilter] = useState('all'); const [query, setQuery] = useState(''); const [fromDate, setFromDate] = useState(''); const [toDate, setToDate] = useState('');
  const filtered = entries.filter((entry) => { const date = new Date(`${entry.date}T12:00:00`); const now = new Date(); const monthStart = new Date(now.getFullYear(), now.getMonth(), 1); const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1); const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0); const inRange = range === 'all' || (range === '7' && date >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)) || (range === '30' && date >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29)) || (range === 'month' && date >= monthStart && date < new Date(now.getFullYear(), now.getMonth() + 1, 1)) || (range === 'last-month' && date >= previousMonthStart && date <= previousMonthEnd) || (range === 'custom' && (!fromDate || entry.date >= fromDate) && (!toDate || entry.date <= toDate)); return inRange && (cycleFilter === 'all' || entry.cycleId === cycleFilter) && (clientFilter === 'all' || entry.clientId === clientFilter) && (!query || entry.task.toLowerCase().includes(query.toLowerCase())); });
  const displayed = [...filtered].sort((a, b) => b.date.localeCompare(a.date)); const updateOffice = (key: 'officeStart' | 'officeEnd', value: string) => updateStore(key, value);
  return <div className="space-y-6"><LiveTimer store={store} updateStore={updateStore} updateEntry={updateEntry} /><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-bold text-[#111827]">Hours track</h2><p className="mt-1 text-sm text-[#64748b]">Edit directly in the grid. Every keystroke is saved automatically.</p></div><div className="flex flex-wrap gap-2"><label className="flex cursor-pointer items-center gap-2 rounded-none border border-[#dbe3ee] bg-white px-4 py-2.5 text-sm font-semibold text-[#475569]"><ArrowUpTrayIcon className="h-4 w-4" /> Import CSV<input type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importCsv(file); event.currentTarget.value = ''; }} /></label><button type="button" onClick={closeMonth} className="rounded-none border border-[#dbe3ee] bg-white px-4 py-2.5 text-sm font-semibold text-[#475569]">Close month</button><button type="button" onClick={addEntry} className="flex items-center gap-2 rounded-none bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white"><PlusIcon className="h-4 w-4" /> Add time entry</button></div></div>{importStatus ? <p className={`text-sm ${importStatus.includes('failed') || importStatus.includes('must') || importStatus.includes('Invalid') ? 'text-red-600' : 'text-emerald-600'}`}>{importStatus}</p> : null}<div className="grid gap-4 sm:grid-cols-3"><Stat label="Client hours" value={formatDuration(entries.reduce((sum, entry) => sum + entryDurationSeconds(entry, activeTimer, now), 0))} detail="Active billing cycle" icon={<ClockIcon className="h-5 w-5" />} />  <Stat label="Office span" value={formatDuration([...new Set(entries.map((entry) => entry.date))].reduce((sum, date) => { const row = entries.find((entry) => entry.date === date); return sum + (row ? officeSpanSeconds(row.arrival, row.leaving) : 0); }, 0))} detail={`Default ${store.officeStart} – ${store.officeEnd}`} icon={<CalendarDaysIcon className="h-5 w-5" />} /><Stat label="Tracked value" value={money(entries.reduce((sum, entry) => sum + (entryDurationSeconds(entry, activeTimer, now) / 3600) * (store.clients.find((client) => client.id === entry.clientId)?.rate ?? 0), 0))} detail="Across active clients" icon={<CurrencyDollarIcon className="h-5 w-5" />} /></div><Card className="p-4"><div className="flex flex-wrap items-end gap-3"><label className="text-xs font-semibold text-[#64748b]">Date range<select value={range} onChange={(event) => setRange(event.target.value)} className="mt-1 block rounded-none border border-[#dbe3ee] bg-white px-3 py-2 text-sm font-medium text-[#334155]"><option value="all">All time</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option>  <option value="month">This month</option><option value="last-month">Last month</option><option value="custom">Custom range</option></select>  </label>{range === 'custom' ? <><Field label="From" type="date" value={fromDate} onChange={setFromDate} className="w-36" /><Field label="To" type="date" value={toDate} onChange={setToDate} className="w-36" /></> : null}<label className="text-xs font-semibold text-[#64748b]">Cycle<select value={cycleFilter} onChange={(event) => setCycleFilter(event.target.value)} className="mt-1 block rounded-none border border-[#dbe3ee] bg-white px-3 py-2 text-sm font-medium text-[#334155]"><option value="all">All cycles</option><option value="active">Active cycle</option>{store.cycles.map((cycle) => <option key={cycle.id} value={cycle.id}>{cycle.label}</option>)}</select></label><label className="text-xs font-semibold text-[#64748b]">Client<select value={clientFilter} onChange={(event) => setClientFilter(event.target.value)} className="mt-1 block rounded-none border border-[#dbe3ee] bg-white px-3 py-2 text-sm font-medium text-[#334155]"><option value="all">All clients</option>{store.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label><Field value={query} onChange={setQuery} className="max-w-xs" /></div></Card><Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-[#eef2f7] px-5 py-4"><h3 className="font-bold text-[#111827]">Daily log</h3><span className="text-xs text-[#94a3b8]">{filtered.length} entries · inline editing</span></div><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#94a3b8]"><tr>{['Date', 'Arrival', 'Leaving', 'Office hours', 'Person', 'Client', 'Task description', 'Client hours', ''].map((heading) => <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-[#eef2f7]">{displayed.map((entry, index) => <Fragment key={entry.id}>{(index === 0 || weekStart(displayed[index - 1].date) !== weekStart(entry.date)) && <tr><td colSpan={8} className="border-t-2 border-[#dbe3ee] bg-[#f8fafc] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#64748b]">{weekLabel(weekStart(entry.date))}</td></tr>}<tr className="align-top hover:bg-[#fbfdff]"><td className="px-4 py-3"><input type="date" value={entry.date} onChange={(event) => updateEntry(entry.id, { date: event.target.value })} className="rounded-none border border-transparent bg-transparent px-1 py-1 text-sm hover:border-[#dbe3ee] focus:border-[#2563eb] focus:outline-none" /></td><td className="px-4 py-3"><input type="time" value={entry.arrival} onChange={(event) => updateEntry(entry.id, { arrival: event.target.value })} className="rounded-none border border-transparent bg-transparent px-1 py-1 text-sm hover:border-[#dbe3ee] focus:border-[#2563eb] focus:outline-none" /></td><td className="px-4 py-3"><input type="time"   value={entry.leaving} onChange={(event) => updateEntry(entry.id, { leaving: event.target.value })} className="rounded-none border border-transparent bg-transparent px-1 py-1 text-sm hover:border-[#dbe3ee] focus:border-[#2563eb] focus:outline-none" /></td><td className="px-4 py-3">  <span className="inline-flex rounded-none bg-[#f1f5f9] px-2 py-1 text-xs font-semibold text-[#475569]">{formatDuration(  officeSpanSeconds(entry.arrival, entry.leaving))}</span></td><td className="px-4 py-3"><select value={entry.memberId} onChange={(event) => updateEntry(entry.id, { memberId: event.target.value })} className="max-w-[130px] rounded-none border border-transparent bg-transparent px-1 py-1 text-sm hover:border-[#dbe3ee] focus:border-[#2563eb] focus:outline-none">{store.team.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></td><td className="px-4 py-3"><select value={entry.clientId} onChange={(event) => { const clientId = event.target.value; updateEntry(entry.id, { clientId, projectId: store.projects.find((project) => project.clientId === clientId)?.id ?? '' }); }} className="max-w-[150px] rounded-none border border-transparent bg-transparent px-1 py-1 text-sm hover:border-[#dbe3ee] focus:border-[#2563eb] focus:outline-none">{store.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></td><td className="px-4 py-3"><textarea value={entry.task} onChange={(event) => updateEntry(entry.id, { task: event.target.value })} rows={2} placeholder="What did you work on?" className="w-full min-w-[220px] resize-y rounded-none border border-transparent bg-transparent px-1 py-1 text-sm leading-5 hover:border-[#dbe3ee] focus:border-[#2563eb] focus:outline-none" /></td><td className="px-4 py-3">  <input type="text" inputMode="numeric" placeholder="HH:MM:SS" value={formatDuration(entryDurationSeconds(entry, activeTimer, now))} onChange={(event) => updateEntry(entry.id, { hours: event.target.value })} className="w-20 rounded-none border border-transparent bg-transparent px-2 py-1 text-sm font-semibold hover:border-[#dbe3ee] focus:border-[#2563eb] focus:outline-none" /></td><td className="px-4 py-3"><button type="button" aria-label="Delete time entry" onClick={() => updateStore('entries', store.entries.filter((item) => item.id !== entry.id))} className="rounded-none p-1 text-[#94a3b8] hover:bg-red-50 hover:text-red-500"><XMarkIcon className="h-4 w-4" /></button></td></tr></Fragment>)}</tbody></table></div></Card><Card className="flex flex-wrap items-center gap-5 p-5"><div><p className="text-sm font-bold text-[#111827]">Office timing defaults</p><p className="mt-1 text-xs text-[#64748b]">Set the default span for new entries. Individual rows remain editable.</p></div><Field label="Start" type="time" value={store.officeStart} onChange={(value) => updateOffice('officeStart', value)} className="w-32" /><Field label="End" type="time" value={store.officeEnd} onChange={(value) => updateOffice('officeEnd', value)} className="w-32" /></Card></div>;
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
  return <div className="space-y-6"><div><h2 className="text-2xl font-bold text-[#111827]">Pay structure</h2><p className="mt-1 text-sm text-[#64748b]">Your payout updates from the active Hours Track cycle.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Final payout" value={money(payout)} detail={`$${(payout / store.exchangeRate).toFixed(0)} USD`} icon={<BanknotesIcon className="h-5 w-5" />} /><Stat label="Client hours" value={`${hours.toFixed(1)}h`} detail={`${formatDuration(totalOfficeSeconds)} in office`} icon={<ClockIcon className="h-5 w-5" />} /><Stat label="Hourly value" value={money(hourlyValue)} detail="$9 × exchange rate" icon={<CurrencyDollarIcon className="h-5 w-5" />} /><Stat label="Active tier" value={tier.label} detail="Commission rate" icon={<ArrowTrendingUpIcon className="h-5 w-5" />} /></div><div className="grid gap-6 lg:grid-cols-5"><Card className="p-6 lg:col-span-2"><div className="flex items-center justify-between"><h3 className="font-bold text-[#111827]">Configuration</h3>{editing ? <button type="button" onClick={finishEditing} className="rounded-none bg-[#2563eb] px-3 py-1.5 text-xs font-semibold text-white">Done</button> : <button type="button" onClick={() => { setBasePay(String(store.basePay)); setExchangeRate(String(store.exchangeRate)); setEditing(true); }} className="rounded-none border border-[#dbe3ee] px-3 py-1.5 text-xs font-semibold text-[#2563eb]">Edit</button>}</div><div className="mt-5 grid gap-4">{editing ? <><Field label="Base pay (PKR)" type="number" value={basePay} onChange={setBasePay} /><Field label="USD → PKR conversion" type="number" value={exchangeRate} onChange={setExchangeRate} /></> : <><Metric label="Base pay (PKR)" value={money(store.basePay)} /><Metric label="USD → PKR conversion" value={String(store.exchangeRate)} /></>}</div><div className="mt-6 rounded-none bg-[#f8fafc] p-4 text-xs leading-6 text-[#64748b]"><strong className="text-[#334155]">Commission slabs</strong><br />&lt;75h 0% · 75–99h 5% · 100–149h 10%<br />150–199h 15% · 200h+ 20%</div></Card><Card className="p-6 lg:col-span-3"><div className="flex items-center justify-between"><div><h3 className="font-bold text-[#111827]">Tier progress</h3><p className="mt-1 text-sm text-[#64748b]">{tier.next ? `${(tier.next - hours).toFixed(1)}h to the ${getTier(tier.next).label} tier` : 'Highest tier reached'}</p></div><span className="text-2xl font-bold text-[#2563eb]">{Math.round(progress)}%</span></div><div className="mt-6 h-3 overflow-hidden rounded-none bg-[#e8eef7]"><div className="h-full rounded-none bg-[#2563eb] transition-all" style={{ width: `${progress}%` }} /></div><div className="mt-8 grid gap-4 sm:grid-cols-3"><Metric label="Effective hourly rate" value={hours ? money(payout / hours) : '—'} /><Metric label="Commission / hour" value={hours ? money(commission / hours) : '—'} /><Metric label="Weekly average pace" value={`${(hours / 4.33).toFixed(1)}h`} /></div><div className="mt-6 rounded-none border border-[#dbeafe] bg-[#eff6ff] p-4 text-sm text-[#1d4ed8]">{tier.next ? `Working ${(tier.next - hours).toFixed(1)} more hours will push you into the ${getTier(tier.next).label} tier.` : 'You are maximizing the available commission tier.'}</div></Card></div></div>;
}
function Metric({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-[#64748b]">{label}</p><p className="mt-1 font-bold text-[#111827]">{value}</p></div>; }

function IncomeView({ store, updateStore }: { store: Store; updateStore: <K extends keyof Store>(key: K, value: Store[K]) => void }) {
  const active = store.entries.filter((entry) => entry.cycleId === 'active'); const groups = [...store.cycles].map((cycle) => ({ id: cycle.id, label: cycle.label, entries: store.entries.filter((entry) => entry.cycleId === cycle.id), closed: true, notes: cycle.notes })); if (active.length) groups.unshift({ id: 'active', label: monthLabel(active[0].date), entries: active, closed: false, notes: '' });
  return <div className="space-y-6"><div><h2 className="text-2xl font-bold text-[#111827]">Monthly income</h2><p className="mt-1 text-sm text-[#64748b]">A historical ledger of every billing cycle and payout.</p></div><Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#94a3b8]"><tr>{['Billing cycle', 'Office hours', 'Client hours', 'Hourly value', 'Tier', 'Base pay', 'Final payout', 'Status', 'Notes'].map((heading) => <th key={heading} className="px-5 py-4 font-semibold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-[#eef2f7]">{groups.length ? groups.map((group) => { const officeDates = [...new Set(group.entries.map((entry) => entry.date))]; const office = officeDates.reduce((sum, date) => { const row = group.entries.find((entry) => entry.date === date); return sum + (row ? officeSpanSeconds(row.arrival, row.leaving) : 0); }, 0); const clientHours = group.entries.reduce((sum, entry) => sum + durationToSeconds(entry.hours), 0) / 3600; const value = group.entries.reduce((sum, entry) => sum + (durationToSeconds(entry.hours) / 3600) * (store.clients.find((client) => client.id === entry.clientId)?.rate ?? 0), 0); const tier = getTier(clientHours); const payout = store.basePay + value * tier.rate; return <tr key={group.id}><td className="px-5 py-4 font-semibold text-[#1e293b]">{group.label}</td><td className="px-5 py-4">{formatDuration(office)}</td><td className="px-5 py-4">{formatDuration(clientHours * 3600)}</td><td className="px-5 py-4">{money(value)}</td><td className="px-5 py-4"><span className="rounded-none bg-[#eff6ff] px-2 py-1 text-xs font-bold text-[#2563eb]">{tier.label}</span></td><td className="px-5 py-4">{money(store.basePay)}</td><td className="px-5 py-4 font-bold">{money(payout)}</td><td className="px-5 py-4"><span className={`inline-flex items-center gap-1 text-xs font-semibold ${group.closed ? 'text-slate-500' : 'text-emerald-600'}`}>{group.closed ? <CheckCircleIcon className="h-4 w-4" /> : <span className="h-2 w-2 rounded-none bg-emerald-500" />}{group.closed ? 'Closed' : 'Active'}</span></td><td className="px-5 py-4"><input value={group.notes} placeholder="Add note..." onChange={(event) => group.closed && updateStore('cycles', store.cycles.map((cycle) => cycle.id === group.id ? { ...cycle, notes: event.target.value } : cycle))} className="w-32 rounded-none border border-transparent bg-transparent px-2 py-1 text-xs hover:border-[#dbe3ee] focus:border-[#2563eb] focus:outline-none" /></td></tr>; }) : <tr><td colSpan={9} className="px-5 py-12 text-center text-[#94a3b8]">No cycles yet. Close a month from Hours Track to create a ledger record.</td></tr>}</tbody></table></div></Card></div>;
}

function ReportsView({ store, updateStore }: { store: Store; updateStore: <K extends keyof Store>(key: K, value: Store[K]) => void }) {
  const [clientId, setClientId] = useState(store.clients[0]?.id ?? '');
  const [projectId, setProjectId] = useState('');
  const [hours, setHours] = useState('');
  const [periodEnd, setPeriodEnd] = useState(today());
  const [notice, setNotice] = useState('');
  const [printId, setPrintId] = useState('');
  const markBilled = (reportId: string) => {
    const report = store.reports.find((item) => item.id === reportId);
    if (!report || report.billedAt) return;
    updateStore('reports', store.reports.map((item) => item.id === reportId ? { ...item, billedAt: new Date().toISOString() } : item));
    setNotice(`${report.number} marked billed. Its hours are now closed for this client.`);
  };
  const availableClientHours = clientId
    ? store.entries.filter((entry) => entry.clientId === clientId && (!projectId || entry.projectId === projectId)).reduce((sum, entry) => sum + availableSeconds(store, entry), 0) / 3600
    : 0;
  const clientReports = store.reports.filter((report) => report.clientId === clientId && !report.billedAt);
  const createHoursReport = () => {
    const requested = Number(hours);
    const report = createReport(store, clientId, requested, periodEnd, 'hours', `${requested} hour report · through ${periodEnd}`, projectId || undefined);
    if (!report) {
      setNotice('There are not enough unreported hours for this client through that date.');
      return;
    }
    updateStore('reports', [...store.reports, report]);
    setHours('');
    setNotice(`${report.hours} hours allocated in ${report.number}.`);
  };
  const sourceRows = (report: OfficeHoursReport) => report.lines.map((line) => {
    const entry = store.entries.find((item) => item.id === line.entryId);
    return entry ? { ...entry, seconds: line.seconds } : null;
  }).filter((entry): entry is Entry & { seconds: number } => Boolean(entry));

  return <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-[#111827]">Client reports</h2>
      <p className="mt-1 max-w-2xl text-sm text-[#64748b]">Create a printable project and time report from the oldest unreported entries.</p>
    </div>
    <Card className="p-6">
      <div className="flex flex-wrap items-end gap-4">
        <label className="text-xs font-semibold text-[#64748b]">Client<select value={clientId} onChange={(event) => { setClientId(event.target.value); setProjectId(''); }} className="mt-1 block min-w-52 rounded-none border border-[#dbe3ee] bg-white px-3 py-2 text-sm font-medium text-[#334155]">{store.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
        <label className="text-xs font-semibold text-[#64748b]">Project<select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="mt-1 block min-w-44 rounded-none border border-[#dbe3ee] bg-white px-3 py-2 text-sm font-medium text-[#334155]"><option value="">All projects</option>{store.projects.filter((project) => project.clientId === clientId).map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
        <Field label="Hours to report" type="number" value={hours} onChange={setHours} className="w-40" />
        <Field label="Include entries through" type="date" value={periodEnd} onChange={setPeriodEnd} className="w-44" />
        <button type="button" onClick={createHoursReport} disabled={!clientId || !hours || Number(hours) <= 0} className="rounded-none bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Create report</button>
      </div>
      <p className="mt-3 text-xs text-[#64748b]">Available for this client: {availableClientHours.toFixed(2)} hours. Enter 50 and the system takes the first 50 available hours. A later 30-hour report starts after those 50.</p>
      {notice ? <p className="mt-4 text-sm font-semibold text-[#334155]">{notice}</p> : null}
    </Card>
    <div className="grid gap-6 xl:grid-cols-2">
      {clientReports.slice().reverse().map((report) => {
        const client = store.clients.find((item) => item.id === report.clientId);
        const rows = sourceRows(report);
        const groups = ['VIDEO EDITING', 'BUSINESS ADMIN'].map((name) => ({
          name,
          rows: rows.filter((row) => reportCategory(row.task) === name),
        })).filter((group) => group.rows.length);
        return <article key={report.id} className={`report-sheet mx-auto w-full max-w-[700px] bg-white px-8 py-10 text-[#171717] shadow-[0_8px_30px_rgba(0,0,0,0.08)] sm:px-12 sm:py-12 ${printId && printId !== report.id ? 'print-hidden' : ''}`}>
          <div className="flex items-start justify-between gap-8">
            <div className="pt-2"><Image src="/logo.svg" alt="" width={145} height={31} className="h-auto w-[145px]" /></div>
            <div className="text-right">
              <h3 className="text-[26px] font-normal tracking-[0.18em] text-[#171717]">REPORT</h3>
              <p className="mt-2 text-[10px] leading-[1.35] text-[#404040]">{client?.name || 'Client'}</p>
              {client?.company && client.company !== client.name ? <p className="text-[10px] leading-[1.35] text-[#404040]">{client.company}</p> : null}
              <p className="text-[10px] leading-[1.35] text-[#404040]">Date: {formatReportDate(report.periodEnd)}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-[90px_minmax(0,1fr)_72px] gap-3 rounded-[4px] bg-[#303030] px-4 py-2 text-[11px] font-bold text-white">
            <span>DATE</span><span>PROJECTS</span><span className="text-right">TIME</span>
          </div>
          <div className="mt-4 space-y-4">
            {groups.map((group) => {
              const total = group.rows.reduce((sum, row) => sum + row.seconds, 0);
              return <section key={group.name}>
                <h4 className="mb-2 text-[11px] font-bold">{group.name}</h4>
                <div className="divide-y divide-[#cfcfcf]">
                  {group.rows.map((row) => <div key={`${report.id}-${row.id}`} className="grid grid-cols-[90px_minmax(0,1fr)_72px] gap-3 px-4 py-[5px] text-[10px] leading-[1.35]">
                    <span>{formatReportDate(row.date)}</span><span className="min-w-0"><strong>{store.projects.find((project) => project.id === row.projectId)?.name || 'General'}</strong>{row.task ? ` · ${row.task}` : ''}</span><span className="text-right">{formatDuration(row.seconds)}</span>
                  </div>)}
                </div>
                <p className="mt-2 text-right text-[10px] font-bold">+ {formatDuration(total)}</p>
              </section>;
            })}
          </div>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#eef2f7] pt-4">
            <span className={`text-xs font-semibold ${report.billedAt ? 'text-[#404040]' : 'text-[#737373]'}`}>{report.billedAt ? `Billed ${formatReportDate(report.billedAt.slice(0, 10))} · Closed` : 'Not billed · Hours reserved'}</span>
            {!report.billedAt ? <button type="button" onClick={() => markBilled(report.id)} className="rounded-md bg-[#171717] px-3 py-2 text-xs font-semibold text-white">Mark billed &amp; close</button> : null}
          </div>
          <div className="mt-6 flex justify-end print:hidden">
            <div className="flex gap-2"><a href={`/api/office-hours/reports/${encodeURIComponent(report.id)}`} download className="rounded-md bg-[#171717] px-4 py-2 text-xs font-semibold text-white">Download PDF</a><button type="button" onClick={() => { setPrintId(report.id); window.setTimeout(() => window.print(), 0); }} className="rounded-md border border-[#dbe3ee] px-4 py-2 text-xs font-semibold text-[#171717]">Print</button></div>
          </div>
        </article>;
      })}
    </div>
    {!clientReports.length ? <Card className="p-12 text-center text-sm text-[#64748b]">No open reports for this client. Only hours remaining after billed reports can be reported.</Card> : null}
  </div>;
}

function formatReportDate(date: string) {
  const [year, month, day] = date.split('-');
  return day && month && year ? `${day}/${month}/${year}` : date;
}

function reportCategory(task: string) {
  return /video|youtube|podcast|reel|editing|recording/i.test(task) ? 'VIDEO EDITING' : 'BUSINESS ADMIN';
}

function AnalyticsView({ store }: { store: Store }) {
  const [range, setRange] = useState('month');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const start = range === 'month' ? `${year}-${String(month + 1).padStart(2, '0')}-01`
    : range === 'last-month' ? `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-01`
      : range === 'year' ? `${year}-01-01`
        : range === 'last-year' ? `${year - 1}-01-01` : from;
  const end = range === 'month' ? `${year}-${String(month + 1).padStart(2, '0')}-31`
    : range === 'last-month' ? `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-31`
      : range === 'year' ? `${year}-12-31`
        : range === 'last-year' ? `${year - 1}-12-31` : to;
  const inRange = (entry: Entry) => (!start || entry.date >= start) && (!end || entry.date <= end);
  const billedSeconds = (entryId: string) => store.reports.flatMap((report) => report.billedAt ? report.lines : []).filter((line) => line.entryId === entryId).reduce((sum, line) => sum + line.seconds, 0);
  const rows = store.clients.map((client) => {
    const entries = store.entries.filter((entry) => entry.clientId === client.id && inRange(entry));
    const total = entries.reduce((sum, entry) => sum + durationToSeconds(entry.hours), 0);
    const billed = entries.reduce((sum, entry) => sum + billedSeconds(entry.id), 0);
    return { client, total, billed, unbilled: Math.max(0, total - billed) };
  });
  return <div className="space-y-6">
    <div><h2 className="text-2xl font-bold text-[#111827]">Analytics</h2><p className="mt-1 text-sm text-[#64748b]">Hours are calculated from time entries and billed report lines.</p></div>
    <Card className="p-5"><div className="flex flex-wrap items-end gap-3"><label className="text-xs font-semibold text-[#64748b]">Date range<select value={range} onChange={(event) => setRange(event.target.value)} className="mt-1 block rounded-none border border-[#dbe3ee] bg-white px-3 py-2 text-sm"><option value="month">Current month</option><option value="last-month">Last month</option><option value="year">Current year</option><option value="last-year">Last year</option><option value="custom">Custom range</option></select></label>{range === 'custom' ? <><Field label="From" type="date" value={from} onChange={setFrom} /><Field label="To" type="date" value={to} onChange={setTo} /></> : null}</div></Card>
    <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#94a3b8]"><tr><th className="px-5 py-4">Client</th><th className="px-5 py-4">Total hours</th><th className="px-5 py-4">Billed hours</th><th className="px-5 py-4">Unbilled hours</th></tr></thead><tbody className="divide-y divide-[#eef2f7]">{rows.map(({ client, total, billed, unbilled }) => <tr key={client.id}><td className="px-5 py-4 font-semibold">{client.name}</td><td className="px-5 py-4">{formatDuration(total)}</td><td className="px-5 py-4">{formatDuration(Math.min(total, billed))}</td><td className="px-5 py-4 font-semibold">{formatDuration(unbilled)}</td></tr>)}</tbody></table></div></Card>
  </div>;
}
