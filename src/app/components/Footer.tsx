import Link from 'next/link';
import BrandMark from '@/components/BrandMark';
import { APP_NAME, APP_TAGLINE } from '@/lib/brand';

const columns = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '/features' },
      { name: 'Products', href: '/products' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Security', href: '/security' },
      { name: 'Log in', href: '/login' },
      { name: 'Sign up', href: '/signup' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'How it works', href: '/process' },
      { name: 'Use cases', href: '/work' },
      { name: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="band-forest mt-24">
      <div className="page-frame grid gap-12 py-16 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <BrandMark className="h-12 w-12" />
          <p className="mt-5 max-w-xs text-sm text-white/75">{APP_TAGLINE}</p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="font-display text-base text-[var(--color-primary)]">{column.title}</h3>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white hover:text-[var(--color-primary)]">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/15">
        <p className="page-frame py-6 text-xs text-white/70">© {new Date().getFullYear()} {APP_NAME}</p>
      </div>
    </footer>
  );
}
