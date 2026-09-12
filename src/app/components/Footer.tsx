import Link from 'next/link';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  return (
    <footer className="border-t border-[#0B353B]/10 bg-[#0B353B] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="text-[1.35rem] font-extrabold tracking-[-0.06em] text-white">
              Hammad<span className="text-[#ABFFAE]">.</span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-white/70">
              Web development, digital systems, and growth-focused design for businesses that need practical online solutions.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Navigation</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              <li><Link href="/" className="transition-colors hover:text-white">Home</Link></li>
              <li><Link href="/about" className="transition-colors hover:text-white">About</Link></li>
              <li><Link href="/services" className="transition-colors hover:text-white">Services</Link></li>
              <li><Link href="/portfolio" className="transition-colors hover:text-white">Portfolio</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Connect</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              <li><Link href="/contact" className="transition-colors hover:text-white">Contact</Link></li>
              <li><a href="mailto:hammadnoon777@gmail.com" className="inline-flex items-center gap-2 transition-colors hover:text-white"><EnvelopeIcon className="h-4 w-4" aria-hidden="true" />hammadnoon777@gmail.com</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Hammad Younus. All rights reserved.
        </div>
      </div>
    </footer>
  );
}