'use client';

import { ArrowLeftIcon, BanknotesIcon, Bars3Icon, CalendarDaysIcon, ChartBarIcon, ChevronDownIcon, ClockIcon, EnvelopeIcon, UserGroupIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
  const isOfficeHoursRoute = pathname.startsWith('/dashboard/pay-structure');
  const hasSidebar = isNewsletterRoute || isOfficeHoursRoute;

  return (
    <div className="min-h-screen bg-[#F3F7F3] text-[#0B353B]">
      {hasSidebar ? <div className={`fixed inset-0 z-50 bg-[#111827]/20 transition lg:hidden ${isSidebarOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'}`} onClick={() => setIsSidebarOpen(false)} aria-hidden="true" /> : null}
      {hasSidebar ? <aside className={`fixed inset-y-0 left-0 z-50 w-[248px] border-r border-[#E5E7EB] bg-white px-4 py-5 transition-transform lg:block lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-2 pb-5">
          <Link href={isOfficeHoursRoute ? '/dashboard/pay-structure' : '/dashboard'} className="flex items-center gap-2 text-lg font-bold tracking-[-0.04em] text-[#0B353B]">
            <span className="flex h-7 w-7 items-center justify-center rounded-none bg-[#0B353B] text-[#B9FF8F]"><ChartBarIcon className="h-4 w-4" aria-hidden="true" /></span>
            Hammad<span className="text-[#3C853C]">.</span>
          </Link>
          <button type="button" className="rounded-none border border-[#D1D5DB] p-1 text-[#6B7280] lg:hidden" onClick={() => setIsSidebarOpen(false)} aria-label="Close workspace navigation"><XMarkIcon className="h-3.5 w-3.5" aria-hidden="true" /></button>
        </div>
        <nav className="mt-6 space-y-1" aria-label="Workspace navigation">
          {isOfficeHoursRoute ? <>
            <SidebarLink href="/dashboard" icon={<ArrowLeftIcon className="h-[18px] w-[18px]" aria-hidden="true" />} label="Back to dashboard" onNavigate={() => setIsSidebarOpen(false)} />
            <div className="my-4 border-t border-[#E5E7EB]" />
            <SidebarLink href="/dashboard/pay-structure?tab=clients" icon={<UserGroupIcon className="h-[18px] w-[18px]" aria-hidden="true" />} label="Clients" active={searchParams.get('tab') === 'clients'} onNavigate={() => setIsSidebarOpen(false)} />
            <SidebarLink href="/dashboard/pay-structure?tab=hours" icon={<ClockIcon className="h-[18px] w-[18px]" aria-hidden="true" />} label="Hours Track" active={!searchParams.get('tab') || searchParams.get('tab') === 'hours'} onNavigate={() => setIsSidebarOpen(false)} />
            <SidebarLink href="/dashboard/pay-structure?tab=pay" icon={<BanknotesIcon className="h-[18px] w-[18px]" aria-hidden="true" />} label="Pay Structure" active={searchParams.get('tab') === 'pay'} onNavigate={() => setIsSidebarOpen(false)} />
            <SidebarLink href="/dashboard/pay-structure?tab=income" icon={<CalendarDaysIcon className="h-[18px] w-[18px]" />} label="Monthly Income" active={searchParams.get('tab') === 'income'} onNavigate={() => setIsSidebarOpen(false)} />
          </> : null}
          {isNewsletterRoute ? <><SidebarLink href="/dashboard/newsletter?tab=theme" icon={<EnvelopeIcon className="h-[18px] w-[18px]" aria-hidden="true" />} label="Brand theme" active={isNewsletterRoute && activeTab === 'theme'} onNavigate={() => setIsSidebarOpen(false)} />
          <SidebarLink href="/dashboard/newsletter?tab=sessions" icon={<EnvelopeIcon className="h-[18px] w-[18px]" aria-hidden="true" />} label="Sessions" active={isNewsletterRoute && activeTab === 'sessions'} onNavigate={() => setIsSidebarOpen(false)} />
          <SidebarLink href="/dashboard/newsletter?tab=submissions" icon={<EnvelopeIcon className="h-[18px] w-[18px]" aria-hidden="true" />} label="Submissions" active={isNewsletterRoute && activeTab === 'submissions'} onNavigate={() => setIsSidebarOpen(false)} />
          <SidebarLink href="/dashboard/newsletter?tab=newsletter" icon={<EnvelopeIcon className="h-[18px] w-[18px]" aria-hidden="true" />} label="Newsletter" active={isNewsletterRoute && activeTab === 'newsletter'} onNavigate={() => setIsSidebarOpen(false)} /></> : null}
        </nav>
      </aside> : null}
      <header className={`sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-xl ${hasSidebar ? 'lg:ml-[248px]' : ''}`}>
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className={`items-center gap-3 lg:hidden ${hasSidebar ? 'flex' : 'hidden'}`}><button type="button" onClick={() => setIsSidebarOpen(true)} className="rounded-none border border-[#D1D5DB] p-2 text-[#374151]" aria-label="Open workspace navigation"><Bars3Icon className="h-5 w-5" aria-hidden="true" /></button><span className="text-sm font-semibold text-[#111827]">Newsletter</span></div>
          <div className="hidden text-sm font-semibold text-[#6B7280] lg:block">{isOfficeHoursRoute ? 'OfficeHoursTrack workspace' : isNewsletterRoute ? 'Newsletter workspace' : 'Dashboard'}</div>
          <div className="relative">
            <button type="button" onClick={() => setIsProfileOpen((value) => !value)} className="flex items-center gap-2 rounded-none border border-[#0B353B]/10 bg-[#FAFAF9] p-1 pr-3 text-sm font-medium" aria-expanded={isProfileOpen} aria-label="Open account menu">
              {user.image ? <Image src={user.image} alt="" width={32} height={32} className="h-8 w-8 rounded-none object-cover" /> : <span className="flex h-8 w-8 items-center justify-center rounded-none bg-[#ABFFAE] text-xs font-bold">{user.name?.charAt(0) ?? 'U'}</span>}
              <span className="hidden sm:inline">{user.name?.split(' ')[0] ?? 'Account'}</span>
              <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
            </button>
            {isProfileOpen ? (
              <div className="absolute right-0 top-12 w-44 rounded-none border border-[#0B353B]/10 bg-white p-2 shadow-[0_18px_40px_rgba(12,31,35,0.12)]">
                <Link href="/" className="flex items-center gap-2 rounded-none px-3 py-2 text-sm hover:bg-[#F3F7F6]">
                  <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" /> Public site
                </Link>
                <Link href="/dashboard/account" className="block rounded-none px-3 py-2 text-sm hover:bg-[#F3F7F6]">
                  Edit profile
                </Link>
                <button type="button" onClick={() => signOut({ callbackUrl: '/' })} className="w-full rounded-none px-3 py-2 text-left text-sm hover:bg-[#F3F7F6]">
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      <main className={hasSidebar ? 'lg:ml-[248px]' : ''}>{children}</main>
    </div>
  );
}

function SidebarLink({ href, icon, label, active = false, onNavigate }: { href: string; icon: React.ReactNode; label: string; active?: boolean; onNavigate?: () => void }) {
  return <Link href={href} onClick={onNavigate} className={`relative flex items-center gap-3 rounded-none px-3 py-3 text-sm font-medium transition ${active ? 'bg-[#E6F4E3] text-[#0B353B] before:absolute before:left-0 before:h-6 before:w-0.5 before:rounded-none before:bg-[#3C853C]' : 'text-[#374151] hover:bg-[#EAF2E8]'}`}>
    {icon}<span>{label}</span>
  </Link>;
}