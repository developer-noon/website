import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SiteShell from './components/SiteShell';
import SessionProvider from '@/components/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hammad Younus | Web Developer & Digital Systems Specialist',
  description: 'Portfolio and services website for Hammad Younus, covering web development, UI/UX, automation, and digital operations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.className} min-h-screen flex flex-col antialiased bg-[#FAFAF9] text-[#0B353B]`}>
        <SessionProvider>
          <SiteShell>{children}</SiteShell>
        </SessionProvider>
      </body>
    </html>
  );
}