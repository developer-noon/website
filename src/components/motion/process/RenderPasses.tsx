'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, useScrollMotion } from '../gsap';

/* One simple scene (ground, sphere, cube, cone) drawn five ways, one per render pass. */
function Scene({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" aria-hidden="true">
      {children}
    </svg>
  );
}

const passes: { key: string; label: string; note: string; art: ReactNode }[] = [
  {
    key: 'depth',
    label: 'Depth',
    note: 'Distance from camera, for focus and fog.',
    art: (
      <Scene>
        <rect width="320" height="200" fill="#163300" />
        <ellipse cx="160" cy="160" rx="140" ry="28" fill="#454745" />
        <circle cx="110" cy="112" r="38" fill="#454745" />
        <polygon points="190,90 240,90 240,145 190,145" fill="#454745" />
        <polygon points="265,150 245,150 255,108" fill="#454745" />
      </Scene>
    ),
  },
  {
    key: 'shadow',
    label: 'Shadow',
    note: 'Contact and cast shadows on their own layer.',
    art: (
      <Scene>
        <rect width="320" height="200" fill="#163300" />
        <ellipse cx="128" cy="154" rx="46" ry="10" fill="#0E0F0C" />
        <ellipse cx="226" cy="150" rx="38" ry="8" fill="#0E0F0C" />
        <ellipse cx="262" cy="152" rx="16" ry="5" fill="#0E0F0C" />
      </Scene>
    ),
  },
  {
    key: 'diffuse',
    label: 'Diffuse',
    note: 'Flat base colour with no lighting.',
    art: (
      <Scene>
        <rect width="320" height="200" fill="#163300" />
        <ellipse cx="160" cy="160" rx="140" ry="28" fill="#454745" />
        <circle cx="110" cy="112" r="38" fill="#9FE870" />
        <polygon points="190,90 240,90 240,145 190,145" fill="#FFC091" />
        <polygon points="265,150 245,150 255,108" fill="#FFC091" />
      </Scene>
    ),
  },
  {
    key: 'specular',
    label: 'Specular',
    note: 'Highlights only, added on top.',
    art: (
      <Scene>
        <rect width="320" height="200" fill="#163300" />
        <circle cx="96" cy="96" r="10" fill="#ffffff" />
        <circle cx="90" cy="90" r="4" fill="#ffffff" />
        <rect x="196" y="94" width="6" height="40" rx="3" fill="#F4F6F1" />
        <rect x="252" y="118" width="3" height="18" rx="1.5" fill="#F4F6F1" />
      </Scene>
    ),
  },
  {
    key: 'beauty',
    label: 'Beauty',
    note: 'The composited final frame.',
    art: (
      <Scene>
        <rect width="320" height="200" fill="#163300" />
        <ellipse cx="160" cy="160" rx="140" ry="28" fill="#454745" />
        <ellipse cx="128" cy="154" rx="46" ry="10" fill="#0E0F0C" />
        <ellipse cx="226" cy="150" rx="38" ry="8" fill="#0E0F0C" />
        <circle cx="110" cy="112" r="38" fill="#9FE870" />
        <circle cx="122" cy="124" r="30" fill="#8DD65F" />
        <circle cx="96" cy="96" r="10" fill="#ffffff" />
        <polygon points="190,90 240,90 240,145 190,145" fill="#FFC091" />
        <polygon points="216,90 240,90 240,145 216,145" fill="#38C8FF" />
        <rect x="196" y="94" width="6" height="40" rx="3" fill="#F4F6F1" />
        <polygon points="265,150 245,150 255,108" fill="#FFC091" />
      </Scene>
    ),
  },
];

/**
 * Asset 3 (exploded 3D stack): the passes start stacked as one picture, fan out in isometric
 * space with labels as you scroll, then fold back together into the beauty pass.
 */
function setup(root: HTMLElement) {
  const stage = root.querySelector('[data-stage]');
  const layers = gsap.utils.toArray<HTMLElement>('[data-pass]', root);
  const labels = gsap.utils.toArray<HTMLElement>('[data-pass-label]', root);
  const middle = (layers.length - 1) / 2;

  gsap.set(stage, { transformPerspective: 1400, transformStyle: 'preserve-3d' });
  gsap.set(labels, { autoAlpha: 0, x: -12 });

  const timeline = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    scrollTrigger: {
      trigger: root.querySelector('[data-pin]'),
      start: 'top top',
      end: '+=260%',
      pin: true,
      scrub: 0.8,
    },
  });

  timeline
    .to(stage, { rotationX: 58, rotationZ: -30, scale: 0.82, duration: 1 }, 0)
    .to(layers, { z: (index) => (index - middle) * 95, duration: 1, stagger: 0.04 }, 0)
    .to(labels, { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.08 }, 0.6)
    .to({}, { duration: 0.6 })
    .to(labels, { autoAlpha: 0, duration: 0.3 }, '>')
    .to(stage, { rotationX: 0, rotationZ: 0, scale: 1, duration: 1 }, '<')
    .to(layers, { z: 0, duration: 1 }, '<')
    .to(layers.slice(0, -1), { autoAlpha: 0, duration: 0.4 }, '<0.6');
}

export default function RenderPasses() {
  const scope = useRef<HTMLElement>(null);
  useScrollMotion(scope, setup);

  return (
    <section ref={scope} className="group overflow-x-clip" aria-labelledby="passes-title">
      <div data-pin className="page-frame py-20 group-data-[motion=on]:flex group-data-[motion=on]:min-h-screen group-data-[motion=on]:flex-col group-data-[motion=on]:justify-center">
        <h2 id="passes-title" className="max-w-2xl">Every frame is a stack of passes</h2>
        <p className="mt-4 max-w-xl text-[var(--color-text-muted)]">Rendering in layers lets us change a shadow or a highlight without rendering the whole shot again.</p>

        <div data-stage className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5 group-data-[motion=on]:relative group-data-[motion=on]:mx-auto group-data-[motion=on]:block group-data-[motion=on]:aspect-[16/10] group-data-[motion=on]:w-full group-data-[motion=on]:max-w-2xl">
          {passes.map((pass) => (
            <figure
              key={pass.key}
              data-pass
              className="overflow-visible group-data-[motion=on]:absolute group-data-[motion=on]:inset-0"
            >
              <div className="overflow-hidden rounded-2xl border border-[var(--color-border-strong)] shadow-[var(--shadow-card)]">{pass.art}</div>
              {/* Static layout only: inside the rotating stage the text would be skewed, so the flat legend below takes over. */}
              <figcaption className="mt-3 group-data-[motion=on]:hidden">
                <span className="block font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]">{pass.label}</span>
                <span className="mt-1 block text-sm text-[var(--color-text-muted)]">{pass.note}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <ol className="mx-auto mt-10 hidden max-w-3xl flex-wrap justify-center gap-3 group-data-[motion=on]:flex" aria-hidden="true">
          {[...passes].reverse().map((pass) => (
            <li key={pass.key} data-pass-label className="rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-2">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]">{pass.label}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
