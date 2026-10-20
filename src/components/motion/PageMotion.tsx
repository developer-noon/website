'use client';

import { usePathname } from 'next/navigation';
import { gsap, MOTION_OK, ScrollTrigger, useIsomorphicLayoutEffect } from './gsap';

/**
 * One motion layer for every public page. Pages opt in with attributes, and this wires them up:
 *
 *   data-fx="words"        headline words rise in (use <SplitWords>)
 *   data-fx="batch"        direct children enter in a staggered wave as they scroll into view
 *   data-fx="pop"          icon or badge springs in
 *   data-fx="slide-left"   enters from the left (slide-right from the right)
 *   data-fx="parallax"     drifts against the scroll; data-speed (default 0.2), negative moves up
 *   data-fx="spin"         rotates with scroll position; data-turns (default 0.5)
 *   data-fx="scrub-x"      slides sideways with scroll; data-distance in % (default -30)
 *   data-fx="progress"     a bar that fills with page scroll progress (start it with the `invisible` class)
 *
 * Content is visible by default. Animations only run when reduced motion is not requested,
 * and everything is reverted when the route changes.
 */
export default function PageMotion() {
  const pathname = usePathname();

  useIsomorphicLayoutEffect(() => {
    const root = document.querySelector('main');
    if (!root) return;
    const media = gsap.matchMedia();

    media.add(MOTION_OK, () => {
      const all = (selector: string) => gsap.utils.toArray<HTMLElement>(selector, root);

      all('[data-fx="words"]').forEach((heading) => {
        gsap.from(heading.querySelectorAll('[data-word]'), {
          yPercent: 110,
          rotate: 4,
          duration: 0.9,
          ease: 'power4.out',
          stagger: 0.06,
          scrollTrigger: { trigger: heading, start: 'top 92%', once: true },
        });
      });

      all('[data-fx="batch"]').forEach((group) => {
        const items = Array.from(group.children) as HTMLElement[];
        gsap.set(items, { autoAlpha: 0, y: 48 });
        ScrollTrigger.batch(items, {
          start: 'top 92%',
          once: true,
          onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1, overwrite: true }),
        });
      });

      all('[data-fx="pop"]').forEach((element) => {
        gsap.from(element, {
          scale: 0,
          rotate: -25,
          duration: 0.8,
          ease: 'back.out(2.2)',
          scrollTrigger: { trigger: element, start: 'top 92%', once: true },
        });
      });

      all('[data-fx="slide-left"], [data-fx="slide-right"]').forEach((element) => {
        gsap.from(element, {
          x: element.dataset.fx === 'slide-left' ? -90 : 90,
          autoAlpha: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true },
        });
      });

      all('[data-fx="parallax"]').forEach((element) => {
        const speed = Number(element.dataset.speed ?? 0.2);
        gsap.to(element, {
          yPercent: speed * 100,
          ease: 'none',
          scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });

      all('[data-fx="spin"]').forEach((element) => {
        gsap.to(element, {
          rotate: 360 * Number(element.dataset.turns ?? 0.5),
          ease: 'none',
          scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });

      all('[data-fx="scrub-x"]').forEach((element) => {
        gsap.fromTo(element, { xPercent: 0 }, {
          xPercent: Number(element.dataset.distance ?? -30),
          ease: 'none',
          scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });

      all('[data-fx="progress"]').forEach((bar) => {
        gsap.fromTo(bar, { scaleX: 0, autoAlpha: 1 }, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: true },
        });
      });
    });

    ScrollTrigger.refresh();
    return () => media.revert();
  }, [pathname]);

  return null;
}
