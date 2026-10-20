'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { ArrowPathIcon, KeyIcon } from '@heroicons/react/24/outline';
import { AuthCard, authLabel } from '@/components/auth/AuthCard';
import { Feedback } from '@/components/ui/Feedback';
import EmptyState from '@/components/ui/EmptyState';
import PasswordMeter from '@/components/ui/PasswordMeter';

export default function ResetPasswordForm({ token }: { token: string }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  if (!token) {
    return (
      <div className="panel w-full max-w-md p-10">
        <EmptyState scene="missing" title="Link broken" action={<Link href="/forgot-password" className="cta-primary">New link</Link>} />
      </div>
    );
  }

  if (done) {
    return (
      <div className="panel w-full max-w-md p-10">
        <EmptyState scene="check" title="Password updated" action={<Link href="/login" className="cta-primary">Log in</Link>} />
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords differ');
      return;
    }

    setIsBusy(true);
    try {
      const response = await fetch('/api/account/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });
      const payload = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? 'Error');
        return;
      }
      setDone(true);
    } catch {
      setError('No connection');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <AuthCard icon={<KeyIcon className="h-8 w-8" aria-hidden="true" />} title="New password">
      <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
        <label className={authLabel}>
          New password
          <input type="password" name="newPassword" autoComplete="new-password" required minLength={8} maxLength={128} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="field" />
        </label>
        <PasswordMeter password={newPassword} />
        <label className={authLabel}>
          Confirm
          <input type="password" name="confirmPassword" autoComplete="new-password" required minLength={8} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="field" />
        </label>
        {error ? <Feedback tone="error" label={error} /> : null}
        <button type="submit" disabled={isBusy} className="cta-primary w-full !py-4">
          {isBusy ? <ArrowPathIcon className="h-5 w-5 spin" aria-hidden="true" /> : 'Save'}
        </button>
      </form>
    </AuthCard>
  );
}
