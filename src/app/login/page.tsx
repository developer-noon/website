'use client';

import Link from 'next/link';
import { ArrowRightIcon, CheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { FormEvent, useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const authError = new URLSearchParams(window.location.search).get('error');
    const message = authError === 'AccessDenied'
      ? 'This Google account is not allowed to sign in. Make sure the Google email is verified.'
      : authError === 'CredentialsSignin'
        ? 'The email or password is incorrect.'
      : authError
        ? 'Google sign-in could not be completed. Please try again.'
        : '';

    const timer = window.setTimeout(() => setError(message), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (!result || result.error || !result.ok) {
        setError('The email or password is incorrect.');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    setError('');

    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch {
      setError('Google sign-in is unavailable right now. Please try again.');
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(171,255,174,0.22),_transparent_32%),linear-gradient(135deg,#f7f9f9_0%,#ffffff_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[32px] border border-[#0B353B]/10 bg-white shadow-[0_25px_80px_rgba(11,53,59,0.08)] lg:grid-cols-[1.02fr_0.98fr]">
        <section className="relative overflow-hidden bg-[#0B353B] px-6 py-10 text-white sm:px-10 sm:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(171,255,174,0.18),_transparent_35%)]" />

          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center text-[1.35rem] font-extrabold tracking-[-0.06em] text-white">
              Hammad<span className="text-[#ABFFAE]">.</span>
            </Link>

            <div className="mt-14 max-w-md">
              <span className="eyebrow border-white/10 bg-white/8 text-white">Welcome back</span>
              <h1 className="mt-6 text-4xl font-semibold tracking-[-0.07em] text-white sm:text-5xl">
                Access your workspace and move faster.
              </h1>
              <p className="mt-5 text-base text-white/75">
                Keep projects, leads, and digital workflows organized in one place with a cleaner customer experience behind the scenes.
              </p>
            </div>

            <div className="mt-12 space-y-4">
              {[
                'Track your client work and conversion journeys',
                'Manage modern landing pages and campaigns',
                'Simplify operational workflows with fewer handoffs',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#ABFFAE] text-[#0B353B]">
                    <CheckIcon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="text-sm text-white/80">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-[#F9FCFC] px-5 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4A5C5F]">Login</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-[#0B353B]">Welcome back</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#0B353B]">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-[#0B353B]/10 bg-white px-4 py-3.5 text-base text-[#0B353B] outline-none transition focus:border-[#0B353B]/30 focus:ring-4 focus:ring-[#ABFFAE]/30"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-[#0B353B]">
                    Password
                  </label>
                  <Link href="/contact" className="text-sm font-medium text-[#0B353B] underline-offset-2 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-[#0B353B]/10 bg-white px-4 py-3.5 pr-12 text-base text-[#0B353B] outline-none transition focus:border-[#0B353B]/30 focus:ring-4 focus:ring-[#ABFFAE]/30"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-3 my-auto flex items-center gap-1 text-sm font-medium text-[#4A5C5F]"
                  >
                    {showPassword ? <EyeSlashIcon className="h-4 w-4" aria-hidden="true" /> : <EyeIcon className="h-4 w-4" aria-hidden="true" />}
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm text-[#4A5C5F]">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-[#0B353B]/20 text-[#0B353B]" />
                  Remember me
                </label>
                <span>Need an account? <Link href="/signup" className="font-semibold text-[#0B353B] underline-offset-2 hover:underline">Sign up</Link></span>
              </div>

              <button type="submit" disabled={isSubmitting} className="cta-primary w-full disabled:cursor-not-allowed disabled:opacity-70">
                {isSubmitting ? 'Signing in...' : 'Sign in'}
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>

            <div className="mt-7 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-[#4A5C5F]">
              <span className="h-px flex-1 bg-[#0B353B]/10" />
              <span>or continue with</span>
              <span className="h-px flex-1 bg-[#0B353B]/10" />
            </div>

            <button type="button" onClick={handleGoogleSignIn} disabled={isGoogleSubmitting} className="mt-6 w-full rounded-2xl border border-[#0B353B]/10 bg-white px-4 py-3 text-sm font-medium text-[#0B353B] transition hover:border-[#0B353B]/20 hover:bg-[#FAFAF9] disabled:cursor-not-allowed disabled:opacity-70">
              {isGoogleSubmitting ? 'Connecting...' : 'Continue with Google'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
