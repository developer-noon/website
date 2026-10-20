import { Inter } from 'next/font/google';
import localFont from 'next/font/local';

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const wiseSans = localFont({
  src: './fonts/WISESANS-Regular.woff2',
  weight: '900',
  style: 'normal',
  variable: '--font-wise-sans',
  display: 'swap',
});
