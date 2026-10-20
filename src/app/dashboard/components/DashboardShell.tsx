'use client';

import {
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  BanknotesIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChevronRightIcon,
  ClockIcon,
  Cog6ToothIcon,
  DocumentChartBarIcon,
  DocumentTextIcon,
  FolderIcon,
  GlobeAltIcon,
  Squares2X2Icon,
  UserGroupIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';

type NavItem = {
  label: string;
  path: string;
  /** Tracker sections share one route and are told apart by `?tab=`. */
  tab?: string;
  Icon: typeof ClockIcon;
};

type NavGroup = { label: string; items: NavItem[] };

const TRACKER = '/dashboard/pay-structure';
const DEFAULT_TRACKER_TAB = 'hours';

/* The sidebar is the single source of truth for app structure. Breadcrumbs are derived from it too. */
const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', path: '/dashboard', Icon: Squares2X2Icon }],
  },
  {
    label: 'Time',
    items: [
      { label: 'Daily log', path: TRACKER, tab: 'hours', Icon: ClockIcon },
      { label: 'Analytics', path: TRACKER, tab: 'analytics', Icon: ChartBarIcon },
    ],
  },
  {
    label: 'Clients CRM',
    items: [
      { label: 'Clients', path: TRACKER, tab: 'clients', Icon: BriefcaseIcon },
      { label: 'Projects', path: TRACKER, tab: 'projects', Icon: FolderIcon },
      { label: 'People', path: TRACKER, tab: 'team', Icon: UsersIcon },
    ],
  },
  {
    label: 'Billing',
    items: [
      { label: 'Pay structure', path: TRACKER, tab: 'pay', Icon: BanknotesIcon },
      { label: 'Billing cycles', path: TRACKER, tab: 'income', Icon: CalendarDaysIcon },
      { label: 'Client reports', path: TRACKER, tab: 'reports', Icon: DocumentTextIcon },
      { label: 'Hours report PDF', path: '/dashboard/hours-report', Icon: DocumentChartBarIcon },
    ],
  },
  {
    label: 'Workspace',
    items: [{ label: 'Team workspace', path: '/dashboard/workspace', Icon: UserGroupIcon }],
  },
  {
    label: 'Settings',
    items: [{ label: 'Account', path: '/dashboard/account', Icon: Cog6ToothIcon }],
  },
];

const hrefOf = (item: NavItem) => (item.tab ? `${item.path}?tab=${item.tab}` : item.path);

function isActive(item: NavItem, path: string, tab: string) {
  if (item.path === '/dashboard') return path === '/dashboard';
  if (!path.startsWith(item.path)) return false;
  return item.tab ? tab === item.tab : true;
}

/** Finds the group and item for the current page, plus any extra trailing crumb. */
function breadcrumbsFor(path: string, tab: string) {
  for (const group of navGroups) {
    const item = group.items.find((candidate) => isActive(candidate, path, tab));
    if (!item) continue;
    const crumbs: { label: string; href?: string }[] = [{ label: 'Dashboard', href: '/dashboard' }];
    if (item.path !== '/dashboard') {
      crumbs.push({ label: group.label });
      crumbs.push({ label: item.label, href: hrefOf(item) });
    }
    if (path.startsWith('/dashboard/workspace/invite')) crumbs.push({ label: 'Invitation' });
    return crumbs;
  }
  return [{ label: 'Dashboard', href: '/dashboard' }];
}

type DashboardUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export default function DashboardShell({ children, user }: { children: React.ReactNode; user: DashboardUser }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  // Routes use trailing slashes (trailingSlash: true), so compare without the final slash.
  const path = pathname.replace(/\/$/, '') || '/';
  const tab = path.startsWith(TRACKER) ? searchParams.get('tab') ?? DEFAULT_TRACKER_TAB : '';
  const crumbs = breadcrumbsFor(path, tab);

  // Every page and tracker section opens at the top. Switching `?tab=` keeps the same route,
  // so Next.js would otherwise only scroll the content area into view.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [path, tab]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsMenuOpen(false);
      setIsProfileOpen(false);
    };
    const onClick = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  const initial = user.name?.trim().charAt(0).toUpperCase() || '?';

  const navigation = (
    <nav aria-label="Dashboard" className="flex flex-col gap-6">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">{group.label}</p>
          <ul className="mt-1.5 flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActive(item, path, tab);
              return (
                <li key={item.label}>
                  <Link
                    href={hrefOf(item)}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setIsMenuOpen(false)}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-200 ${active
                      ? 'bg-[var(--color-mint)] text-[var(--color-ink)]'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-ink)]'}`}
                  >
                    {active ? <span className="absolute -left-4 top-1.5 h-7 w-1 rounded-r-full bg-[var(--color-primary)] shadow-[var(--shadow-glow)]" aria-hidden="true" /> : null}
                    <item.Icon className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-[var(--color-secondary)]' : ''}`} aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="app-canvas min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-6 lg:flex">
        <div className="px-2"><Logo /></div>
        <div className="no-scrollbar mt-6 flex-1 overflow-y-auto pr-1 [mask-image:linear-gradient(to_bottom,#000_88%,transparent)]">{navigation}</div>
        <Link href="/" className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-ink)]">
          <GlobeAltIcon className="h-5 w-5" aria-hidden="true" />
          Public site
        </Link>
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 bg-black/70 transition-opacity duration-300 lg:hidden ${isMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-6 transition-transform duration-300 ease-out lg:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
      >
        <div className="flex items-center justify-between px-2">
          <Logo />
          <button type="button" onClick={() => setIsMenuOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border-strong)] text-[var(--color-ink)]" aria-label="Close menu">
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="no-scrollbar mt-6 flex-1 overflow-y-auto [mask-image:linear-gradient(to_bottom,#000_88%,transparent)]">{navigation}</div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md">
          <div className="flex h-16 items-center gap-6 px-4 sm:px-6 lg:px-10">
            <button type="button" onClick={() => setIsMenuOpen(true)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border-strong)] text-[var(--color-ink)] lg:hidden" aria-label="Open menu">
              <Bars3Icon className="h-5 w-5" aria-hidden="true" />
            </button>

            <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
              <ol className="flex items-center gap-1.5 text-sm">
                {crumbs.map((crumb, index) => {
                  const last = index === crumbs.length - 1;
                  return (
                    <li key={`${crumb.label}-${index}`} className={`min-w-0 items-center gap-1.5 ${index === 0 && crumbs.length > 2 ? 'hidden sm:flex' : 'flex'}`}>
                      {index > 0 ? <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-[var(--color-border-strong)]" aria-hidden="true" /> : null}
                      {last ? (
                        <span aria-current="page" className="truncate font-bold text-[var(--color-ink)]">{crumb.label}</span>
                      ) : crumb.href ? (
                        <Link href={crumb.href} className="truncate font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-secondary)]">{crumb.label}</Link>
                      ) : (
                        <span className="truncate font-medium text-[var(--color-text-muted)]">{crumb.label}</span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>

            <ThemeToggle />

            <div ref={profileRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsProfileOpen((value) => !value)}
                className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-1 pr-3 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-primary)]"
                aria-expanded={isProfileOpen}
                aria-haspopup="menu"
                aria-label="Account menu"
              >
                {user.image ? (
                  <Image src={user.image} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" unoptimized />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-extrabold text-[var(--color-on-primary)]" aria-hidden="true">{initial}</span>
                )}
                <span className="hidden sm:inline">{user.name?.split(' ')[0] ?? 'Me'}</span>
              </button>
              <div
                role="menu"
                className={`absolute right-0 top-12 w-64 origin-top-right rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-[var(--shadow-card)] transition-all duration-200 ${isProfileOpen ? 'scale-100 opacity-100' : 'pointer-events-none invisible scale-95 opacity-0'}`}
              >
                <div className="border-b border-[var(--color-border)] px-3 pb-3 pt-2">
                  <p className="truncate text-sm font-bold text-[var(--color-ink)]">{user.name ?? 'Signed in'}</p>
                  <p className="truncate text-xs text-[var(--color-text-muted)]">{user.email}</p>
                </div>
                <Link role="menuitem" href="/dashboard/account" onClick={() => setIsProfileOpen(false)} className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-ink)]">
                  <Cog6ToothIcon className="h-5 w-5" aria-hidden="true" />
                  Account settings
                </Link>
                <button type="button" role="menuitem" onClick={() => signOut({ callbackUrl: '/' })} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]">
                  <ArrowRightStartOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
                  Log out
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] px-4 pb-16 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
