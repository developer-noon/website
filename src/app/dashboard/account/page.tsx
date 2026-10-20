'use client';

import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { useEffect, useState, type FormEvent } from 'react';
import { ArrowPathIcon, EnvelopeIcon, KeyIcon, ShieldCheckIcon, TrashIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Reveal from '@/components/Reveal';
import { authInput, authLabel } from '@/components/auth/AuthCard';
import OtpInput from '@/components/ui/OtpInput';
import Switch from '@/components/ui/Switch';
import { Feedback, StatusIcon } from '@/components/ui/Feedback';

type Account = { name: string; email: string; phone: string; company: string; role: string };
type TwoFactorStatus = { enabled: boolean; pending: boolean };
type Setup = { secret: string; uri: string; qrCode: string };

async function request<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  const payload = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? 'Error');
  return payload;
}

/** Section header: an icon in a tile and a short title. */
/** `tone` sets both the tile background and the icon colour, so every pairing stays readable. */
function SectionHead({ Icon, title, tone = 'bg-[var(--color-mint)] text-[var(--color-secondary)]' }: { Icon: typeof KeyIcon; title: string; tone?: string }) {
  return (
    <div className="flex items-center gap-6">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="text-2xl">{title}</h2>
    </div>
  );
}

export default function AccountPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    request<{ user: Account }>('/api/account')
      .then((payload) => setAccount(payload.user))
      .catch(() => setLoadError('Error'));
  }, []);

  if (loadError) {
    return <div className="mx-auto max-w-3xl py-10"><Feedback tone="error" label={loadError} /></div>;
  }

  if (!account) {
    return <div className="mx-auto flex max-w-3xl justify-center py-20"><StatusIcon tone="loading" size="lg" /></div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-10">
      <Reveal>
        <div className="flex items-center gap-6">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)] text-3xl font-extrabold text-[var(--color-on-primary)]">
            {account.name.charAt(0).toUpperCase() || '?'}
          </span>
          <div>
            <h1 className="text-[clamp(2rem,4vw,2.6rem)]">{account.name}</h1>
            <p className="mt-1 text-[var(--color-text-muted)]">{account.email}</p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={60}><ProfileSection account={account} onSaved={setAccount} /></Reveal>
      <Reveal delay={100}><PasswordSection email={account.email} /></Reveal>
      <Reveal delay={140}><TwoFactorSection email={account.email} /></Reveal>
      <Reveal delay={180}><DangerSection /></Reveal>
    </div>
  );
}

function ProfileSection({ account, onSaved }: { account: Account; onSaved: (account: Account) => void }) {
  const [draft, setDraft] = useState(account);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('saving');
    try {
      await request('/api/account', { method: 'PATCH', body: JSON.stringify({ name: draft.name, phone: draft.phone, company: draft.company }) });
      onSaved(draft);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="panel p-7 sm:p-9">
      <SectionHead Icon={UserCircleIcon} title="Profile" />
      <form onSubmit={save} className="mt-7 grid gap-6 sm:grid-cols-2">
        <label className={authLabel}>
          Name
          <input required maxLength={100} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className={authInput} />
        </label>
        <label className={authLabel}>
          Company
          <input maxLength={120} value={draft.company} onChange={(event) => setDraft({ ...draft, company: event.target.value })} className={authInput} />
        </label>
        <label className={authLabel}>
          Phone
          <input type="tel" maxLength={40} value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} className={authInput} />
        </label>
        <label className={authLabel}>
          Email
          <input value={account.email} disabled className={authInput} />
        </label>
        <div className="flex items-center gap-6 sm:col-span-2">
          <button type="submit" disabled={status === 'saving'} className="cta-primary">
            {status === 'saving' ? <ArrowPathIcon className="h-5 w-5 spin" aria-hidden="true" /> : 'Save'}
          </button>
          {status === 'saved' ? <StatusIcon tone="success" size="sm" /> : null}
          {status === 'error' ? <StatusIcon tone="error" size="sm" /> : null}
        </div>
      </form>
    </section>
  );
}

function PasswordSection({ email }: { email: string }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const requestUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');
    setError('');
    try {
      await request('/api/account', { method: 'PUT', body: JSON.stringify({ currentPassword }) });
      setStatus('sent');
      setCurrentPassword('');
    } catch (caught) {
      setStatus('error');
      setError(caught instanceof Error ? caught.message : 'Error');
    }
  };

  return (
    <section className="panel p-7 sm:p-9">
      <SectionHead Icon={KeyIcon} title="Password" tone="bg-[var(--color-primary)] text-[var(--color-on-primary)]" />
      {status === 'sent' ? (
        <div className="mt-7 flex items-center gap-6 rounded-3xl bg-[var(--color-success-bg)] p-7">
          <EnvelopeIcon className="h-7 w-7 text-[var(--color-success)]" aria-hidden="true" />
          <span className="font-bold text-[var(--color-success)]">{email}</span>
        </div>
      ) : (
        <form onSubmit={requestUpdate} className="mt-7 grid gap-6 sm:max-w-md">
          <label className={authLabel}>
            Current password
            <input type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className={authInput} />
          </label>
          <div className="flex items-center gap-6">
            <button type="submit" disabled={status === 'sending' || !currentPassword} className="cta-secondary">
              {status === 'sending' ? <ArrowPathIcon className="h-5 w-5 spin" aria-hidden="true" /> : <><EnvelopeIcon className="h-5 w-5" aria-hidden="true" /> Email me</>}
            </button>
            {status === 'error' ? <Feedback tone="error" label={error} /> : null}
          </div>
        </form>
      )}
    </section>
  );
}

function TwoFactorSection({ email }: { email: string }) {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<'on' | 'off' | null>(null);

  const load = () => request<TwoFactorStatus>('/api/account/2fa').then(setStatus).catch(() => setError('Error'));
  useEffect(() => { void load(); }, []);

  const toggleOn = async () => {
    setBusy(true);
    setError('');
    try {
      setSetup(await request<Setup>('/api/account/2fa', { method: 'POST' }));
    } catch {
      setError('Error');
    } finally {
      setBusy(false);
    }
  };

  const confirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await request('/api/account/2fa', { method: 'PUT', body: JSON.stringify({ code }) });
      setSetup(null);
      setCode('');
      setDone('on');
      await load();
    } catch {
      setError('Code not valid');
    } finally {
      setBusy(false);
    }
  };

  const disable = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await request('/api/account/2fa', { method: 'DELETE', body: JSON.stringify({ password, code: disableCode }) });
      setPassword('');
      setDisableCode('');
      setDone('off');
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Error');
    } finally {
      setBusy(false);
    }
  };

  const enabled = Boolean(status?.enabled);

  return (
    <section className="panel p-7 sm:p-9">
      <div className="flex items-center justify-between gap-6">
        <SectionHead Icon={ShieldCheckIcon} title="2-step" tone="bg-[var(--color-surface-raised)] text-[var(--color-secondary)]" />
        {status ? (
          <Switch
            label="Two-step verification"
            checked={enabled || Boolean(setup)}
            disabled={busy || Boolean(setup)}
            onChange={(next) => {
              // Turning off goes through the form below, which asks for the password and a code.
              setDone(null);
              if (next) void toggleOn();
            }}
          />
        ) : <ArrowPathIcon className="h-6 w-6 spin text-[var(--color-text-muted)]" aria-hidden="true" />}
      </div>

      {setup ? (
        <div className="mt-8 grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
          <div className="rounded-3xl border-2 border-[var(--color-border)] p-3">
            <Image src={setup.qrCode} alt="" width={200} height={200} unoptimized className="h-[200px] w-[200px]" />
          </div>
          <form onSubmit={confirm} className="grid gap-6">
            <p className="break-all rounded-2xl bg-[var(--color-surface-raised)] px-4 py-3 font-mono text-sm font-semibold text-[var(--color-ink)]">{setup.secret}</p>
            <OtpInput value={code} onChange={setCode} invalid={error === 'Code not valid'} label="Code" autoFocus />
            {error ? <Feedback tone="error" label={error} /> : null}
            <div className="flex gap-3">
              <button type="submit" disabled={busy || code.length !== 6} className="cta-primary">Confirm</button>
              <button type="button" onClick={() => { setSetup(null); setCode(''); setError(''); }} className="cta-ghost">Cancel</button>
            </div>
          </form>
        </div>
      ) : null}

      {enabled && !setup ? (
        <form onSubmit={disable} className="mt-8 grid gap-6 md:max-w-md">
          <p className="text-sm text-[var(--color-text-muted)]">{email}</p>
          <label className={authLabel}>
            Password
            <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className={authInput} />
          </label>
          <OtpInput value={disableCode} onChange={setDisableCode} label="Code" />
          {error ? <Feedback tone="error" label={error} /> : null}
          <div>
            <button type="submit" disabled={busy || password.length === 0 || disableCode.length !== 6} className="cta-secondary !border-[var(--color-danger)] !text-[var(--color-danger)]">Turn off</button>
          </div>
        </form>
      ) : null}

      {done ? <div className="mt-8"><Feedback tone="success" label={done === 'on' ? 'On' : 'Off'} /></div> : null}
      {!enabled && !setup && error ? <div className="mt-8"><Feedback tone="error" label={error} /></div> : null}
    </section>
  );
}

function DangerSection() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const deleteAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!window.confirm('Delete account?')) return;
    setBusy(true);
    setError('');
    try {
      await request('/api/account', { method: 'DELETE', body: JSON.stringify({ password }) });
      await signOut({ callbackUrl: '/' });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Error');
      setBusy(false);
    }
  };

  return (
    <section className="rounded-[28px] border-2 border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)]/40 p-7 sm:p-9">
      <SectionHead Icon={TrashIcon} title="Delete" tone="bg-[var(--color-danger)] text-white" />
      <form onSubmit={deleteAccount} className="mt-7 grid gap-6 sm:max-w-md">
        <label className={authLabel}>
          Password
          <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className={authInput} />
        </label>
        {error ? <Feedback tone="error" label={error} /> : null}
        <div>
          <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-[var(--color-danger)] px-6 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50">
            {busy ? <ArrowPathIcon className="h-5 w-5 spin" aria-hidden="true" /> : <TrashIcon className="h-5 w-5" aria-hidden="true" />}
            Delete
          </button>
        </div>
      </form>
    </section>
  );
}
