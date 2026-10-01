import { ClockIcon } from '@heroicons/react/24/outline';

export default function ClockifyPage() {
  return (
    <div className="page-frame mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="brand-card p-8 sm:p-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B353B] text-[#B9FF8F]">
          <ClockIcon className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-black/60">Dashboard</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-black sm:text-5xl">Clockify</h1>
        <p className="mt-4 max-w-2xl text-black/70">Your time-tracking workspace is ready to be connected.</p>
      </div>
    </div>
  );
}