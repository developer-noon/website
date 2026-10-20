import type { Metadata, Viewport } from 'next';
import { inter, wiseSans } from './fonts';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';
import { APP_NAME, APP_TAGLINE } from '@/lib/brand';

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} | Office hours tracking`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_TAGLINE,
  openGraph: {
    title: APP_NAME,
    description: APP_TAGLINE,
    type: 'website',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icons/apple-touch-icon.png',
  },
  applicationName: APP_NAME,
};

export const viewport: Viewport = {
  themeColor: '#9fe870',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-scroll-behavior tells Next.js to jump (not smooth-scroll) to the top on route changes.
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`${inter.variable} ${wiseSans.variable} font-sans`}>
      <head>
        {/* Applies the saved theme before first paint so dark-mode visitors don't see a light flash. */}
        <script dangerouslySetInnerHTML={{ __html: "try{if(localStorage.getItem('theme')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}" }} />
        {/* Marks repeat visits in the same session so the brand intro is skipped. */}
        <script dangerouslySetInnerHTML={{ __html: "try{if(sessionStorage.getItem('intro'))document.documentElement.dataset.intro='seen';else sessionStorage.setItem('intro','1')}catch(e){}" }} />
      </head>
      <body className="flex min-h-screen flex-col antialiased" suppressHydrationWarning>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
