import type { Metadata } from 'next';
import { ShieldCheckIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Reveal from '@/components/Reveal';
import SplitWords from '@/components/motion/SplitWords';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Ask about Deeds n Doings, get account help, or report a security issue.',
};

export default function ContactPage() {
  return (
    <section className="band-sage">
    <div className="page-frame grid gap-16 pb-32 pt-16 lg:grid-cols-[1fr_1.1fr]">
      <Reveal>
        <SplitWords as="h1" className="block" text="Talk to us" />
        <div data-fx="batch" className="mt-12 space-y-6">
          <div className="flex items-center gap-4 rounded-3xl bg-[var(--color-surface-raised)] p-5">
            <UserCircleIcon className="h-8 w-8 shrink-0 text-[var(--color-ink)]" aria-hidden="true" />
            <span className="font-bold text-[var(--color-ink)]">Account help</span>
          </div>
          <div className="flex items-center gap-4 rounded-3xl bg-[var(--color-mint)] p-5">
            <ShieldCheckIcon className="h-8 w-8 shrink-0 text-[var(--color-ink)]" aria-hidden="true" />
            <span className="font-bold text-[var(--color-ink)]">Security reports</span>
          </div>
        </div>
      </Reveal>
      <Reveal delay={120}>
        <div className="panel p-6 sm:p-10">
          <ContactForm />
        </div>
      </Reveal>
    </div>
    </section>
  );
}
