'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRightIcon, ArrowPathIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import EmptyState from '@/components/ui/EmptyState';
import { Feedback } from '@/components/ui/Feedback';

type Details = { workspaceName: string; description: string; email: string };

export default function InviteAcceptance() {
  const token = useSearchParams().get('token') ?? '';
  const [details, setDetails] = useState<Details | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'accepting' | 'accepted' | 'error'>(token ? 'loading' : 'error');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    void fetch(`/api/workspace/invitations?token=${encodeURIComponent(token)}`).then(async (response) => {
      const payload = await response.json() as { invitation?: Details; error?: string };
      if (!response.ok || !payload.invitation) throw new Error(payload.error ?? 'Error');
      setDetails(payload.invitation);
      setStatus('ready');
    }).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : 'Error');
      setStatus('error');
    });
  }, [token]);

  const accept = async () => {
    setStatus('accepting');
    const response = await fetch('/api/workspace/invitations/accept', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
    const payload = await response.json() as { error?: string };
    if (!response.ok) {
      setError(payload.error ?? 'Error');
      setStatus('error');
      return;
    }
    setStatus('accepted');
  };

  return (
    <div className="mx-auto flex max-w-lg justify-center py-16">
      <section className="panel w-full p-10 text-center">
        {status === 'loading' || status === 'accepting' ? (
          <div className="flex justify-center py-10"><ArrowPathIcon className="h-12 w-12 spin text-[var(--color-ink)]" aria-hidden="true" /></div>
        ) : null}

        {status === 'ready' && details ? (
          <>
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)]">
              <EnvelopeIcon className="h-10 w-10 text-[var(--color-on-primary)]" aria-hidden="true" />
            </span>
            <h1 className="mt-8 text-[clamp(1.8rem,4vw,2.4rem)]">{details.workspaceName}</h1>
            <p className="mt-3 text-sm font-bold text-[var(--color-text-muted)]">{details.email}</p>
            <button type="button" onClick={() => void accept()} className="cta-primary mt-8 !py-4">
              Join <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        ) : null}

        {status === 'accepted' ? (
          <EmptyState scene="check" title="Joined" action={<Link href="/dashboard/workspace" className="cta-primary">Team</Link>} />
        ) : null}

        {status === 'error' ? (
          <EmptyState scene="missing" title="Link not valid" action={error ? <Feedback tone="error" label={error} /> : undefined} />
        ) : null}
      </section>
    </div>
  );
}
