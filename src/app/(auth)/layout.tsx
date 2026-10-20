import { CalendarDaysIcon, ClockIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import Logo from '@/components/Logo';

/* Short reasons shown under every sign-in step. Facts match the app: email codes, two-step sign-in, scoped records. */
const reasons = [
  { Icon: ClockIcon, title: 'Log time on site', text: 'Timer or grid, filed by client.' },
  { Icon: CalendarDaysIcon, title: 'Close each cycle', text: 'One billing cycle per client.' },
  { Icon: ShieldCheckIcon, title: 'Private by default', text: 'Email codes and two-step sign-in.' },
];

/** Shared shell for sign-in, sign-up, and password pages: one centred column on the sage canvas. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-canvas flex min-h-screen flex-col">
      <header className="page-frame py-8">
        <Logo />
      </header>
      <main className="page-frame flex flex-1 flex-col items-center justify-center py-16">
        {children}
        <ul className="mt-20 grid w-full max-w-2xl gap-8 border-t border-[var(--color-border-strong)] pt-12 sm:grid-cols-3">
          {reasons.map(({ Icon, title, text }) => (
            <li key={title} className="flex flex-col gap-3">
              <Icon className="h-6 w-6 text-[var(--color-secondary)]" aria-hidden="true" />
              <span className="font-display text-xl text-[var(--color-ink)]">{title}</span>
              <span className="text-sm leading-relaxed text-[var(--color-text-muted)]">{text}</span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
