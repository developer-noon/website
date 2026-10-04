'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { Card } from '@/app/dashboard/account/ui';

type Account = { name: string; email: string; phone: string; company: string; role: string };

export default function AccountPage() {
  const [account, setAccount] = useState<Account>({ name: '', email: '', phone: '', company: '', role: 'user' });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetch('/api/account').then(async (response) => {
      const payload = await response.json() as { user?: Account; error?: string };
      if (!response.ok || !payload.user) setError(payload.error ?? 'Unable to load your account.');
      else setAccount(payload.user);
    }).catch(() => setError('Unable to load your account.'));
  }, []);

  const update = (field: 'name' | 'phone' | 'company', value: string) => setAccount((current) => ({ ...current, [field]: value }));
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true); setNotice(''); setError('');
    try {
      const response = await fetch('/api/account', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: account.name, phone: account.phone, company: account.company }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Unable to update your profile.');
      setNotice('Profile updated.');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to update your profile.'); }
    finally { setBusy(false); }
  };
  const deleteAccount = async () => {
    if (!window.confirm('Delete your account and all dashboard data permanently? This cannot be undone.')) return;
    setBusy(true); setError('');
    const response = await fetch('/api/account', { method: 'DELETE' });
    if (!response.ok) {
      const payload = await response.json() as { error?: string };
      setError(payload.error ?? 'Unable to delete your account.');
      setBusy(false);
      return;
    }
    await signOut({ callbackUrl: '/' });
  };

  return <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
    <div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">Account</p><h1 className="mt-3 text-4xl font-bold tracking-tight text-[#111827]">Profile and account</h1><p className="mt-3 text-[#64748b]">Update your profile details or permanently remove your account and workspace data.</p></div>
    <Card>
      <form onSubmit={save} className="space-y-5 p-6">
        {notice ? <p className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p> : null}
        {error ? <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        <Field label="Name" value={account.name} onChange={(value) => update('name', value)} required />
        <Field label="Email" value={account.email} onChange={() => undefined} disabled />
        <div className="grid gap-5 sm:grid-cols-2"><Field label="Phone" value={account.phone} onChange={(value) => update('phone', value)} /><Field label="Company" value={account.company} onChange={(value) => update('company', value)} /></div>
        <div className="flex items-center justify-between border-t border-[#e6ebf2] pt-5"><span className="text-sm text-[#64748b]">Role: <strong className="text-[#111827]">{account.role}</strong></span><button type="submit" disabled={busy} className="bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? 'Saving…' : 'Save changes'}</button></div>
      </form>
    </Card>
    <Card className="mt-6 border-red-200">
      <div className="p-6"><h2 className="font-bold text-red-700">Delete account</h2><p className="mt-2 text-sm text-[#64748b]">This permanently deletes your profile, time entries, clients, newsletter data, and connected sign-in accounts.</p><button type="button" onClick={() => void deleteAccount()} disabled={busy} className="mt-5 border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50">Delete account</button></div>
    </Card>
  </div>;
}

function Field({ label, value, onChange, disabled = false, required = false }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean; required?: boolean }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-[#64748b]">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} required={required} className="w-full border border-[#dbe3ee] bg-white px-3 py-2.5 text-sm text-[#1e293b] outline-none focus:border-[#2563eb] disabled:bg-[#f8fafc] disabled:text-[#94a3b8]" /></label>;
}
