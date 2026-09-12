'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Bars3Icon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Portfolio', path: '/portfolio' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const isLoggedIn = status === 'authenticated';

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);

    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#0B353B]/10 bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-[1.3rem] font-extrabold tracking-[-0.05em] text-[#0B353B]">
          Hammad<span className="text-[#0B353B]">.</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className="text-sm font-medium text-[#4A5C5F] transition-colors hover:text-[#0B353B]"
            >
              {link.name}
            </Link>
          ))}

          {isLoggedIn ? (
            <div className="relative flex items-center gap-3">
              <Link href="/dashboard" className="text-sm font-medium text-[#0B353B] transition-colors hover:text-[#0B353B]">
                Dashboard
              </Link>
              <button type="button" onClick={() => setIsProfileOpen((value) => !value)} className="flex items-center gap-2 rounded-full border border-[#0B353B]/10 bg-[#FAFAF9] p-1 pr-3 text-sm font-medium text-[#0B353B] transition-colors hover:bg-[#F1F5F5]" aria-expanded={isProfileOpen} aria-label="Open profile menu">
                {session?.user?.image ? <Image src={session.user.image} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" /> : <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ABFFAE] text-xs font-bold">{session?.user?.name?.charAt(0) ?? 'U'}</span>}
                <span className="hidden lg:inline">{session?.user?.name?.split(' ')[0] ?? 'Account'}</span>
                <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
              </button>
              {isProfileOpen && <div className="absolute right-0 top-12 w-44 rounded-2xl border border-[#0B353B]/10 bg-white p-2 shadow-[0_18px_40px_rgba(12,31,35,0.12)]"><Link href="/dashboard" onClick={() => setIsProfileOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-[#0B353B] hover:bg-[#FAFAF9]">Dashboard</Link><button type="button" onClick={() => signOut({ callbackUrl: '/' })} className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#0B353B] hover:bg-[#FAFAF9]">Logout</button></div>}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/signup" className="cta-primary text-sm">
                Sign up
              </Link>
              <button type="button" onClick={handleGoogleSignIn} disabled={isGoogleSubmitting || status === 'loading'} className="rounded-full border border-[#0B353B]/10 bg-[#FAFAF9] px-4 py-2 text-sm font-medium text-[#0B353B] transition-colors hover:bg-[#F1F5F5] disabled:cursor-not-allowed disabled:opacity-60">
                {isGoogleSubmitting ? 'Connecting...' : 'Sign in with Google'}
              </button>
              <Link href="/login" className="text-sm font-medium text-[#4A5C5F] transition-colors hover:text-[#0B353B]">
                Log in
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full p-2 text-[#0B353B] transition-colors hover:bg-[#0B353B]/5 md:hidden"
          aria-label="Toggle Menu"
        >
          {isOpen ? <XMarkIcon className="h-6 w-6" aria-hidden="true" /> : <Bars3Icon className="h-6 w-6" aria-hidden="true" />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-[#0B353B]/10 bg-white px-4 pb-4 pt-3 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setIsOpen(false)}
              className="block rounded-xl px-3 py-2 text-base font-medium text-[#0B353B] transition-colors hover:bg-[#0B353B]/5"
            >
              {link.name}
            </Link>
          ))}

          {isLoggedIn ? (
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className="rounded-xl border border-[#0B353B]/10 px-3 py-2 text-center text-sm font-medium text-[#0B353B] hover:bg-[#0B353B]/5">
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: '/' });
                }}
                className="cta-primary w-full text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/signup" onClick={() => setIsOpen(false)} className="cta-primary w-full text-sm">
                Sign up
              </Link>
              <button type="button" onClick={handleGoogleSignIn} disabled={isGoogleSubmitting || status === 'loading'} className="rounded-xl border border-[#0B353B]/10 px-3 py-2 text-center text-sm font-medium text-[#0B353B] hover:bg-[#0B353B]/5 disabled:cursor-not-allowed disabled:opacity-60">
                {isGoogleSubmitting ? 'Connecting...' : 'Sign in with Google'}
              </button>
              <Link href="/login" onClick={() => setIsOpen(false)} className="rounded-xl border border-[#0B353B]/10 px-3 py-2 text-center text-sm font-medium text-[#0B353B] hover:bg-[#0B353B]/5">
                Log in
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}