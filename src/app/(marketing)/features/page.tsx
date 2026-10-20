import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import Reveal from '@/components/Reveal';
import SplitWords from '@/components/motion/SplitWords';
import { features } from '@/components/marketing/content';

export const metadata: Metadata = {
  title: 'Features',
  description: 'Live timer, daily log, billing cycles, reports, analytics, and payout tools for people who bill by the hour.',
};

export default function FeaturesPage() {
  return (
    <>
      <section className="band-sage">
        <div className="page-frame section-y pb-16 text-center">
          <Reveal>
            <span className="eyebrow">Features</span>
          </Reveal>
          <SplitWords as="h1" className="mx-auto mt-10 block max-w-3xl" text="Built for how office hours really work" />
          <Reveal delay={200}>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed">
              Every tool below exists for one job: turn the hours you spent on a client site into a bill you can stand behind.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="page-frame space-y-10 py-24">
        {features.map((feature, index) => {
          const flipped = index % 2 === 1;
          return (
            <article
              key={feature.title}
              data-fx={flipped ? 'slide-right' : 'slide-left'}
              className="brand-card grid items-center gap-12 p-10 sm:p-14 lg:grid-cols-2"
            >
              <div className={flipped ? 'lg:order-2' : ''}>
                <span data-fx="pop" className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                  <feature.Icon className="h-8 w-8" aria-hidden="true" />
                </span>
                <h2 className="mt-10 text-[clamp(1.8rem,3vw,2.5rem)]">{feature.title}</h2>
                <p className="mt-6 leading-relaxed text-[var(--color-text-muted)]">{feature.text}</p>
              </div>
              <ul data-fx="batch" className={`grid gap-4 rounded-[30px] bg-[var(--color-surface-raised)] p-8 ${flipped ? 'lg:order-1' : ''}`}>
                {feature.points.map((point) => (
                  <li key={point} className="flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 font-semibold text-[var(--color-ink)]">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]">
                      <CheckIcon className="h-4 w-4 text-[var(--color-on-primary)]" aria-hidden="true" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>

      <section className="page-frame pb-32">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-10 rounded-[40px] bg-[var(--color-forest)] p-10 sm:flex-row sm:items-center sm:p-16">
            <h2 className="text-[var(--color-primary)]">Ready to try it?</h2>
            <Link href="/signup" className="cta-primary !py-4 !text-base">
              Get started <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
