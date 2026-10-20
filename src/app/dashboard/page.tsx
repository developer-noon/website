import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { auth } from '@/auth';
import DayTimeline from '@/components/marketing/DayTimeline';
import { productModules } from '@/components/marketing/content';
import Reveal from '@/components/Reveal';

/* A guided path for a new user. Each step opens the place where it is done. */
const startHere = [
  { title: 'Add your first client', text: 'Clients and projects organize every hour you log.', href: '/dashboard/pay-structure?tab=clients' },
  { title: 'Log your first hours', text: 'Start the live timer on arrival, or type the day into the grid.', href: '/dashboard/pay-structure?tab=hours' },
  { title: 'Set your pay structure', text: 'Base pay, currency, and commission tiers drive your payout.', href: '/dashboard/pay-structure?tab=pay' },
  { title: 'Close a billing cycle', text: 'Lock a month so its hours become one invoice-ready cycle.', href: '/dashboard/pay-structure?tab=income' },
  { title: 'Print a client report', text: 'Turn the oldest unbilled hours into a PDF for the client.', href: '/dashboard/hours-report' },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const firstName = session.user.name?.split(' ')[0];

  return (
    <div className="mx-auto max-w-6xl py-12 sm:py-16">
      <Reveal>
        <span className="eyebrow">Dashboard</span>
        <h1 className="mt-8 text-[clamp(2.75rem,6vw,4.5rem)]">Hi{firstName ? `, ${firstName}` : ''}</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-text-muted)]">
          Here is the path from your first hour to a paid invoice. Work through it once, then it runs on its own.
        </p>
      </Reveal>

      <section className="mt-20 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <Reveal>
          <div className="brand-card p-10">
            <h2 className="text-[clamp(1.6rem,2.6vw,2rem)]">Start here</h2>
            <ol className="mt-10 grid gap-6">
              {startHere.map((step, index) => (
                <li key={step.title}>
                  <Link href={step.href} className="group flex items-start gap-5 rounded-3xl p-4 transition-colors duration-200 hover:bg-[var(--color-surface-raised)]">
                    <span className="font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg text-[var(--color-on-primary)]">
                      {index + 1}
                    </span>
                    <span className="flex-1">
                      <span className="block font-semibold text-[var(--color-ink)]">{step.title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-[var(--color-text-muted)]">{step.text}</span>
                    </span>
                    <CheckCircleIcon className="mt-3 h-5 w-5 shrink-0 text-[var(--color-border-strong)] transition-colors duration-200 group-hover:text-[var(--color-secondary)]" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="flex h-full flex-col gap-8">
            <DayTimeline />
            <p className="px-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
              The day above is an example. Your own hours appear here once you start logging.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="mt-24">
        <h2 className="text-[clamp(1.8rem,3.4vw,2.6rem)]">Your tools</h2>
        <div data-fx="batch" className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {productModules.map(({ href, title, text, Icon }) => (
            <Link key={href} href={href} className="brand-card group flex h-full flex-col p-8">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-mint)] text-[var(--color-secondary)] transition-transform duration-300 group-hover:-rotate-6">
                <Icon className="h-7 w-7" aria-hidden="true" />
              </span>
              <h3 className="mt-8 text-[clamp(1.1rem,1.6vw,1.3rem)]">{title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--color-text-muted)]">{text}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--color-secondary)]">
                Open <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
