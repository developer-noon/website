import Link from 'next/link';
import { ArrowRightIcon, CheckIcon, MinusIcon, PlusIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import DayTimeline from '@/components/marketing/DayTimeline';
import Hero from '@/components/marketing/Hero';
import IntroSplash from '@/components/marketing/IntroSplash';
import Reveal from '@/components/Reveal';
import SplitWords from '@/components/motion/SplitWords';
import { faqs, features, personas, steps } from '@/components/marketing/content';

const band = ['Track', 'Bill', 'Report', 'Get paid', 'Track', 'Bill', 'Report', 'Get paid'];

/* Real limits from the app, shown as the trust strip. */
const trust = [
  { value: '6 digits', label: 'Sign-up codes' },
  { value: '15 min', label: 'Code validity' },
  { value: '5 tries', label: 'Before a code locks' },
  { value: '7 days', label: 'Workspace invite expiry' },
];

const protections = ['Verified sign-up by email code', 'Two-step sign-in with an authenticator app', 'Records scoped to your own account'];

export default function HomePage() {
  return (
    <>
      <IntroSplash />
      <Hero />

      {/* Scroll-scrubbed capability band */}
      <section className="overflow-hidden border-b border-[var(--color-border)] py-10" aria-hidden="true">
        <div data-fx="scrub-x" data-distance="-25" className="flex w-max gap-12 whitespace-nowrap pl-[10vw]">
          {band.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className={`font-display text-[clamp(2.5rem,7vw,5.5rem)] ${index % 2 ? 'text-[var(--color-primary)]' : 'text-transparent [-webkit-text-stroke:1.5px_var(--color-ink)]'}`}
            >
              {word}
            </span>
          ))}
        </div>
      </section>

      {/* Who it is for */}
      <section className="page-frame section-y">
        <SplitWords as="h2" className="block max-w-3xl" text="Built for people who bill by the hour" />
        <div data-fx="batch" className="mt-16 grid gap-8 lg:grid-cols-3">
          {personas.map((persona) => (
            <article key={persona.title} className="brand-card flex h-full flex-col p-10">
              <h3 className="text-[clamp(1.35rem,2vw,1.75rem)]">{persona.title}</h3>
              <p className="mt-5 leading-relaxed text-[var(--color-text-muted)]">{persona.text}</p>
              <ul className="mt-8 grid gap-4 border-t border-[var(--color-border)] pt-8">
                {persona.points.map((point) => (
                  <li key={point} className="flex items-center gap-3 text-sm font-semibold text-[var(--color-ink)]">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]">
                      <CheckIcon className="h-4 w-4 text-[var(--color-on-primary)]" aria-hidden="true" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* One day, every client */}
      <section className="band-soft">
        <div className="page-frame section-y grid items-center gap-16 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <SplitWords as="h2" className="block" text="One day, every client, one view" />
            <p className="mt-8 max-w-md leading-relaxed text-[var(--color-text-muted)]">
              Arrivals, departures, and the work between them stay in order. Each block is one client, so you always know where the day went.
            </p>
            <Link href="/features" className="cta-ghost mt-10 text-base">
              See the daily log <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <Reveal>
            <DayTimeline />
          </Reveal>
        </div>
      </section>

      {/* Trust strip: real limits from the app */}
      <section className="page-frame section-y">
        <dl data-fx="batch" className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map((item) => (
            <div key={item.label} className="border-t-2 border-[var(--color-ink)] pt-8">
              <dt className="mb-3 text-sm text-[var(--color-text)]">{item.label}</dt>
              <dd className="font-display text-[clamp(2.5rem,4.5vw,3.75rem)] text-[var(--color-ink)]">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Features */}
      <section id="features" className="page-frame section-y">
        <SplitWords as="h2" className="block max-w-2xl" text="Everything between clock-in and payout" />
        <div data-fx="batch" className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.slice(0, 6).map(({ title, text, Icon }) => (
            <article key={title} className="brand-card h-full p-10">
              <span data-fx="pop" className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                <Icon className="h-7 w-7" aria-hidden="true" />
              </span>
              <h3 className="mt-10 text-[clamp(1.25rem,2vw,1.5rem)]">{title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-muted)]">{text}</p>
            </article>
          ))}
        </div>
        <p className="mt-14 text-center">
          <Link href="/features" className="cta-ghost text-base">
            All features <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </p>
      </section>

      {/* How it works: numbered steps */}
      <section className="band-soft">
        <div className="page-frame section-y">
          <SplitWords as="h2" className="block max-w-xl" text="Three steps, every cycle" />
          <ol data-fx="batch" className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="brand-card h-full p-10">
                <span className="font-display text-[clamp(4rem,7vw,5.5rem)] text-[var(--color-secondary)]" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-10 text-[clamp(1.25rem,2vw,1.5rem)]">{step.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-muted)]">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Showcase: forest band with lime headline */}
      <section className="band-forest">
        <div className="page-frame section-y grid items-center gap-16 lg:grid-cols-[auto_1fr_auto]">
          <span className="relative flex h-24 w-24 items-center justify-center">
            <span data-fx="spin" data-turns="1" className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--color-primary)]" aria-hidden="true" />
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]">
              <ShieldCheckIcon className="h-8 w-8 text-[var(--color-on-primary)]" aria-hidden="true" />
            </span>
          </span>
          <div>
            <SplitWords as="h2" className="block" text="Your hours stay yours" />
            <ul className="mt-10 grid gap-4 sm:grid-cols-3">
              {protections.map((point) => (
                <li key={point} className="rounded-3xl border border-white/20 px-6 py-5 text-sm font-semibold text-white">
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <Link href="/security" className="cta-primary !py-4 !text-base">Security</Link>
        </div>
      </section>

      {/* FAQ: hairline rows */}
      <section className="page-frame section-y">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <SplitWords as="h2" className="block" text="Questions" />
            <p className="mt-6 text-[var(--color-text-muted)]">
              Something missing?{' '}
              <Link href="/contact" className="font-bold text-[var(--color-secondary)] underline decoration-2 underline-offset-4">Ask us</Link>
            </p>
          </div>
          <div data-fx="batch" className="border-t border-[var(--color-border)]">
            {faqs.map((faq) => (
              <details key={faq.question} className="group border-b border-[var(--color-border)] py-8">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-xl font-semibold text-[var(--color-ink)]">
                  {faq.question}
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                    <PlusIcon className="h-5 w-5 group-open:hidden" aria-hidden="true" />
                    <MinusIcon className="hidden h-5 w-5 group-open:block" aria-hidden="true" />
                  </span>
                </summary>
                <p className="mt-5 max-w-2xl leading-relaxed text-[var(--color-text-muted)]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="page-frame pb-32">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-10 rounded-[40px] bg-[var(--color-forest)] p-10 sm:flex-row sm:items-center sm:p-16">
            <h2 className="max-w-md text-[var(--color-primary)]">Start with your next hour</h2>
            <Link href="/signup" className="cta-primary !py-4 !text-base">
              Create account
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
