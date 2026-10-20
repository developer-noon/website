import Link from 'next/link';
import Logo from '@/components/Logo';
import { Illustration } from '@/components/ui/EmptyState';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg-subtle)] px-5 text-center">
      <div className="absolute left-5 top-6 sm:left-8"><Logo /></div>
      <div className="float"><Illustration scene="missing" /></div>
      <p className="mt-6 text-6xl font-extrabold text-[var(--color-ink)]">404</p>
      <h1 className="mt-3 text-[clamp(1.75rem,4vw,2.25rem)]">Page not found</h1>
      <Link href="/" className="cta-primary mt-8">Home</Link>
    </div>
  );
}
