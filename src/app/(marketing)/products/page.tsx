import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Reveal from '@/components/Reveal';
import SplitWords from '@/components/motion/SplitWords';
import { productModules } from '@/components/marketing/content';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Every part of Deeds n Doings, from the live timer to the printable client report.',
};

export default function ProductsPage() {
  return (
    <>
      <section className="band-sage">
        <div className="page-frame section-y pb-16">
          <Reveal>
            <span className="eyebrow">Products</span>
          </Reveal>
          <SplitWords as="h1" className="mt-10 block max-w-4xl" text="Every tool in your office hours kit" />
          <Reveal delay={200}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed">
              Eight modules that work together. Open any one from here, or start with the live timer and let the rest follow.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="page-frame section-y">
        <div data-fx="batch" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {productModules.map(({ title, text, href, Icon }) => (
            <Link key={title} href={href} className="brand-card group flex h-full flex-col p-10">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] transition-transform duration-200 group-hover:scale-110">
                <Icon className="h-7 w-7" aria-hidden="true" />
              </span>
              <h2 className="mt-10 text-[clamp(1.2rem,1.8vw,1.4rem)]">{title}</h2>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--color-text-muted)]">{text}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[var(--color-secondary)]">
                Open <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-frame pb-32">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-10 rounded-[40px] bg-[var(--color-forest)] p-10 sm:flex-row sm:items-center sm:p-16">
            <h2 className="max-w-md text-[var(--color-primary)]">New here? Start with one client</h2>
            <Link href="/signup" className="cta-primary !py-4 !text-base">Create account</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
