import type { ReactNode } from 'react';
import Reveal from '@/components/Reveal';
import { Feedback } from '@/components/ui/Feedback';

export const authInput = 'field';
export const authLabel = 'grid gap-2 text-sm font-bold text-[var(--color-ink)]';

/** Centered card with an icon badge. The icon sets the mood; the title says what to do. */
export function AuthCard({ title, subtitle, icon, children, footer }: { title: string; subtitle?: string; icon?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <Reveal className="w-full max-w-md">
      {icon ? <div className="mb-10 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)]">{icon}</div> : null}
      <h1 className="text-[clamp(2.75rem,6vw,3.75rem)]">{title}</h1>
      {subtitle ? <p className="mt-6 text-lg leading-relaxed text-[var(--color-text-muted)]">{subtitle}</p> : null}
      <div className="mt-12">{children}</div>
      {footer ? <div className="mt-10 border-t border-[var(--color-border)] pt-8 text-center text-sm text-[var(--color-text-muted)]">{footer}</div> : null}
    </Reveal>
  );
}

export function FormError({ message }: { message: string }) {
  return <Feedback tone="error" label={message} />;
}

export function FormNotice({ message }: { message: string }) {
  return <Feedback tone="success" label={message} />;
}

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4-5.5 4-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.8 9.1-9.2 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}
