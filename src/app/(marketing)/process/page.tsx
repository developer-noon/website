import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Reveal from '@/components/Reveal';
import SplitWords from '@/components/motion/SplitWords';
import PipelineRail from '@/components/motion/process/PipelineRail';
import DayTimeline from '@/components/marketing/DayTimeline';

export const metadata: Metadata = {
  title: 'How it works',
  description: 'From the first clock-in at a client office to the payout that lands at the end of the billing cycle.',
};

export default function ProcessPage() {
  return (
    <>
      <section className="band-sage">
        <div className="page-frame section-y pb-16">
          <Reveal>
            <span className="eyebrow">How it works</span>
          </Reveal>
          <SplitWords as="h1" className="mt-10 block max-w-4xl" text="From first hour to final payout" />
          <Reveal delay={200}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed">
              One billing cycle, three stages. Scroll to follow a single day through the whole cycle.
            </p>
          </Reveal>
        </div>
      </section>

      <PipelineRail />

      <section className="band-soft">
        <div className="page-frame section-y grid items-center gap-16 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <SplitWords as="h2" className="block" text="What one day looks like" />
            <p className="mt-8 max-w-md leading-relaxed text-[var(--color-text-muted)]">
              Each block is one client. Arrival and departure bracket the day, so the hours you bill are the hours you were on site.
            </p>
          </div>
          <Reveal>
            <DayTimeline />
          </Reveal>
        </div>
      </section>

      <section className="page-frame pb-32">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-10 rounded-[40px] bg-[var(--color-forest)] p-10 sm:flex-row sm:items-center sm:p-16">
            <h2 className="max-w-md text-[var(--color-primary)]">Start with this month</h2>
            <Link href="/signup" className="cta-primary !py-4 !text-base">
              Get started <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
