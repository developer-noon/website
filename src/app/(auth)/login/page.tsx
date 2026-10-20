'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState, type FormEvent } from 'react';
import { ArrowPathIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon, KeyIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { AuthCard, GoogleIcon, authLabel } from '@/components/auth/AuthCard';
import OtpInput from '@/components/ui/OtpInput';
import { Feedback } from '@/components/ui/Feedback';

const errorMessages: Record<string, string> = {
  credentials: 'Wrong email or password',
  invalid_two_factor: 'Code not valid',
  rate_limited: 'Too many tries',
};

/** Only same-site relative paths are allowed, so the redirect cannot send people to another domain. */
function safeCallbackUrl() {
  const value = new URLSearchParams(window.location.search).get('callbackUrl') ?? '';
  return value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [needsCode, setNeedsCode] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        otp: needsCode ? otp : '',
        redirect: false,
      });

      if (result?.error) {
        if (result.code === 'two_factor_required') {
          setNeedsCode(true);
        } else {
          setError(errorMessages[result.code ?? ''] ?? 'Could not sign in');
          if (result.code === 'invalid_two_factor') setOtp('');
        }
        return;
      }

      router.push(safeCallbackUrl());
      router.refresh();
    } catch {
      setError('No connection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      icon={needsCode ? <ShieldCheckIcon className="h-8 w-8" aria-hidden="true" /> : <LockClosedIcon className="h-8 w-8" aria-hidden="true" />}
      title={needsCode ? 'Enter your code' : 'Welcome back'}
      subtitle={needsCode ? 'Open your authenticator app and enter the six-digit code to finish logging in.' : 'Log in to see your hours, billing cycles, and payout. Use your email and password, or continue with Google.'}
      footer={<>New here? <Link href="/signup" className="font-bold text-[var(--color-ink)] underline decoration-[var(--color-primary)] decoration-4 underline-offset-4">Sign up</Link></>}
    >
      {!needsCode ? (
        <>
          <button
            type="button"
            onClick={() => void signIn('google', { callbackUrl: safeCallbackUrl() })}
            className="cta-secondary w-full !py-4"
          >
            <GoogleIcon />
            Google
          </button>

          <div className="my-7 flex items-center gap-4">
            <span className="h-px flex-1 bg-[var(--color-border)]" />
            <span className="text-xs font-bold text-[var(--color-text-muted)]">or</span>
            <span className="h-px flex-1 bg-[var(--color-border)]" />
          </div>
        </>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
        {!needsCode ? (
          <>
            <label className={authLabel}>
              <span className="flex items-center gap-2"><EnvelopeIcon className="h-4 w-4" aria-hidden="true" /> Email</span>
              <input type="email" name="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="field" />
            </label>

            <label className={authLabel}>
              <span className="flex items-center gap-2"><KeyIcon className="h-4 w-4" aria-hidden="true" /> Password</span>
              <span className="relative block">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="field pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-[var(--color-ink)] hover:bg-[var(--color-surface-raised)]"
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" aria-hidden="true" /> : <EyeIcon className="h-5 w-5" aria-hidden="true" />}
                </button>
              </span>
            </label>
            <div className="text-right">
              <Link href="/forgot-password" className="text-sm font-bold text-[var(--color-ink)] underline decoration-[var(--color-border-strong)] underline-offset-4 hover:decoration-[var(--color-primary)]">Forgot password</Link>
            </div>
          </>
        ) : (
          <>
            <OtpInput value={otp} onChange={(value) => { setOtp(value); setError(''); }} invalid={error === 'Code not valid'} label="Authentication code" autoFocus />
            <button type="submit" disabled={isSubmitting || otp.length !== 6} className="cta-primary w-full !py-4">Verify</button>
          </>
        )}

        {error ? <Feedback tone="error" label={error} /> : null}

        {!needsCode ? (
          <button type="submit" disabled={isSubmitting || !email || !password} className="cta-primary w-full !py-4">
            {isSubmitting ? <ArrowPathIcon className="h-5 w-5 spin" aria-hidden="true" /> : 'Log in'}
          </button>
        ) : (
          <button type="button" onClick={() => { setNeedsCode(false); setOtp(''); setError(''); }} className="cta-ghost justify-center">Back</button>
        )}
      </form>
    </AuthCard>
  );
}
