'use client';

import { useRef } from 'react';
import { gsap, useScrollMotion } from '../gsap';
import { caseStudies } from './data';

const formatMetric = (element: HTMLElement, value: number) => `${element.dataset.prefix ?? ''}${value}${element.dataset.suffix ?? ''}`;

/**
 * Asset 3 (stacked cards with counters): each case study sticks while the next slides over it;
 * the covered card scales back and dims. Metrics count up from zero when they enter the viewport.
 */
function setup(root: HTMLElement) {
  const cards = gsap.utils.toArray<HTMLElement>('[data-case]', root);
  cards.forEach((card, index) => {
    const next = cards[index + 1];
    if (!next) return;
    gsap.to(card.querySelector('[data-case-inner]'), {
      scale: 0.92,
      // Dim with brightness, not opacity, so the covered card never shows through the one on top.
      filter: 'brightness(0.45)',
      ease: 'none',
      scrollTrigger: { trigger: next, start: 'top 70%', end: 'top top+=120', scrub: true },
    });
  });

  const counters = gsap.utils.toArray<HTMLElement>('[data-count]', root);
  counters.forEach((element) => {
    const target = Number(element.dataset.count);
    const state = { value: 0 };
    element.textContent = formatMetric(element, 0);
    gsap.to(state, {
      value: target,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: () => { element.textContent = formatMetric(element, Math.round(state.value)); },
      scrollTrigger: { trigger: element, start: 'top 85%', once: true },
    });
  });

  // Restore the real values if motion is turned off (for example, the reduced-motion setting changes).
  return () => counters.forEach((element) => { element.textContent = formatMetric(element, Number(element.dataset.count)); });
}

export default function StackedCases() {
  const scope = useRef<HTMLElement>(null);
  useScrollMotion(scope, setup);

  return (
    <section ref={scope} className="group" aria-labelledby="cases-title">
      <div className="page-frame py-20">
        <h2 id="cases-title" className="max-w-2xl">Case studies</h2>
        <ol className="mt-12 grid gap-8">
          {caseStudies.map((study, index) => (
            <li key={study.id} data-case className="group-data-[motion=on]:sticky group-data-[motion=on]:top-24">
              <article data-case-inner className="panel grid gap-10 overflow-hidden p-8 sm:p-12 lg:grid-cols-[1.3fr_1fr]" style={{ transformOrigin: 'top center' }}>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm font-bold" style={{ color: study.accent }}>{String(index + 1).padStart(2, '0')}</span>
                    {study.sample ? <span className="rounded-full bg-[var(--color-warning-bg)] px-3 py-1 text-xs font-bold text-[var(--color-warning)]">Sample data, replace before launch</span> : null}
                  </div>
                  <h3 className="mt-4 text-[clamp(1.5rem,3vw,2.2rem)]">{study.title}</h3>
                  <dl className="mt-6 grid gap-4 text-sm">
                    <div>
                      <dt className="font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Challenge</dt>
                      <dd className="mt-1 text-[var(--color-text)]">{study.challenge}</dd>
                    </div>
                    <div>
                      <dt className="font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Approach</dt>
                      <dd className="mt-1 text-[var(--color-text)]">{study.approach}</dd>
                    </div>
                  </dl>
                </div>
                <ul className="grid content-center gap-4">
                  {study.metrics.map((metric) => (
                    <li key={metric.label} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5">
                      <span
                        data-count={metric.value}
                        data-prefix={metric.prefix}
                        data-suffix={metric.suffix}
                        className="block font-mono text-4xl font-bold tabular-nums"
                        style={{ color: study.accent }}
                      >
                        {metric.prefix}{metric.value}{metric.suffix}
                      </span>
                      <span className="mt-1 block text-sm text-[var(--color-text-muted)]">{metric.label}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
