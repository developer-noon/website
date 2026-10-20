'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { ArrowPathIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { AuthCard, authLabel } from '@/components/auth/AuthCard';
import { Feedback } from '@/components/ui/Feedback';
import EmptyState from '@/components/ui/EmptyState';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsBusy(true);
    try {
      const response = await fetch('/api/account/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? 'Error');
        return;
      }
      setSent(true);
    } catch {
      setError('No connection');
    } finally {
      setIsBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="panel w-full max-w-md p-10">
        <EmptyState scene="mail" title="Check your inbox" action={<Link href="/login" className="cta-secondary">Log in</Link>} />
      </div>
    );
  }

  return (
    <AuthCard
      icon={<EnvelopeIcon className="h-8 w-8" aria-hidden="true" />}
      title="Reset password"
      footer={<Link href="/login" className="font-bold text-[var(--color-ink)] underline decoration-[var(--color-primary)] decoration-4 underline-offset-4">Back to log in</Link>}
    >
      <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
        <label className={authLabel}>
          Email
          <input type="email" name="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className="field" />
        </label>
        {error ? <Feedback tone="error" label={error} /> : null}
        <button type="submit" disabled={isBusy || !email} className="cta-primary w-full !py-4">
          {isBusy ? <ArrowPathIcon className="h-5 w-5 spin" aria-hidden="true" /> : 'Send link'}
        </button>
      </form>
    </AuthCard>
  );
}
