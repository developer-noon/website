import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldCheckIcon, KeyIcon, EnvelopeIcon, LockClosedIcon, ClockIcon, ServerStackIcon } from '@heroicons/react/24/outline';
import Reveal from '@/components/Reveal';
import SplitWords from '@/components/motion/SplitWords';

export const metadata: Metadata = {
  title: 'Security',
  description: 'How Deeds n Doings protects accounts: verified sign-up, two-step sign-in, rate limits, and scoped data.',
};

const controls = [
  { Icon: EnvelopeIcon, title: 'Verified sign-up', text: 'Confirm your email with a six-digit code. It expires in 15 minutes and locks after five wrong tries.' },
  { Icon: KeyIcon, title: 'Two-step sign-in', text: 'Add an authenticator app. Each code works once, and the secret is encrypted at rest.' },
  { Icon: LockClosedIcon, title: 'Safe passwords', text: 'Passwords are hashed with bcrypt. Changing one asks for your current password first.' },
  { Icon: ShieldCheckIcon, title: 'Rate limits', text: 'Sign-in, codes, resets, and messages are limited per account and per network.' },
  { Icon: ClockIcon, title: 'Short-lived links', text: 'Reset links expire in 30 minutes and work once.' },
  { Icon: ServerStackIcon, title: 'Scoped data', text: 'Every record is read and written through your signed-in account, with safe browser headers.' },
];

export default function SecurityPage() {
  return (
    <>
      <section className="band-sage">
      <div className="page-frame pb-16 pt-14 text-center">
        <div className="relative mx-auto flex h-48 w-48 items-center justify-center">
          <span data-fx="spin" data-turns="1" className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--color-primary)]/60" aria-hidden="true" />
          <span data-fx="spin" data-turns="-1.5" className="absolute inset-6 rounded-full border border-dotted border-[var(--color-secondary)]/50" aria-hidden="true" />
          <span data-fx="pop" className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-primary)] shadow-[var(--shadow-glow)]">
            <ShieldCheckIcon className="h-12 w-12 text-[var(--color-on-primary)]" aria-hidden="true" />
          </span>
        </div>
        <SplitWords as="h1" className="mx-auto mt-8 block max-w-3xl" text="Locked down, by default" />
      </div>
      </section>

      <section data-fx="batch" className="page-frame grid gap-8 py-24 md:grid-cols-2 lg:grid-cols-3">
        {controls.map(({ Icon, title, text }) => (
          <article key={title} className="brand-card h-full p-10">
            <span data-fx="pop" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-mint)] text-[var(--color-secondary)]">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-10">{title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-muted)]">{text}</p>
          </article>
        ))}
      </section>

      <section className="page-frame pb-32">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 rounded-[40px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 sm:flex-row sm:items-center sm:p-12">
            <div>
              <h2>Found an issue?</h2>
              <p className="mt-2 text-[var(--color-text-muted)]">Tell us privately first.</p>
            </div>
            <Link href="/contact" className="cta-secondary">Contact us</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
