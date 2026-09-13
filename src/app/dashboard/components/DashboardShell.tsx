'use client';

import { ArrowLeftIcon, ChevronDownIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

type DashboardUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export default function DashboardShell({ children, user }: { children: React.ReactNode; user: DashboardUser }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F3F7F6] text-[#0B353B]">
      <header className="sticky top-0 z-40 border-b border-[#0B353B]/10 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-extrabold tracking-[-0.06em] text-[#0B353B]">
              Hammad<span className="text-[#ABFFAE]">.</span>
            </Link>
            <span className="h-6 w-px bg-[#0B353B]/10" />
            <Link href="/dashboard/newsletter" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B353B]">
              <EnvelopeIcon className="h-5 w-5" aria-hidden="true" />
              Newsletter
            </Link>
          </div>

          <div className="relative">
            <button type="button" onClick={() => setIsProfileOpen((value) => !value)} className="flex items-center gap-2 rounded-full border border-[#0B353B]/10 bg-[#FAFAF9] p-1 pr-3 text-sm font-medium" aria-expanded={isProfileOpen} aria-label="Open account menu">
              {user.image ? <Image src={user.image} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" /> : <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ABFFAE] text-xs font-bold">{user.name?.charAt(0) ?? 'U'}</span>}
              <span className="hidden sm:inline">{user.name?.split(' ')[0] ?? 'Account'}</span>
              <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
            </button>
            {isProfileOpen ? (
              <div className="absolute right-0 top-12 w-44 rounded-2xl border border-[#0B353B]/10 bg-white p-2 shadow-[0_18px_40px_rgba(12,31,35,0.12)]">
                <Link href="/" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-[#F3F7F6]">
                  <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" /> Public site
                </Link>
                <button type="button" onClick={() => signOut({ callbackUrl: '/' })} className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-[#F3F7F6]">
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}