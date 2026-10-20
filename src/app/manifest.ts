import type { MetadataRoute } from 'next';
import { APP_NAME, APP_TAGLINE } from '@/lib/brand';

/** Web app manifest: name, colours, and icons used when the site is added to a home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: 'Deeds n Doings',
    description: APP_TAGLINE,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#E8EBE6',
    theme_color: '#9fe870',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
