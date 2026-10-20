import Link from 'next/link';
import BrandMark from '@/components/BrandMark';
import { APP_NAME } from '@/lib/brand';

/** Brand lockup: the DD monogram followed by the product name. */
export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" aria-label={`${APP_NAME} home`} className={`group inline-flex items-center gap-3 ${className}`}>
      <BrandMark className="h-10 w-10 transition-transform duration-500 group-hover:-rotate-6" />
      <span className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[var(--color-ink)]">{APP_NAME}</span>
    </Link>
  );
}
