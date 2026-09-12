import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[32px] bg-[#0B353B] p-8 text-white sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Dashboard</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
          Welcome back, {session.user.name ?? 'there'}.
        </h1>
        <p className="mt-4 max-w-2xl text-white/75">
          Your authenticated session is active and the app is ready for protected user workflows.
        </p>
      </div>
    </div>
  );
}
