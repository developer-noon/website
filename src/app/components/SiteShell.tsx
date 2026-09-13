'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname === '/login' || pathname === '/signup';
  const isDashboardRoute = pathname.startsWith('/dashboard');

  return (
    <>
      {!isAuthRoute && !isDashboardRoute && <Navbar />}
      <main className="flex-grow">{children}</main>
      {!isAuthRoute && !isDashboardRoute && <Footer />}
    </>
  );
}
