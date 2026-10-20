'use client';

import { useRef } from 'react';
import { gsap, MOTION_OK_WIDE, useScrollMotion } from '../gsap';
import { showcase, type Project } from './data';

/** Generated cover art, so the layout works before real renders are added. The `data-parallax` group drifts inside the card. */
function ProjectArt({ shape, accent }: Pick<Project, 'shape' | 'accent'>) {
  const shapes: Record<Project['shape'], React.ReactNode> = {
    orbit: (
      <>
        <circle cx="200" cy="150" r="70" fill={accent} />
        <ellipse cx="200" cy="150" rx="150" ry="40" fill="none" stroke={accent} strokeWidth="3" opacity="0.6" />
        <circle cx="340" cy="140" r="12" fill="#F4F6F1" />
      </>
    ),
    grid: (
      <>
        {Array.from({ length: 16 }, (_, index) => (
          <rect key={index} x={70 + (index % 4) * 70} y={30 + Math.floor(index / 4) * 62} width="54" height="46" rx="10" fill={index % 5 === 0 ? accent : '#454745'} />
        ))}
      </>
    ),
    wave: (
      <>
        {[0, 1, 2, 3].map((row) => (
          <path key={row} d={`M0 ${110 + row * 34} Q 100 ${70 + row * 34} 200 ${110 + row * 34} T 400 ${110 + row * 34}`} fill="none" stroke={row === 1 ? accent : '#454745'} strokeWidth="10" strokeLinecap="round" />
        ))}
      </>
    ),
    stack: (
      <>
        {[0, 1, 2].map((index) => (
          <rect key={index} x={110 + index * 30} y={60 + index * 30} width="150" height="190" rx="18" fill={index === 2 ? accent : '#454745'} stroke="#0E0F0C" strokeWidth="4" />
        ))}
      </>
    ),
  };
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full" aria-hidden="true">
      <rect width="400" height="300" fill="#163300" />
      <g data-parallax>{shapes[shape]}</g>
    </svg>
  );
}

/**
 * Asset 1 (horizontal pin grid): vertical scroll drives the track sideways while the section is pinned.
 * Each cover's artwork drifts against the track for depth, and a progress bar shows where you are.
 */
function setup(root: HTMLElement) {
  const track = root.querySelector<HTMLElement>('[data-track]');
  const bar = root.querySelector('[data-progress]');
  if (!track) return;
  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

  const slide = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: root.querySelector('[data-pin]'),
      start: 'top top',
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
    },
  });

  gsap.utils.toArray<HTMLElement>('[data-card]', root).forEach((card) => {
    gsap.fromTo(card.querySelector('[data-parallax]'), { xPercent: 10 }, {
      xPercent: -10,
      ease: 'none',
      scrollTrigger: { trigger: card, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true },
    });
  });
}

export default function HorizontalShowcase() {
  const scope = useRef<HTMLElement>(null);
  useScrollMotion(scope, setup, MOTION_OK_WIDE);

  return (
    <section ref={scope} className="group overflow-x-clip" aria-labelledby="showcase-title">
      <div data-pin className="py-20 group-data-[motion=on]:flex group-data-[motion=on]:min-h-screen group-data-[motion=on]:flex-col group-data-[motion=on]:justify-center">
        <div className="page-frame flex w-full items-end justify-between gap-6">
          <h2 id="showcase-title">Selected work</h2>
          <div className="hidden h-1 w-40 overflow-hidden rounded-full bg-[var(--color-border)] group-data-[motion=on]:block" aria-hidden="true">
            <div data-progress className="h-full origin-left scale-x-0 rounded-full bg-[var(--color-primary)]" />
          </div>
        </div>

        <ul
          data-track
          className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-6 sm:px-[max(1.25rem,calc((100vw-1200px)/2+1.25rem))] group-data-[motion=on]:w-max group-data-[motion=on]:snap-none group-data-[motion=on]:overflow-visible"
        >
          {showcase.map((project) => (
            <li key={project.id} data-card className="w-[82vw] shrink-0 snap-start sm:w-[60vw] lg:w-[44vw]">
              <article className="brand-card overflow-hidden">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <ProjectArt shape={project.shape} accent={project.accent} />
                  {project.sample ? <span className="absolute left-4 top-4 rounded-full bg-[var(--color-warning-bg)] px-3 py-1 text-xs font-bold text-[var(--color-warning)]">Sample</span> : null}
                </div>
                <div className="flex items-center justify-between gap-4 p-6">
                  <div>
                    <h3>{project.title}</h3>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">{project.client} · {project.discipline}</p>
                  </div>
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: project.accent }} aria-hidden="true" />
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
