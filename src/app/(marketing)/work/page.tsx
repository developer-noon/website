import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Reveal from '@/components/Reveal';
import SplitWords from '@/components/motion/SplitWords';
import HorizontalShowcase from '@/components/motion/work/HorizontalShowcase';
import RawToFinal from '@/components/motion/work/RawToFinal';
import StackedCases from '@/components/motion/work/StackedCases';

export const metadata: Metadata = {
  title: 'Use cases',
  description: 'How consultants, agencies, and on-site contractors use Deeds n Doings to track and bill their hours.',
};

export default function UseCasesPage() {
  return (
    <>
      <section className="band-sage">
        <div className="page-frame section-y pb-16">
          <Reveal>
            <span className="eyebrow">Use cases</span>
          </Reveal>
          <SplitWords as="h1" className="mt-10 block max-w-4xl" text="Made for the way you work on site" />
          <Reveal delay={200}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed">
              Scroll sideways through the week, see hours move from memory to a record, then read how each kind of professional sets it up.
            </p>
          </Reveal>
        </div>
      </section>

      <HorizontalShowcase />
      <RawToFinal />
      <StackedCases />

      <section className="page-frame pb-32">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-10 rounded-[40px] bg-[var(--color-forest)] p-10 sm:flex-row sm:items-center sm:p-16">
            <h2 className="max-w-md text-[var(--color-primary)]">Have a different setup?</h2>
            <Link href="/contact" className="cta-primary !py-4 !text-base">
              Talk to us <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
