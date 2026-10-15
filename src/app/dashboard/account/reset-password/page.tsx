'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function ResetPasswordPage() {
  const token = useSearchParams().get('token') ?? '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true); setError(''); setMessage('');
    try {
      const response = await fetch('/api/account/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Unable to update your password.');
      setDone(true);
      setMessage('Your password was updated and a confirmation email was sent.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to update your password.');
    } finally {
      setBusy(false);
    }
  };

  return <main className="mx-auto max-w-xl px-4 py-20"><section className="border border-[#dbe3ee] bg-white p-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">Password security</p><h1 className="mt-3 text-3xl font-bold text-[#111827]">Update password</h1>{message ? <p className="mt-5 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}{error ? <p className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}{!done ? <form onSubmit={submit} className="mt-6 space-y-5"><label className="block"><span className="mb-1.5 block text-xs font-semibold text-[#64748b]">New password</span><input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} maxLength={128} required className="w-full border border-[#dbe3ee] px-3 py-2.5 text-sm" /></label><label className="block"><span className="mb-1.5 block text-xs font-semibold text-[#64748b]">Re-enter new password</span><input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} maxLength={128} required className="w-full border border-[#dbe3ee] px-3 py-2.5 text-sm" /></label><button type="submit" disabled={busy || !token} className="bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? 'Updating…' : 'Update password'}</button></form> : null}{done ? <Link href="/dashboard/account" className="mt-6 inline-block text-sm font-semibold text-[#2563eb]">Return to account</Link> : null}</section></main>;
}
