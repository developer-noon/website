'use client';

import { useRef } from 'react';
import { BanknotesIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { gsap, useScrollMotion } from '../gsap';

const stages = [
  {
    Icon: ClockIcon,
    step: '01',
    title: 'Clock in on site',
    text: 'Start the timer when you arrive at the client office, or type the day in later. Arrival and departure are recorded with the hours.',
    deliverables: ['Live timer', 'Daily grid', 'Clockify CSV import'],
  },
  {
    Icon: UserGroupIcon,
    step: '02',
    title: 'Sort by client',
    text: 'Every entry lands under a client and project, with the team member who did the work, so each invoice starts from the right hours.',
    deliverables: ['Clients and projects', 'Team members', 'Hourly rate per client'],
  },
  {
    Icon: BanknotesIcon,
    step: '03',
    title: 'Close and get paid',
    text: 'Lock the month into a billing cycle, print a report for each client, and watch the payout follow your commission tiers.',
    deliverables: ['Monthly cycle ledger', 'Printable report', 'Payout estimate'],
  },
];

/**
 * Asset 1 (pinned timeline): the section pins for three screens of scroll.
 * A cyan rail fills left to right, each stage node lights as the rail reaches it,
 * and the stage panels hand off with a fade-and-rise.
 */
function setup(root: HTMLElement) {
  const fill = root.querySelector('[data-rail-fill]');
  const nodes = gsap.utils.toArray<HTMLElement>('[data-node-dot]', root);
  const panels = gsap.utils.toArray<HTMLElement>('[data-panel]', root);

  gsap.set(panels.slice(1), { autoAlpha: 0, y: 60 });
  gsap.set(nodes, { scale: 0 });
  gsap.set(nodes[0], { scale: 1 });

  const timeline = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: {
      trigger: root.querySelector('[data-pin]'),
      start: 'top top',
      end: '+=300%',
      pin: true,
      scrub: 0.6,
    },
  });

  timeline.fromTo(fill, { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 2 }, 0);
  panels.forEach((panel, index) => {
    if (index === 0) return;
    const at = index;
    timeline
      .to(panels[index - 1], { autoAlpha: 0, y: -60, duration: 0.4 }, at - 0.2)
      .to(panel, { autoAlpha: 1, y: 0, duration: 0.4 }, at)
      .to(nodes[index], { scale: 1, duration: 0.3, ease: 'back.out(3)' }, at - 0.05);
  });
}

export default function PipelineRail() {
  const scope = useRef<HTMLElement>(null);
  useScrollMotion(scope, setup);

  return (
    <section ref={scope} className="group" aria-labelledby="pipeline-title">
      <div data-pin className="page-frame flex flex-col justify-center py-20 group-data-[motion=on]:min-h-screen">
        <h2 id="pipeline-title" className="max-w-2xl">Three stages, one billing cycle</h2>

        {/* Rail with stage nodes */}
        <div className="relative mt-14 hidden group-data-[motion=on]:block" aria-hidden="true">
          <div className="h-1 rounded-full bg-[var(--color-border)]">
            <div data-rail-fill className="h-full origin-left rounded-full bg-[var(--color-primary)] shadow-[var(--shadow-glow)]" />
          </div>
          <div className="absolute inset-x-0 -top-3 flex justify-between">
            {stages.map((stage) => (
              <span key={stage.step} className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--color-border-strong)] bg-[var(--color-bg)]">
                <span data-node-dot className="h-3 w-3 rounded-full bg-[var(--color-primary)] shadow-[var(--shadow-glow)]" />
              </span>
            ))}
          </div>
          <div className="mt-6 flex justify-between text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            {stages.map((stage) => <span key={stage.step}>{stage.title}</span>)}
          </div>
        </div>

        {/* Panels: a grid by default, stacked in one slot when motion is on */}
        <div className="mt-12 grid gap-6 md:grid-cols-3 group-data-[motion=on]:relative group-data-[motion=on]:block group-data-[motion=on]:min-h-[34rem] group-data-[motion=on]:md:min-h-[22rem]">
          {stages.map(({ Icon, step, title, text, deliverables }) => (
            <article
              key={step}
              data-panel
              className="panel grid gap-8 p-8 group-data-[motion=on]:absolute group-data-[motion=on]:inset-0 group-data-[motion=on]:md:grid-cols-[1fr_1.1fr] group-data-[motion=on]:md:p-12"
            >
              <div>
                <span className="font-mono text-sm font-bold text-[var(--color-primary)]">{step}</span>
                <h3 className="mt-3 flex items-center gap-3 text-[clamp(1.5rem,3vw,2.4rem)]">
                  <Icon className="h-8 w-8 shrink-0 text-[var(--color-primary)]" aria-hidden="true" />
                  {title}
                </h3>
                <p className="mt-4 leading-relaxed text-[var(--color-text-muted)]">{text}</p>
              </div>
              <ul className="grid content-start gap-3">
                {deliverables.map((item) => (
                  <li key={item} className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3 text-sm font-semibold text-[var(--color-ink)]">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
