import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import Link from 'next/link';
import { ArrowRightIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import ImageCard from '../components/ImageCard';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <ImageCard image="/images/Frame 24.svg" className="p-8 sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/60">Dashboard</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-black sm:text-5xl">
          Welcome back, {session.user.name ?? 'there'}.
        </h1>
        <p className="mt-4 max-w-2xl text-black/70">
          Build, review, and prepare your weekly customer newsletter from one focused workspace.
        </p>
      </ImageCard>
      <ImageCard image="/images/Frame 25.svg" className="mt-6 transition hover:-translate-y-0.5">
        <Link href="/dashboard/newsletter" className="flex items-center justify-between p-6">
          <span className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white"><EnvelopeIcon className="h-6 w-6" aria-hidden="true" /></span><span><strong className="block text-lg text-black">Newsletter studio</strong><span className="text-sm text-black/70">Turn a weekly brief into an ESP-ready draft.</span></span></span>
          <ArrowRightIcon className="h-5 w-5 text-black" aria-hidden="true" />
        </Link>
      </ImageCard>
    </div>
  );
}
