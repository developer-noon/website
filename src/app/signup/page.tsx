'use client';

import Link from 'next/link';
import { ArrowRightIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { FormEvent, useState } from 'react';

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: '',
    role: 'user',
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.fullName,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          phone: form.phone,
          company: form.company,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? 'Registration failed.');
        return;
      }

      const signInResult = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (!signInResult || signInResult.error || !signInResult.ok) {
        setError('Account created, but sign-in failed. Please try logging in manually.');
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(171,255,174,0.22),_transparent_32%),linear-gradient(135deg,#f7f9f9_0%,#ffffff_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[32px] border border-[#0B353B]/10 bg-white shadow-[0_25px_80px_rgba(11,53,59,0.08)] lg:grid-cols-[0.96fr_1.04fr]">
        <section className="flex items-center justify-center bg-[#F9FCFC] px-5 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4A5C5F]">Create account</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-[#0B353B]">Start building with clarity.</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div>
                <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-[#0B353B]">
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={(event) => handleChange('fullName', event.target.value)}
                  className="w-full rounded-2xl border border-[#0B353B]/10 bg-white px-4 py-3.5 text-base text-[#0B353B] outline-none transition focus:border-[#0B353B]/30 focus:ring-4 focus:ring-[#ABFFAE]/30"
                  placeholder="John Smith"
                  required
                />
              </div>

              <div>
                <label htmlFor="signup-email" className="mb-2 block text-sm font-medium text-[#0B353B]">
                  Email address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  className="w-full rounded-2xl border border-[#0B353B]/10 bg-white px-4 py-3.5 text-base text-[#0B353B] outline-none transition focus:border-[#0B353B]/30 focus:ring-4 focus:ring-[#ABFFAE]/30"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="signup-phone" className="mb-2 block text-sm font-medium text-[#0B353B]">
                    Phone
                  </label>
                  <input
                    id="signup-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(event) => handleChange('phone', event.target.value)}
                    className="w-full rounded-2xl border border-[#0B353B]/10 bg-white px-4 py-3.5 text-base text-[#0B353B] outline-none transition focus:border-[#0B353B]/30 focus:ring-4 focus:ring-[#ABFFAE]/30"
                    placeholder="+1 234 567 890"
                  />
                </div>

                <div>
                  <label htmlFor="signup-company" className="mb-2 block text-sm font-medium text-[#0B353B]">
                    Company
                  </label>
                  <input
                    id="signup-company"
                    type="text"
                    value={form.company}
                    onChange={(event) => handleChange('company', event.target.value)}
                    className="w-full rounded-2xl border border-[#0B353B]/10 bg-white px-4 py-3.5 text-base text-[#0B353B] outline-none transition focus:border-[#0B353B]/30 focus:ring-4 focus:ring-[#ABFFAE]/30"
                    placeholder="Your company"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-password" className="mb-2 block text-sm font-medium text-[#0B353B]">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(event) => handleChange('password', event.target.value)}
                    className="w-full rounded-2xl border border-[#0B353B]/10 bg-white px-4 py-3.5 pr-12 text-base text-[#0B353B] outline-none transition focus:border-[#0B353B]/30 focus:ring-4 focus:ring-[#ABFFAE]/30"
                    placeholder="Create a password"
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

              <div>
                <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-[#0B353B]">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(event) => handleChange('confirmPassword', event.target.value)}
                    className="w-full rounded-2xl border border-[#0B353B]/10 bg-white px-4 py-3.5 pr-12 text-base text-[#0B353B] outline-none transition focus:border-[#0B353B]/30 focus:ring-4 focus:ring-[#ABFFAE]/30"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute inset-y-0 right-3 my-auto flex items-center gap-1 text-sm font-medium text-[#4A5C5F]"
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="h-4 w-4" aria-hidden="true" /> : <EyeIcon className="h-4 w-4" aria-hidden="true" />}
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-3 text-sm text-[#4A5C5F]">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded border-[#0B353B]/20 text-[#0B353B]" required />
                <span>I agree to the <a href="#" className="font-semibold text-[#0B353B] underline-offset-2 hover:underline">terms</a> and <a href="#" className="font-semibold text-[#0B353B] underline-offset-2 hover:underline">privacy policy</a>.</span>
              </label>

              <button type="submit" disabled={isSubmitting} className="cta-primary w-full disabled:cursor-not-allowed disabled:opacity-70">
                {isSubmitting ? 'Creating account...' : 'Create account'}
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>

            <p className="mt-6 text-sm text-[#4A5C5F]">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[#0B353B] underline-offset-2 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#0B353B] px-6 py-10 text-white sm:px-10 sm:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(171,255,174,0.18),_transparent_35%)]" />

          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center text-[1.35rem] font-extrabold tracking-[-0.06em] text-white">
              Hammad<span className="text-[#ABFFAE]">.</span>
            </Link>

            <div className="mt-14 max-w-md">
              <span className="eyebrow border-white/10 bg-white/8 text-white">Build smarter</span>
              <h1 className="mt-6 text-4xl font-semibold tracking-[-0.07em] text-white sm:text-5xl">
                Create a workspace that feels organized from day one.
              </h1>
              <p className="mt-5 text-base text-white/75">
                Launch faster with a cleaner system for client onboarding, campaign setup, and digital operations that scale with your business.
              </p>
            </div>

            <div className="mt-12 rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Why teams choose this</p>
              <div className="mt-6 space-y-5">
                <div>
                  <div className="text-3xl font-semibold tracking-[-0.06em] text-white">+40%</div>
                  <p className="mt-2 text-sm text-white/75">More visibility into conversion and client workflows.</p>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full w-[72%] rounded-full bg-[#ABFFAE]" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
