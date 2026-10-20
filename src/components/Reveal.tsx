'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, MOTION_OK, useIsomorphicLayoutEffect } from '@/components/motion/gsap';

/**
 * Rises and fades its children in with GSAP the first time they scroll into view.
 * Content is visible by default, so it still shows with reduced motion or without JavaScript.
 */
export default function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const media = gsap.matchMedia();
    media.add(MOTION_OK, () => {
      gsap.from(element, {
        autoAlpha: 0,
        y: 36,
        duration: 0.9,
        delay: delay / 1000,
        ease: 'power3.out',
        scrollTrigger: { trigger: element, start: 'top 90%', once: true },
      });
    });
    return () => media.revert();
  }, [delay]);

  return <div ref={ref} className={className}>{children}</div>;
}
