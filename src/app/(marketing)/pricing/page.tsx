import Link from 'next/link';
import type { Metadata } from 'next';
import { CheckIcon } from '@heroicons/react/24/outline';
import Reveal from '@/components/Reveal';
import SplitWords from '@/components/motion/SplitWords';
import { billingLive, tiers } from '@/components/marketing/content';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Free to start, with Pro and Team plans for consultants and agencies who bill by the hour.',
};

export default function PricingPage() {
  return (
    <>
      <section className="band-sage">
        <div className="page-frame section-y pb-16 text-center">
          <Reveal>
            <span className="eyebrow">Pricing</span>
          </Reveal>
          <SplitWords as="h1" className="mx-auto mt-10 block max-w-3xl" text="Start free. Upgrade when clients multiply" />
          <Reveal delay={200}>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed">
              Every plan includes the live timer, the daily log, and billing cycles. Upgrade for more clients and team tools.
            </p>
          </Reveal>
          {!billingLive ? (
            <p className="mt-8 text-sm font-semibold text-[var(--color-warning)]">Preview pricing. Billing is not live yet.</p>
          ) : null}
        </div>
      </section>

      <section className="page-frame section-y">
        <div data-fx="batch" className="grid gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`relative flex h-full flex-col rounded-[40px] p-10 ${tier.highlight ? 'bg-[var(--color-forest)] text-white' : 'brand-card'}`}
            >
              {tier.highlight ? (
                <span className="absolute -top-4 left-10 rounded-full bg-[var(--color-primary)] px-4 py-1 text-xs font-bold text-[var(--color-on-primary)]">Most popular</span>
              ) : null}
              <h2 className={`text-[clamp(1.6rem,2.6vw,2.2rem)] ${tier.highlight ? 'text-[var(--color-primary)]' : ''}`}>{tier.name}</h2>
              <p className={`mt-6 leading-relaxed ${tier.highlight ? 'text-white/80' : 'text-[var(--color-text-muted)]'}`}>{tier.text}</p>
              <p className="mt-10 flex items-baseline gap-2">
                <span className={`font-display text-[clamp(3.5rem,6vw,5rem)] ${tier.highlight ? 'text-[var(--color-primary)]' : 'text-[var(--color-ink)]'}`}>{tier.price}</span>
                <span className={`text-sm font-semibold ${tier.highlight ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>{tier.period}</span>
              </p>
              <Link
                href={tier.href}
                className={`${tier.highlight ? 'cta-primary' : 'cta-secondary'} mt-10 !py-4 !text-base`}
              >
                {tier.cta}
              </Link>
              <ul className={`mt-10 grid gap-4 border-t pt-10 ${tier.highlight ? 'border-white/20' : 'border-[var(--color-border)]'}`}>
                {tier.points.map((point) => (
                  <li key={point} className={`flex items-center gap-3 text-sm font-semibold ${tier.highlight ? 'text-white' : 'text-[var(--color-ink)]'}`}>
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

      <section className="band-soft">
        <div className="page-frame section-y">
          <SplitWords as="h2" className="block max-w-2xl" text="Not sure which plan fits?" />
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--color-text-muted)]">
            Count your client sites. One or two sites fit Free. Three or more, or any month-end invoice run, usually means Pro.
          </p>
          <Link href="/contact" className="cta-secondary mt-12 !py-4 !text-base">Ask us which plan</Link>
        </div>
      </section>
    </>
  );
}
