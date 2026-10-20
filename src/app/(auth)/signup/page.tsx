'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState, type FormEvent } from 'react';
import { ArrowPathIcon, EnvelopeIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { AuthCard, GoogleIcon, authLabel } from '@/components/auth/AuthCard';
import OtpInput from '@/components/ui/OtpInput';
import { Feedback } from '@/components/ui/Feedback';
import PasswordMeter from '@/components/ui/PasswordMeter';
import Stepper from '@/components/ui/Stepper';

type Details = { name: string; email: string; password: string; confirmPassword: string; company: string; phone: string };
type Stage = 'details' | 'code' | 'done';

async function postJson<T>(url: string, body: unknown) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({})) as T & { error?: string };
  return { ok: response.ok, payload };
}

export default function SignupPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('details');
  const [details, setDetails] = useState<Details>({ name: '', email: '', password: '', confirmPassword: '', company: '', phone: '' });
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const update = (field: keyof Details) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setDetails((current) => ({ ...current, [field]: event.target.value }));
  };

  const sendCode = async () => {
    const { ok, payload } = await postJson<{ message?: string }>('/api/auth/send-verification', { email: details.email });
    if (!ok) throw new Error(payload.error ?? 'Could not send code');
    setStage('code');
  };

  const handleDetails = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (details.password.length < 8) return setError('Min 8 characters');
    if (details.password !== details.confirmPassword) return setError('Passwords differ');

    setIsBusy(true);
    try {
      await sendCode();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Error');
    } finally {
      setIsBusy(false);
    }
  };

  const handleCode = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setError('');
    setIsBusy(true);

    try {
      const verified = await postJson<{ verificationToken?: string }>('/api/auth/verify-email', { email: details.email, code });
      if (!verified.ok || !verified.payload.verificationToken) {
        setError('Code not valid');
        setCode('');
        return;
      }

      const created = await postJson<{ message?: string }>('/api/register', {
        ...details,
        verificationToken: verified.payload.verificationToken,
      });
      if (!created.ok) {
        setError(created.payload.error ?? 'Could not create account');
        return;
      }

      setStage('done');
      const result = await signIn('credentials', { email: details.email, password: details.password, redirect: false });
      if (result?.error) {
        router.push('/login');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('No connection');
    } finally {
      setIsBusy(false);
    }
  };

  const resend = async () => {
    setError('');
    setIsBusy(true);
    try {
      await sendCode();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Error');
    } finally {
      setIsBusy(false);
    }
  };

  const stepIndex = stage === 'details' ? 0 : 1;

  return (
    <AuthCard
      icon={<UserPlusIcon className="h-8 w-8" aria-hidden="true" />}
      title={stage === 'details' ? 'Create your account' : 'Check your email'}
      subtitle={stage === 'details' ? 'It takes about a minute. We will email a six-digit code to confirm your address before you can sign in.' : 'Enter the six-digit code we sent. It expires in 15 minutes and locks after five wrong tries.'}
      footer={<>Have an account? <Link href="/login" className="font-bold text-[var(--color-ink)] underline decoration-[var(--color-primary)] decoration-4 underline-offset-4">Log in</Link></>}
    >
      <div className="mb-8">
        <Stepper steps={2} current={stepIndex} />
      </div>

      {stage === 'details' ? (
        <>
          <button type="button" onClick={() => void signIn('google', { callbackUrl: '/dashboard' })} className="cta-secondary w-full !py-4">
            <GoogleIcon />
            Google
          </button>
          <div className="my-7 flex items-center gap-4">
            <span className="h-px flex-1 bg-[var(--color-border)]" />
            <span className="text-xs font-bold text-[var(--color-text-muted)]">or</span>
            <span className="h-px flex-1 bg-[var(--color-border)]" />
          </div>

          <form onSubmit={handleDetails} className="grid gap-5" noValidate>
            <label className={authLabel}>
              Name
              <input required name="name" autoComplete="name" maxLength={100} value={details.name} onChange={update('name')} className="field" />
            </label>
            <label className={authLabel}>
              <span className="flex items-center gap-2"><EnvelopeIcon className="h-4 w-4" aria-hidden="true" /> Email</span>
              <input required type="email" name="email" autoComplete="email" maxLength={254} value={details.email} onChange={update('email')} className="field" />
            </label>
            <label className={authLabel}>
              Password
              <input required type="password" name="password" autoComplete="new-password" minLength={8} maxLength={128} value={details.password} onChange={update('password')} className="field" />
            </label>
            <PasswordMeter password={details.password} />
            <label className={authLabel}>
              Confirm password
              <input required type="password" name="confirmPassword" autoComplete="new-password" minLength={8} maxLength={128} value={details.confirmPassword} onChange={update('confirmPassword')} className="field" />
            </label>

            {error ? <Feedback tone="error" label={error} /> : null}
            <button type="submit" disabled={isBusy} className="cta-primary w-full !py-4">
              {isBusy ? <ArrowPathIcon className="h-5 w-5 spin" aria-hidden="true" /> : 'Continue'}
            </button>
          </form>
        </>
      ) : null}

      {stage === 'code' ? (
        <form onSubmit={handleCode} className="grid gap-6" noValidate>
          <p className="flex items-center gap-2 rounded-2xl bg-[var(--color-surface-raised)] px-4 py-3 text-sm font-semibold text-[var(--color-ink)]">
            <EnvelopeIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="truncate">{details.email}</span>
          </p>
          <OtpInput value={code} onChange={(value) => { setCode(value); setError(''); }} invalid={error === 'Code not valid'} label="Verification code" autoFocus />

          {error ? <Feedback tone="error" label={error} /> : null}
          <button type="submit" disabled={isBusy || code.length !== 6} className="cta-primary w-full !py-4">
            {isBusy ? <ArrowPathIcon className="h-5 w-5 spin" aria-hidden="true" /> : 'Verify'}
          </button>
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => { setStage('details'); setCode(''); setError(''); }} className="cta-ghost">Back</button>
            <button type="button" onClick={resend} disabled={isBusy} className="cta-ghost">Resend</button>
          </div>
        </form>
      ) : null}

      {stage === 'done' ? <Feedback tone="success" label="Welcome" /> : null}
    </AuthCard>
  );
}
