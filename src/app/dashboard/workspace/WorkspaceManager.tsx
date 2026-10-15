'use client';

import { FormEvent, useEffect, useState } from 'react';

type Workspace = { id: string; name: string; description: string; role: 'owner' | 'member'; createdAt: string };

export default function WorkspaceManager() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const response = await fetch('/api/workspace');
    const payload = await response.json() as { workspaces?: Workspace[]; error?: string };
    if (!response.ok) throw new Error(payload.error ?? 'Unable to load workspaces.');
    setWorkspaces(payload.workspaces ?? []);
    setSelectedWorkspaceId((current) => current || payload.workspaces?.[0]?.id || '');
  };

  useEffect(() => {
    const task = window.setTimeout(() => {
      void load().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load workspaces.')).finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(task);
  }, []);

  const createWorkspace = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    const response = await fetch('/api/workspace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description }) });
    const payload = await response.json() as { workspace?: Workspace; error?: string };
    if (!response.ok) { setError(payload.error ?? 'Unable to create workspace.'); return; }
    setName('');
    setDescription('');
    setMessage('Workspace created.');
    await load();
    if (payload.workspace) setSelectedWorkspaceId(payload.workspace.id);
  };

  const invite = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    const response = await fetch('/api/workspace/invitations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: selectedWorkspaceId, email }) });
    const payload = await response.json() as { error?: string };
    if (!response.ok) { setError(payload.error ?? 'Unable to send invitation.'); return; }
    setEmail('');
    setMessage('Invitation sent. It expires in 7 days.');
  };

  if (loading) return <p className="text-sm text-[#64748b]">Loading your workspaces…</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="border border-[#dbe3ee] bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">Your teams</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#0B353B]">OfficeHoursTrack workspace</h1>
        {error ? <p className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        {message ? <p className="mt-4 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p> : null}
        {workspaces.length ? <div className="mt-6 space-y-3">{workspaces.map((workspace) => <button type="button" key={workspace.id} onClick={() => setSelectedWorkspaceId(workspace.id)} className={`w-full border p-4 text-left ${selectedWorkspaceId === workspace.id ? 'border-[#3C853C] bg-[#F2FBF0]' : 'border-[#e5e7eb]'}`}><span className="font-semibold text-[#0B353B]">{workspace.name}</span><span className="mt-1 block text-sm text-[#64748b]">{workspace.description || 'No description added.'} · {workspace.role}</span></button>)}</div> : <p className="mt-6 border border-dashed border-[#cbd5e1] p-6 text-sm text-[#64748b]">You are not in a workspace yet. Create one to start with an empty OfficeHoursTrack workspace, or accept an invitation from a teammate.</p>}
      </section>
      <div className="space-y-6">
        <form onSubmit={createWorkspace} className="border border-[#dbe3ee] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#0B353B]">Create a workspace</h2>
          <input className="input mt-4" placeholder="Team name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} />
          <textarea className="input mt-3 min-h-24" placeholder="What is this team working on?" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={300} />
          <button className="cta-primary mt-4 w-full" type="submit">Create team</button>
        </form>
        {selectedWorkspaceId && workspaces.find((workspace) => workspace.id === selectedWorkspaceId)?.role === 'owner' ? <form onSubmit={invite} className="border border-[#dbe3ee] bg-white p-6"><h2 className="text-lg font-semibold text-[#0B353B]">Invite a teammate</h2><p className="mt-2 text-sm text-[#64748b]">We will email a secure invitation link that expires in 7 days.</p><input className="input mt-4" type="email" placeholder="teammate@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /><button className="cta-primary mt-4 w-full" type="submit">Send invitation</button></form> : null}
      </div>
    </div>
  );
}
