'use client';

import { ArrowLeftIcon, Bars3Icon, ChartBarIcon, ChevronDownIcon, EnvelopeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

type DashboardUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export default function DashboardShell({ children, user }: { children: React.ReactNode; user: DashboardUser }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'newsletter';
  const isNewsletterRoute = pathname.startsWith('/dashboard/newsletter');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827]">
      {isNewsletterRoute ? <div className={`fixed inset-0 z-50 bg-[#111827]/20 transition lg:hidden ${isSidebarOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'}`} onClick={() => setIsSidebarOpen(false)} aria-hidden="true" /> : null}
      {isNewsletterRoute ? <aside className={`fixed inset-y-0 left-0 z-50 w-[248px] border-r border-[#E5E7EB] bg-white px-4 py-5 transition-transform lg:block lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-2 pb-5">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold tracking-[-0.04em] text-[#111827]">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563EB] text-white"><ChartBarIcon className="h-4 w-4" aria-hidden="true" /></span>
            Hammad<span className="text-[#2563EB]">.</span>
          </Link>
          <button type="button" className="rounded-md border border-[#D1D5DB] p-1 text-[#6B7280] lg:hidden" onClick={() => setIsSidebarOpen(false)} aria-label="Close workspace navigation"><XMarkIcon className="h-3.5 w-3.5" aria-hidden="true" /></button>
        </div>
        <nav className="mt-6 space-y-1" aria-label="Workspace navigation">
          <SidebarLink href="/dashboard/newsletter?tab=theme" icon={<EnvelopeIcon className="h-[18px] w-[18px]" aria-hidden="true" />} label="Brand theme" active={isNewsletterRoute && activeTab === 'theme'} onNavigate={() => setIsSidebarOpen(false)} />
          <SidebarLink href="/dashboard/newsletter?tab=sessions" icon={<EnvelopeIcon className="h-[18px] w-[18px]" aria-hidden="true" />} label="Sessions" active={isNewsletterRoute && activeTab === 'sessions'} onNavigate={() => setIsSidebarOpen(false)} />
          <SidebarLink href="/dashboard/newsletter?tab=submissions" icon={<EnvelopeIcon className="h-[18px] w-[18px]" aria-hidden="true" />} label="Submissions" active={isNewsletterRoute && activeTab === 'submissions'} onNavigate={() => setIsSidebarOpen(false)} />
          <SidebarLink href="/dashboard/newsletter?tab=newsletter" icon={<EnvelopeIcon className="h-[18px] w-[18px]" aria-hidden="true" />} label="Newsletter" active={isNewsletterRoute && activeTab === 'newsletter'} onNavigate={() => setIsSidebarOpen(false)} />
        </nav>
      </aside> : null}
      <header className={`sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-xl ${isNewsletterRoute ? 'lg:ml-[248px]' : ''}`}>
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className={`items-center gap-3 lg:hidden ${isNewsletterRoute ? 'flex' : 'hidden'}`}><button type="button" onClick={() => setIsSidebarOpen(true)} className="rounded-lg border border-[#D1D5DB] p-2 text-[#374151]" aria-label="Open workspace navigation"><Bars3Icon className="h-5 w-5" aria-hidden="true" /></button><span className="text-sm font-semibold text-[#111827]">Newsletter</span></div>
          <div className="hidden text-sm font-semibold text-[#6B7280] lg:block">{isNewsletterRoute ? 'Newsletter workspace' : 'Dashboard'}</div>
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
      <main className={isNewsletterRoute ? 'lg:ml-[248px]' : ''}>{children}</main>
    </div>
  );
}

function SidebarLink({ href, icon, label, active = false, onNavigate }: { href: string; icon: React.ReactNode; label: string; active?: boolean; onNavigate?: () => void }) {
  return <Link href={href} onClick={onNavigate} className={`relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? 'bg-[#EFF6FF] text-[#2563EB] before:absolute before:left-0 before:h-6 before:w-0.5 before:rounded-full before:bg-[#2563EB]' : 'text-[#374151] hover:bg-[#F3F4F6]'}`}>
    {icon}<span>{label}</span>
  </Link>;
}