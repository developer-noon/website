'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';

const links = [
  { name: 'Features', path: '/features' },
  { name: 'How it works', path: '/process' },
  { name: 'Use cases', path: '/work' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Security', path: '/security' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const { status } = useSession();
  const pathname = usePathname().replace(/\/$/, '') || '/';
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isLoggedIn = status === 'authenticated';

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 bg-[var(--color-bg)] transition-shadow duration-300 ${isScrolled ? 'shadow-[0_1px_0_var(--color-border)]' : ''}`}>
      <nav className="page-frame flex items-center justify-between py-4" aria-label="Main">
        <Logo />

        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => {
            const active = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                aria-current={active ? 'page' : undefined}
                className={`border-b-[3px] py-1 text-base font-semibold text-[var(--color-ink)] transition-colors duration-200 ${active ? 'border-[var(--color-primary)]' : 'border-transparent hover:border-[var(--color-border-strong)]'}`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <Link href="/dashboard" className="cta-primary !px-5 !py-3 text-sm">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="cta-ghost">Log in</Link>
              <Link href="/signup" className="cta-primary !px-5 !py-3 text-sm">Sign up</Link>
            </>
          )}
        </div>

        <ThemeToggle />

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--color-ink)] md:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          <span className="relative block h-3.5 w-5" aria-hidden="true">
            <span className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-current transition-transform duration-300 ${isOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`absolute bottom-0 left-0 h-0.5 w-5 rounded bg-current transition-transform duration-300 ${isOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </span>
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={`overflow-hidden bg-[var(--color-bg)] transition-[max-height,opacity] duration-300 md:hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="flex flex-col gap-2 px-5 pb-6 pt-2">
          {links.map((link) => (
            <Link key={link.path} href={link.path} onClick={() => setIsOpen(false)} className="rounded-2xl px-4 py-3 text-lg font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-raised)]">
              {link.name}
            </Link>
          ))}
          <div className="mt-3 grid grid-cols-2 gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard" className="cta-primary col-span-2">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="cta-secondary">Log in</Link>
                <Link href="/signup" className="cta-primary">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
