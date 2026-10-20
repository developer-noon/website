import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import CountUp from '@/components/marketing/CountUp';
import Reveal from '@/components/Reveal';
import SplitWords from '@/components/motion/SplitWords';

/* Example statement. Hours and rates are illustrative, not customer data. */
const statement = [
  { client: 'Client A', hours: 18.5, amount: 740, share: 0.5 },
  { client: 'Client B', hours: 9, amount: 360, share: 0.25 },
  { client: 'Client C', hours: 6.25, amount: 250, share: 0.17 },
];
const total = statement.reduce((sum, row) => sum + row.amount, 0);

const steps = [
  { no: '01', text: 'Clock in at the client office' },
  { no: '02', text: 'Close the month per client' },
  { no: '03', text: 'Send the statement, get paid' },
];

/** Homepage hero: a dark, flipped band. The statement on the right is the product, shown as an invoice. */
export default function Hero() {
  return (
    <section className="band-sage relative flex min-h-[calc(100svh-5rem)] items-center overflow-hidden">
      <div className="page-frame grid items-center gap-16 py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,26rem)]">
        <div>
          <Reveal>
            <span className="eyebrow !px-5 !py-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" aria-hidden="true" />
              For consultants and agencies who work on site
            </span>
          </Reveal>

          <SplitWords as="h1" className="mt-10 block text-[clamp(2.75rem,5.5vw,4.75rem)]" text="Your hours, invoiced before you ask." />

          <Reveal delay={300}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--color-text)]">
              Log time at every client office, close the month, and send each client a clean statement. Your payout updates as you work.
            </p>
          </Reveal>

          <Reveal delay={420}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/signup" className="cta-primary !py-4 !text-base">
                Start with one client
                <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link href="/pricing" className="cta-secondary !py-4 !text-base">See pricing</Link>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <article className="panel p-6 text-[var(--color-ink)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Example statement</p>
                <p className="font-display mt-2 text-3xl">October</p>
              </div>
              <span className="rounded-full bg-[var(--color-mint)] px-3 py-1 text-xs font-bold text-[var(--color-secondary)]">Ready to send</span>
            </div>

            <ul className="mt-8 grid gap-5">
              {statement.map((row) => (
                <li key={row.client}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-semibold">{row.client}</span>
                    <span className="text-sm font-semibold text-[var(--color-text-muted)]">{row.hours} h</span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--color-border)]">
                    <div className="grow-x h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${row.share * 100}%` }} />
                  </div>
                  <p className="mt-2 text-right text-sm font-bold">
                    $<CountUp to={row.amount} duration={1400} />
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-end justify-between border-t-2 border-dashed border-[var(--color-border-strong)] pt-6">
              <span className="text-sm font-semibold text-[var(--color-text-muted)]">Total due</span>
              <span className="font-display text-4xl">
                $<CountUp to={total} duration={1800} />
              </span>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
