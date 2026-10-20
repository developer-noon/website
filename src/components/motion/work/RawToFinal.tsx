'use client';

import { useRef } from 'react';
import { gsap, useScrollMotion } from '../gsap';

const FRAMES = 240;

/* The same product shot, drawn twice: untextured blockout and final lit render. Swap in real frames later. */
function RawShot() {
  return (
    <svg viewBox="0 0 800 450" className="h-full w-full" aria-hidden="true">
      <rect width="800" height="450" fill="#163300" />
      {Array.from({ length: 11 }, (_, index) => (
        <line key={`h${index}`} x1="0" y1={300 + index * 16} x2="800" y2={300 + index * 16} stroke="#454745" strokeWidth="1" />
      ))}
      {Array.from({ length: 17 }, (_, index) => (
        <line key={`v${index}`} x1={400 + (index - 8) * 30} y1="300" x2={400 + (index - 8) * 110} y2="450" stroke="#454745" strokeWidth="1" />
      ))}
      <g fill="none" stroke="#C9D1C2" strokeWidth="2" strokeDasharray="6 6">
        <rect x="330" y="80" width="140" height="240" rx="22" />
        <rect x="346" y="104" width="108" height="180" rx="8" />
        <ellipse cx="400" cy="330" rx="150" ry="22" />
        <line x1="200" y1="40" x2="330" y2="200" />
        <line x1="600" y1="40" x2="470" y2="200" />
      </g>
      <text x="24" y="36" fill="#C9D1C2" fontFamily="ui-monospace, monospace" fontSize="14" fontWeight="600">FROM MEMORY</text>
    </svg>
  );
}

function FinalShot() {
  return (
    <svg viewBox="0 0 800 450" className="h-full w-full" aria-hidden="true">
      <rect width="800" height="450" fill="#163300" />
      <polygon points="200,0 330,200 470,200 600,0" fill="#163300" />
      <ellipse cx="400" cy="330" rx="150" ry="22" fill="#163300" />
      <ellipse cx="400" cy="326" rx="120" ry="14" fill="#9FE870" opacity="0.35" />
      <rect x="330" y="80" width="140" height="240" rx="22" fill="#F4F6F1" />
      <rect x="346" y="104" width="108" height="180" rx="8" fill="#0E0F0C" />
      <rect x="358" y="122" width="84" height="12" rx="6" fill="#9FE870" />
      <rect x="358" y="146" width="60" height="10" rx="5" fill="#454745" />
      <circle cx="400" cy="230" r="30" fill="#FFC091" />
      <rect x="452" y="84" width="10" height="230" rx="5" fill="#ffffff" opacity="0.5" />
      <text x="24" y="36" fill="#9FE870" fontFamily="ui-monospace, monospace" fontSize="14" fontWeight="600">ON SITE</text>
    </svg>
  );
}

/**
 * Asset 2 (raw-to-final scrub): scroll wipes the final render over the blockout from left to right,
 * with a divider handle and a frame counter, like scrubbing a before/after image sequence.
 */
function setup(root: HTMLElement) {
  const finalLayer = root.querySelector('[data-final]');
  const divider = root.querySelector('[data-divider]');
  const counter = root.querySelector('[data-frame]');

  const timeline = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root.querySelector('[data-pin]'),
      start: 'top top',
      end: '+=200%',
      pin: true,
      scrub: 0.5,
      onUpdate: (self) => {
        if (counter) counter.textContent = String(Math.floor(self.progress * (FRAMES - 1)) + 1).padStart(3, '0');
      },
    },
  });
  timeline
    .fromTo(finalLayer, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }, 0)
    .fromTo(divider, { left: '0%' }, { left: '100%' }, 0);
}

export default function RawToFinal() {
  const scope = useRef<HTMLElement>(null);
  useScrollMotion(scope, setup);

  return (
    <section ref={scope} className="group" aria-labelledby="raw-title">
      <div data-pin className="page-frame py-20 group-data-[motion=on]:flex group-data-[motion=on]:min-h-screen group-data-[motion=on]:flex-col group-data-[motion=on]:justify-center">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="raw-title" className="max-w-xl">From memory to a record on site</h2>
          <p className="hidden font-mono text-sm font-bold text-[var(--color-text-muted)] group-data-[motion=on]:block">
            FRAME <span data-frame className="text-[var(--color-primary)]">001</span> / {FRAMES}
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 group-data-[motion=on]:relative group-data-[motion=on]:block group-data-[motion=on]:aspect-video">
          <figure className="overflow-hidden rounded-[28px] border border-[var(--color-border-strong)] group-data-[motion=on]:absolute group-data-[motion=on]:inset-0">
            <RawShot />
            <figcaption className="sr-only">Hours reconstructed from memory at the end of the week</figcaption>
          </figure>
          <figure data-final className="overflow-hidden rounded-[28px] border border-[var(--color-border-strong)] group-data-[motion=on]:absolute group-data-[motion=on]:inset-0">
            <FinalShot />
            <figcaption className="sr-only">Hours logged on site as the day happened</figcaption>
          </figure>
          <span
            data-divider
            className="pointer-events-none absolute inset-y-0 hidden w-0.5 -translate-x-1/2 bg-[var(--color-primary)] shadow-[var(--shadow-glow)] group-data-[motion=on]:block"
            aria-hidden="true"
          >
            <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-bg)] font-mono text-xs font-bold text-[var(--color-primary)]">⇆</span>
          </span>
        </div>
      </div>
    </section>
  );
}
