import { ClockIcon } from '@heroicons/react/24/outline';

export default function ClockifyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-[#E5E7EB] bg-white p-8 shadow-sm sm:p-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB] text-white">
          <ClockIcon className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-black/60">Dashboard</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-black sm:text-5xl">Clockify</h1>
        <p className="mt-4 max-w-2xl text-black/70">Your time-tracking workspace is ready to be connected.</p>
      </div>
    </div>
  );
}