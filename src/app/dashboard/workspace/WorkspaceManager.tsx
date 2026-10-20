'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { ArrowPathIcon, CheckIcon, EnvelopeIcon, PlusIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import EmptyState from '@/components/ui/EmptyState';
import { Feedback } from '@/components/ui/Feedback';

type Workspace = { id: string; name: string; description: string; role: 'owner' | 'member'; createdAt: string };

const field = 'field';
const label = 'grid gap-2 text-sm font-bold text-[var(--color-ink)]';

export default function WorkspaceManager() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('');
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; label: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const response = await fetch('/api/workspace');
    const payload = await response.json() as { workspaces?: Workspace[]; error?: string };
    if (!response.ok) throw new Error(payload.error ?? 'Error');
    setWorkspaces(payload.workspaces ?? []);
    setSelectedWorkspaceId((current) => current || payload.workspaces?.[0]?.id || '');
  };

  useEffect(() => {
    const task = window.setTimeout(() => {
      void load()
        .catch((reason: unknown) => setNotice({ tone: 'error', label: reason instanceof Error ? reason.message : 'Error' }))
        .finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(task);
  }, []);

  const createWorkspace = async (event: FormEvent) => {
    event.preventDefault();
    setNotice(null);
    setBusy(true);
    const response = await fetch('/api/workspace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description }) });
    const payload = await response.json() as { workspace?: Workspace; error?: string };
    setBusy(false);
    if (!response.ok) { setNotice({ tone: 'error', label: payload.error ?? 'Error' }); return; }
    setName('');
    setDescription('');
    setNotice({ tone: 'success', label: 'Created' });
    await load();
    if (payload.workspace) setSelectedWorkspaceId(payload.workspace.id);
  };

  const invite = async (event: FormEvent) => {
    event.preventDefault();
    setNotice(null);
    setBusy(true);
    const response = await fetch('/api/workspace/invitations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: selectedWorkspaceId, email }) });
    const payload = await response.json() as { error?: string };
    setBusy(false);
    if (!response.ok) { setNotice({ tone: 'error', label: payload.error ?? 'Error' }); return; }
    setEmail('');
    setNotice({ tone: 'success', label: 'Sent' });
  };

  if (loading) {
    return <div className="flex justify-center py-24"><ArrowPathIcon className="h-10 w-10 spin text-[var(--color-ink)]" aria-hidden="true" /></div>;
  }

  const selected = workspaces.find((workspace) => workspace.id === selectedWorkspaceId);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="panel p-7 sm:p-9">
        <h1 className="text-[clamp(2rem,4vw,2.6rem)]">Team</h1>
        {notice ? <div className="mt-8"><Feedback tone={notice.tone} label={notice.label} /></div> : null}

        {workspaces.length ? (
          <div className="mt-8 grid gap-3">
            {workspaces.map((workspace) => {
              const isSelected = selectedWorkspaceId === workspace.id;
              return (
                <button
                  type="button"
                  key={workspace.id}
                  onClick={() => setSelectedWorkspaceId(workspace.id)}
                  aria-pressed={isSelected}
                  className={`flex items-center gap-6 rounded-[24px] border-2 p-7 text-left transition-all duration-200 ${isSelected
                    ? 'border-[var(--color-ink)] bg-[var(--color-mint)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-ink)]'}`}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                    <UserGroupIcon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-extrabold text-[var(--color-ink)]">{workspace.name}</span>
                    <span className="block truncate text-sm text-[var(--color-text-muted)]">{workspace.description || workspace.role}</span>
                  </span>
                  {isSelected ? <CheckIcon className="h-6 w-6 shrink-0 text-[var(--color-ink)]" aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState scene="team" title="No team yet" />
        )}
      </section>

      <div className="space-y-6">
        <form onSubmit={createWorkspace} className="panel p-7">
          <h2 className="flex items-center gap-2 text-2xl"><PlusIcon className="h-6 w-6" aria-hidden="true" /> New</h2>
          <div className="mt-8 grid gap-6">
            <label className={label}>
              Name
              <input className={field} value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} />
            </label>
            <label className={label}>
              About
              <textarea className={`${field} min-h-24`} value={description} onChange={(event) => setDescription(event.target.value)} maxLength={300} />
            </label>
            <button className="cta-primary w-full" type="submit" disabled={busy}>
              {busy ? <ArrowPathIcon className="h-5 w-5 spin" aria-hidden="true" /> : <CheckIcon className="h-5 w-5" aria-hidden="true" />}
              {busy ? "Saving" : "Create team"}
            </button>
          </div>
        </form>

        {selected?.role === 'owner' ? (
          <form onSubmit={invite} className="panel p-7">
            <h2 className="flex items-center gap-2 text-2xl"><EnvelopeIcon className="h-6 w-6" aria-hidden="true" /> Invite</h2>
            <div className="mt-8 grid gap-6">
              <label className={label}>
                Email
                <input className={field} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </label>
              <button className="cta-primary w-full" type="submit" disabled={busy}>
                {busy ? <ArrowPathIcon className="h-5 w-5 spin" aria-hidden="true" /> : <EnvelopeIcon className="h-5 w-5" aria-hidden="true" />}
                {busy ? "Sending" : "Send invite"}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
