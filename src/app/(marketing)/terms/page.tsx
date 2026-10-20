import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/brand';
import SplitWords from '@/components/motion/SplitWords';

export const metadata: Metadata = {
  title: 'Terms of service',
  description: `The terms that govern use of ${APP_NAME}.`,
};

export default function TermsPage() {
  return (
    <article className="page-frame pb-28 pt-20">
      <div data-fx="progress" className="fixed inset-x-0 top-0 z-[60] invisible h-1 origin-left bg-[var(--color-primary)] shadow-[var(--shadow-glow)]" aria-hidden="true" />
      <span className="eyebrow">Legal</span>
      <SplitWords as="h1" className="mt-6 block" text="Terms of service" />
      <p className="mt-4 text-sm text-[var(--color-text-muted)]">Last updated: October 2026</p>

      <div data-fx="batch" className="mt-12 space-y-10 leading-relaxed">
        <section>
          <h2 className="text-2xl">Using {APP_NAME}</h2>
          <p className="mt-4 text-[var(--color-text-muted)]">
            You must provide accurate account details and keep your password and authenticator app secure. You are responsible for activity under your account. Use the service only for tracking and reporting time you are entitled to record.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Your content</h2>
          <p className="mt-4 text-[var(--color-text-muted)]">
            The hours, clients, and reports you enter remain yours. You grant us permission to store and process them only to provide the service to you and your invited teammates.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Workspaces and invitations</h2>
          <p className="mt-4 text-[var(--color-text-muted)]">
            Workspace owners decide who they invite. Invitations expire after seven days and must be accepted with the invited email address.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Availability and changes</h2>
          <p className="mt-4 text-[var(--color-text-muted)]">
            We work to keep the service available and to protect your data, but we cannot guarantee uninterrupted access. We may change or improve features and will tell you about material changes in advance where practical.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Ending your account</h2>
          <p className="mt-4 text-[var(--color-text-muted)]">
            You can delete your account at any time from the account page. Deletion is permanent and removes the records described in our privacy policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Disclaimer and liability</h2>
          <p className="mt-4 text-[var(--color-text-muted)]">
            The service is provided as is. Payout and tax figures are estimates based on the rates and rules you configure; check them before relying on them for payment or tax filing.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Contact</h2>
          <p className="mt-4 text-[var(--color-text-muted)]">
            Questions about these terms can be sent through the <a href="/contact" className="text-[var(--color-secondary)] hover:text-[var(--color-ink)]">contact page</a>.
          </p>
        </section>
      </div>
    </article>
  );
}
