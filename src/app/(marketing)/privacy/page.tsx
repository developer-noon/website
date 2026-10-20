import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/brand';
import SplitWords from '@/components/motion/SplitWords';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: `How ${APP_NAME} collects, uses, and protects personal information.`,
};

export default function PrivacyPage() {
  return (
    <article className="page-frame pb-28 pt-20">
      <div data-fx="progress" className="fixed inset-x-0 top-0 z-[60] invisible h-1 origin-left bg-[var(--color-primary)] shadow-[var(--shadow-glow)]" aria-hidden="true" />
      <span className="eyebrow">Legal</span>
      <SplitWords as="h1" className="mt-6 block" text="Privacy policy" />
      <p className="mt-4 text-sm text-[var(--color-text-muted)]">Last updated: October 2026</p>

      <div data-fx="batch" className="mt-12 space-y-10 text-[var(--color-text)] leading-relaxed">
        <section>
          <h2 className="text-2xl">What we collect</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[var(--color-text-muted)]">
            <li><strong className="text-[var(--color-text)]">Account details:</strong> name, email address, optional phone number and company, and a bcrypt hash of your password.</li>
            <li><strong className="text-[var(--color-text)]">Google sign-in:</strong> if you use Google, we receive your verified email, name, and profile picture.</li>
            <li><strong className="text-[var(--color-text)]">Your hours:</strong> dates, arrival and departure times, clients, projects, team members, tasks, and billing cycles you enter or import.</li>
            <li><strong className="text-[var(--color-text)]">Security data:</strong> the encrypted two-step verification secret, sign-in and request timestamps used for rate limits, and temporary verification and reset tokens (stored only as hashes).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl">How we use it</h2>
          <p className="mt-4 text-[var(--color-text-muted)]">
            We use this information to run your account, show your hours and reports, send verification, password, and workspace invitation emails, answer messages you send us, and keep the service secure. We do not sell personal information or use your hours for advertising.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Who sees your data</h2>
          <p className="mt-4 text-[var(--color-text-muted)]">
            Your records are visible to you and to teammates you explicitly invite into a workspace. Our service providers process data on our behalf: hosting, the MongoDB database, and Resend for transactional email. Google receives only what is needed for Google sign-in.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Keeping and deleting data</h2>
          <p className="mt-4 text-[var(--color-text-muted)]">
            You can edit your profile at any time. You can delete your account from the account page, which removes your hours, reports, memberships, and owned workspaces. Each deletion is logged with your user ID, email address, and the deletion date, but not your hours.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Your choices</h2>
          <p className="mt-4 text-[var(--color-text-muted)]">
            You can change your password, turn two-step verification on or off, and request access to or deletion of your personal information by contacting us through the contact page.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Changes</h2>
          <p className="mt-4 text-[var(--color-text-muted)]">
            If we make material changes, we will update the date above and let you know by email or in the app.
          </p>
        </section>
      </div>
    </article>
  );
}
