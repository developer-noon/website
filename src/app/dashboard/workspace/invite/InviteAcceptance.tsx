'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function InviteAcceptance() {
  const token = useSearchParams().get('token') ?? '';
  const [details, setDetails] = useState<{ workspaceName: string; description: string; email: string } | null>(null);
  const [message, setMessage] = useState(token ? 'Loading invitation…' : 'Invitation token is missing.');
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!token) return;
    void fetch(`/api/workspace/invitations?token=${encodeURIComponent(token)}`).then(async (response) => {
      const payload = await response.json() as { invitation?: { workspaceName: string; description: string; email: string }; error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Unable to load invitation.');
      setDetails(payload.invitation ?? null);
      setMessage('');
    }).catch((reason: unknown) => setMessage(reason instanceof Error ? reason.message : 'Unable to load invitation.'));
  }, [token]);

  const accept = async () => {
    const response = await fetch('/api/workspace/invitations/accept', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
    const payload = await response.json() as { error?: string; workspaceId?: string };
    if (!response.ok) { setMessage(payload.error ?? 'Unable to accept invitation.'); return; }
    setAccepted(true);
  };

  return <main className="mx-auto max-w-xl px-4 py-20"><section className="border border-[#dbe3ee] bg-white p-8 text-center"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">Workspace invitation</p>{details ? <><h1 className="mt-4 text-3xl font-semibold text-[#0B353B]">Join {details.workspaceName}?</h1><p className="mt-3 text-[#64748b]">{details.description || 'Work together in OfficeHoursTrack.'}</p><p className="mt-3 text-sm text-[#64748b]">Invitation for {details.email}</p>{accepted ? <p className="mt-6 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">You joined the workspace.</p> : <button type="button" onClick={() => void accept()} className="cta-primary mt-6">Accept invitation</button>}</> : <p className="mt-6 text-sm text-red-700">{message}</p>}{accepted ? <Link href="/dashboard/workspace" className="mt-6 inline-block text-sm font-semibold text-[#2563eb]">Open workspace</Link> : null}{message && details ? <p className="mt-4 text-sm text-red-700">{message}</p> : null}</section></main>;
}
